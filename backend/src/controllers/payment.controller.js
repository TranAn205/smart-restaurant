/**
 * Payment Controller
 * Handles all payment and billing business logic
 * Supports: Cash, VietQR (bank transfer), Stripe (card)
 */

const db = require("../db");
const { getIO } = require("../socket");

// Stripe initialization (optional - only if STRIPE_SECRET_KEY is set)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

// VietQR configuration
const VIETQR_CONFIG = {
  bankId: process.env.VIETQR_BANK_ID || "MB", // Mã ngân hàng
  accountNo: process.env.VIETQR_ACCOUNT_NO || "0123456789",
  accountName: process.env.VIETQR_ACCOUNT_NAME || "SMART RESTAURANT",
  template: "compact2", // QR template style
};

/**
 * GET /api/payment/tables/:tableId/bill
 * Get bill for a table (all unpaid orders)
 */
exports.getBill = async (req, res, next) => {
  try {
    const { tableId } = req.params;

    const orderRes = await db.query(`
        SELECT * FROM orders 
        WHERE table_id = $1 AND status NOT IN ('paid', 'cancelled')
    `, [tableId]);

    if (orderRes.rowCount === 0) return res.status(404).json({ message: 'No unpaid orders found' });

    const orderIds = orderRes.rows.map(o => o.id);
    const itemsRes = await db.query(`
        SELECT oi.*, m.name 
        FROM order_items oi
        JOIN menu_items m ON oi.menu_item_id = m.id
        WHERE oi.order_id = ANY($1::uuid[])
    `, [orderIds]);

    const items = itemsRes.rows;
    
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const tax = subtotal * 0.10; // VAT 10%
    const total = subtotal + tax;

    res.json({
        tableId,
        orders: orderRes.rows,
        items,
        summary: {
            subtotal,
            tax,
            total
        }
    });
  } catch (err) { next(err); }
};

/**
 * POST /api/payment/request
 * Guest requests payment (shows bill, notifies waiter)
 */
exports.requestPayment = async (req, res, next) => {
    try {
        const { tableId, orderIds } = req.body;

        if (!tableId || !orderIds || orderIds.length === 0) {
            return res.status(400).json({ message: 'Table ID and order IDs are required' });
        }

        // Get orders and verify they belong to the table
        const ordersRes = await db.query(`
            SELECT o.*, t.table_number 
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            WHERE o.id = ANY($1::uuid[]) 
            AND o.table_id = $2 
            AND o.status = 'served'
        `, [orderIds, tableId]);

        if (ordersRes.rowCount === 0) {
            return res.status(404).json({ message: 'No served orders found for this table' });
        }

        const orders = ordersRes.rows;
        const tableNumber = orders[0].table_number;

        // Get order items
        const itemsRes = await db.query(`
            SELECT oi.*, m.name 
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE oi.order_id = ANY($1::uuid[])
        `, [orderIds]);

        // Calculate subtotal from items and apply VAT
        const subtotal = itemsRes.rows.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
        const discount = orders.reduce((sum, order) => sum + parseFloat(order.discount_amount || 0), 0);
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.10; // VAT 10%
        const grandTotal = afterDiscount + tax;

        // Send notification to waiter via socket
        try {
            const io = getIO();
            io.to('role:waiter').emit('payment:requested', {
                tableId,
                tableNumber,
                orderIds,
                orders,
                items: itemsRes.rows,
                subtotal,
                discount,
                tax,
                total: grandTotal,
                requestedAt: new Date()
            });
        } catch (e) {
            console.error('Socket error:', e);
        }

        res.json({
            message: 'Payment request sent',
            orders,
            items: itemsRes.rows,
            subtotal,
            discount,
            tax,
            total: grandTotal
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/payment/orders/:id/pay
 * Process payment for an order (confirmed by waiter or auto)
 */
exports.processPayment = async (req, res, next) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { method } = req.body; // 'cash', 'momo', 'zalopay', 'stripe'

        // Update Order Status -> paid/completed
        const updateRes = await client.query(
            "UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = $1 RETURNING *",
            [id]
        );
        if (updateRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Order not found' });
        }
        const order = updateRes.rows[0];

        // Cộng điểm thưởng cho khách hàng nếu có user_id
        if (order.user_id) {
            // Quy đổi: 1 điểm cho mỗi 10.000đ (có thể điều chỉnh)
            const amount = parseFloat(order.total_amount) || 0;
            const addPoints = Math.floor(amount / 10000);
            if (addPoints > 0) {
                await client.query(
                    "UPDATE users SET total_points = COALESCE(total_points,0) + $1 WHERE id = $2",
                    [addPoints, order.user_id]
                );
            }
        }

        // Get table number
        const tableRes = await client.query(
            "SELECT table_number FROM tables WHERE id = $1",
            [order.table_id]
        );
        const tableNumber = tableRes.rows[0]?.table_number;

        // Free up the table (set status to 'active' - empty/available)
        if (order.table_id) {
            await client.query(
                "UPDATE tables SET status = 'active', updated_at = NOW() WHERE id = $1",
                [order.table_id]
            );
        }

        await client.query('COMMIT');

        // Socket: Báo cho mọi người biết đơn hàng đã được thanh toán
        try {
            const io = getIO();
            io.to(`table:${order.table_id}`).emit('order:paid', { 
                orderId: order.id, 
                tableNumber,
                message: 'Thanh toán thành công! Vui lòng đánh giá món ăn.' 
            });
            io.to('role:waiter').emit('order:paid', order);
            io.to('role:admin').emit('table:freed', { tableId: order.table_id });
        } catch (e) {
            console.error('Socket error:', e);
        }

        res.json({ message: 'Payment successful', order });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

/**
 * GET /api/payment/orders/:id/receipt
 * Get receipt for a paid order
 */
exports.getReceipt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const orderRes = await db.query(`
            SELECT o.*, t.table_number 
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            WHERE o.id = $1 AND o.status = 'paid'
        `, [id]);
        
        if (orderRes.rowCount === 0) return res.status(404).json({ message: 'Receipt not found or not paid yet' });
        const order = orderRes.rows[0];

        const itemsRes = await db.query(`
            SELECT oi.*, m.name 
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE oi.order_id = $1
        `, [id]);

        // Calculate totals with VAT
        const subtotal = itemsRes.rows.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
        const discount = parseFloat(order.discount_amount || 0);
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.10; // VAT 10%
        const total = afterDiscount + tax;

        res.json({
            restaurant: "Smart Restaurant",
            address: "123 Food Street",
            orderId: order.id,
            tableNumber: order.table_number,
            date: order.paid_at,
            items: itemsRes.rows,
            subtotal,
            discount,
            tax,
            total
        });
    } catch (err) { next(err); }
};

// ============================================
// VIETQR PAYMENT
// ============================================

/**
 * POST /api/payment/vietqr/generate
 * Generate VietQR code URL for bank transfer
 */
exports.generateVietQR = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Get order details
        const orderRes = await db.query(`
            SELECT o.*, t.table_number 
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            WHERE o.id = $1 AND o.status IN ('served', 'ready')
        `, [orderId]);

        if (orderRes.rowCount === 0) {
            return res.status(404).json({ message: 'Order not found or not ready for payment' });
        }

        const order = orderRes.rows[0];

        // Calculate total with VAT
        const itemsRes = await db.query(`
            SELECT SUM(total_price) as subtotal FROM order_items WHERE order_id = $1
        `, [orderId]);
        
        const subtotal = parseFloat(itemsRes.rows[0]?.subtotal || 0);
        const discount = parseFloat(order.discount_amount || 0);
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.10;
        const total = Math.round(afterDiscount + tax); // VietQR requires integer

        // Generate VietQR URL (using VietQR.io public API)
        const description = `SMART${order.id.slice(-6).toUpperCase()}`;
        const qrUrl = `https://img.vietqr.io/image/${VIETQR_CONFIG.bankId}-${VIETQR_CONFIG.accountNo}-${VIETQR_CONFIG.template}.png?amount=${total}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(VIETQR_CONFIG.accountName)}`;

        res.json({
            success: true,
            qrUrl,
            bankInfo: {
                bankId: VIETQR_CONFIG.bankId,
                accountNo: VIETQR_CONFIG.accountNo,
                accountName: VIETQR_CONFIG.accountName,
                amount: total,
                description,
            },
            orderId: order.id,
            tableNumber: order.table_number,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/payment/vietqr/confirm
 * Customer confirms VietQR payment (auto-confirm, notify waiter to print bill)
 */
exports.confirmVietQR = async (req, res, next) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Update order to paid
        const updateRes = await client.query(
            "UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = $1 RETURNING *",
            [orderId]
        );

        if (updateRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = updateRes.rows[0];

        // Add loyalty points if user is logged in
        if (order.user_id) {
            const amount = parseFloat(order.total_amount) || 0;
            const addPoints = Math.floor(amount / 10000);
            if (addPoints > 0) {
                await client.query(
                    "UPDATE users SET total_points = COALESCE(total_points,0) + $1 WHERE id = $2",
                    [addPoints, order.user_id]
                );
            }
        }

        // Get table info
        const tableRes = await client.query(
            "SELECT table_number FROM tables WHERE id = $1",
            [order.table_id]
        );
        const tableNumber = tableRes.rows[0]?.table_number;

        // Free up table
        if (order.table_id) {
            await client.query(
                "UPDATE tables SET status = 'active', updated_at = NOW() WHERE id = $1",
                [order.table_id]
            );
        }

        await client.query('COMMIT');

        // Notify via socket
        try {
            const io = getIO();
            // Notify guest
            io.to(`table:${order.table_id}`).emit('order:paid', {
                orderId: order.id,
                tableNumber,
                message: 'Thanh toán thành công! Vui lòng đánh giá món ăn.'
            });
            // Notify waiter to print bill (no confirmation needed)
            io.to('role:waiter').emit('payment:completed', {
                orderId: order.id,
                tableNumber,
                tableId: order.table_id,
                method: 'vietqr',
                message: `Bàn ${tableNumber} đã thanh toán chuyển khoản - In bill`
            });
            io.to('role:admin').emit('table:freed', { tableId: order.table_id });
        } catch (e) {
            console.error('Socket error:', e);
        }

        res.json({ success: true, message: 'Payment confirmed', order });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

// ============================================
// STRIPE PAYMENT
// ============================================

/**
 * POST /api/payment/stripe/create-session
 * Create Stripe Checkout Session
 */
exports.createStripeSession = async (req, res, next) => {
    try {
        if (!stripe) {
            return res.status(500).json({ message: 'Stripe is not configured' });
        }

        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Get order details
        const orderRes = await db.query(`
            SELECT o.*, t.table_number 
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            WHERE o.id = $1 AND o.status IN ('served', 'ready')
        `, [orderId]);

        if (orderRes.rowCount === 0) {
            return res.status(404).json({ message: 'Order not found or not ready for payment' });
        }

        const order = orderRes.rows[0];

        // Get order items for line items
        const itemsRes = await db.query(`
            SELECT oi.*, m.name 
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE oi.order_id = $1
        `, [orderId]);

        // Calculate total
        const subtotal = itemsRes.rows.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
        const discount = parseFloat(order.discount_amount || 0);
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.10;
        const total = Math.round((afterDiscount + tax) * 100); // Stripe uses cents

        // Create Stripe Checkout Session
        const clientUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: `Order #${orderId.slice(-6)} - Table ${order.table_number}`,
                        description: `${itemsRes.rows.length} items`,
                    },
                    unit_amount: total,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${clientUrl}/guest/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${clientUrl}/guest/payment/cancel?order_id=${orderId}`,
            metadata: {
                orderId: orderId,
                tableId: order.table_id,
                tableNumber: order.table_number,
            },
        });

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url,
        });
    } catch (err) {
        console.error('Stripe session error:', err);
        next(err);
    }
};

/**
 * POST /api/payment/stripe/webhook
 * Handle Stripe webhook events (auto-confirm payment)
 */
exports.handleStripeWebhook = async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ message: 'Stripe is not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            // For testing without webhook secret
            event = req.body;
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        const tableNumber = session.metadata?.tableNumber;
        const tableId = session.metadata?.tableId;

        if (orderId) {
            const client = await db.pool.connect();
            try {
                await client.query('BEGIN');

                // Update order to paid
                const updateRes = await client.query(
                    "UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = $1 RETURNING *",
                    [orderId]
                );

                if (updateRes.rowCount > 0) {
                    const order = updateRes.rows[0];

                    // Add loyalty points
                    if (order.user_id) {
                        const amount = parseFloat(order.total_amount) || 0;
                        const addPoints = Math.floor(amount / 10000);
                        if (addPoints > 0) {
                            await client.query(
                                "UPDATE users SET total_points = COALESCE(total_points,0) + $1 WHERE id = $2",
                                [addPoints, order.user_id]
                            );
                        }
                    }

                    // Free up table
                    if (order.table_id) {
                        await client.query(
                            "UPDATE tables SET status = 'active', updated_at = NOW() WHERE id = $1",
                            [order.table_id]
                        );
                    }

                    await client.query('COMMIT');

                    // Notify via socket
                    try {
                        const io = getIO();
                        io.to(`table:${tableId}`).emit('order:paid', {
                            orderId,
                            tableNumber,
                            message: 'Thanh toán thành công! Vui lòng đánh giá món ăn.'
                        });
                        io.to('role:waiter').emit('payment:completed', {
                            orderId,
                            tableNumber,
                            tableId,
                            method: 'stripe',
                            message: `Bàn ${tableNumber} đã thanh toán Stripe - In bill`
                        });
                        io.to('role:admin').emit('table:freed', { tableId });
                    } catch (e) {
                        console.error('Socket error:', e);
                    }

                    console.log(`✅ Stripe payment completed for order ${orderId}`);
                }
            } catch (err) {
                await client.query('ROLLBACK');
                console.error('Error processing Stripe webhook:', err);
            } finally {
                client.release();
            }
        }
    }

    res.json({ received: true });
};

/**
 * GET /api/payment/stripe/verify/:sessionId
 * Verify Stripe session status (for success page)
 */
exports.verifyStripeSession = async (req, res, next) => {
    try {
        if (!stripe) {
            return res.status(500).json({ message: 'Stripe is not configured' });
        }

        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            success: session.payment_status === 'paid',
            orderId: session.metadata?.orderId,
            tableNumber: session.metadata?.tableNumber,
            status: session.payment_status,
        });
    } catch (err) {
        next(err);
    }
};
