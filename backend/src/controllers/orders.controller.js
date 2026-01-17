/**
 * Orders Controller
 * Handles all order-related business logic
 */

const db = require("../db");
const { getIO } = require("../socket");

/**
 * GET /api/orders
 * Admin: get all orders with optional filters
 */
exports.getAll = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const params = [];

    let query = `
        SELECT o.*, t.table_number,
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'item_name', mi.name,
                 'quantity', oi.quantity,
                 'price_per_unit', oi.price_per_unit,
                 'total_price', oi.total_price,
                 'status', oi.status
               )
             ) FILTER (WHERE oi.id IS NOT NULL) as items
        FROM orders o
        LEFT JOIN tables t ON o.table_id = t.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      `;
    if (status) {
      query += ` WHERE o.status = $1`;
      params.push(status);
    }

    query += ` GROUP BY o.id, t.table_number ORDER BY o.created_at DESC LIMIT $${
      params.length + 1
    }`;
    params.push(parseInt(limit));

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/orders
 * Create a new order OR add to existing unpaid order
 */
exports.create = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    // Support both old format (table_id) and new format (tableId)
    const { table_id, tableId, items, customer_name, customerId, notes } = req.body;
    const finalTableId = tableId || table_id;

    if (!finalTableId) {
      return res.status(400).json({ message: "Missing tableId" });
    }

    const tableRes = await db.query("SELECT id, table_number FROM tables WHERE id = $1", [
      finalTableId,
    ]);
    if (tableRes.rowCount === 0)
      return res.status(404).json({ message: "Table not found" });
    const tableNumber = tableRes.rows[0].table_number;

    await client.query("BEGIN");

    // Check if there's an existing unpaid order for this table
    const existingOrderRes = await client.query(
      `SELECT id, total_amount, user_id FROM orders 
       WHERE table_id = $1 AND status NOT IN ('paid', 'cancelled')
       ORDER BY created_at DESC LIMIT 1`,
      [finalTableId]
    );

    let orderId;
    let isNewOrder = false;

    if (existingOrderRes.rowCount > 0) {
      // Add to existing order
      orderId = existingOrderRes.rows[0].id;
      console.log(`Adding items to existing order ${orderId}`);
      
      // If existing order doesn't have user_id but we have one now, update it
      const existingUserId = existingOrderRes.rows[0].user_id;
      const currentUserId = customerId || (req.customer?.userId) || null;
      
      if (!existingUserId && currentUserId) {
        await client.query(
          `UPDATE orders SET user_id = $1 WHERE id = $2`,
          [currentUserId, orderId]
        );
        console.log(`Updated order ${orderId} with user ${currentUserId}`);
      }
    } else {
      // Create new order
      isNewOrder = true;
      // Priority: customerId from body > userId from auth token > null
      const finalUserId = customerId || (req.customer?.userId) || null;
      const orderRes = await client.query(
        `INSERT INTO orders (table_id, user_id, customer_name, total_amount, notes, status) 
         VALUES ($1, $2, $3, 0, $4, 'pending') RETURNING id, created_at`,
        [
          finalTableId,
          finalUserId,
          customer_name || "Guest",
          notes,
        ]
      );
      orderId = orderRes.rows[0].id;
      console.log(`Created new order ${orderId} for user ${finalUserId}`);
    }

    let grandTotal = 0;
    const processedItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        // Support both old format (menu_item_id) and new format (itemId)
        const itemId = item.itemId || item.menu_item_id;
        const itemRes = await client.query(
          "SELECT price, name FROM menu_items WHERE id = $1",
          [itemId]
        );
        if (itemRes.rowCount === 0)
          throw new Error(`Item ${itemId} not found`);

        const basePrice = parseFloat(itemRes.rows[0].price);
        let modifiersPrice = 0;

        if (item.modifiers && Array.isArray(item.modifiers)) {
          modifiersPrice = item.modifiers.reduce(
            (sum, mod) => sum + parseFloat(mod.price || 0),
          0
        );
      }

      const unitTotal = basePrice + modifiersPrice;
      const lineTotal = unitTotal * item.quantity;
      grandTotal += lineTotal;

      processedItems.push({
        menu_item_id: itemId,
        quantity: item.quantity,
        name: itemRes.rows[0].name,
        price_per_unit: basePrice,
        total_price: lineTotal,
        modifiers_json: JSON.stringify(item.modifiers || []),
        notes: item.notes,
      });
      }

      for (const pItem of processedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, modifiers_selected, notes, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
          [
            orderId,
            pItem.menu_item_id,
            pItem.quantity,
            pItem.price_per_unit,
            pItem.total_price,
            pItem.modifiers_json,
            pItem.notes,
          ]
        );
      }
    }

    // Update total amount
    if (isNewOrder) {
      await client.query(
        "UPDATE orders SET total_amount = $1 WHERE id = $2",
        [grandTotal, orderId]
      );
    } else if (grandTotal > 0) {
      await client.query(
        "UPDATE orders SET total_amount = total_amount + $1, updated_at = NOW() WHERE id = $2",
        [grandTotal, orderId]
      );
    }

    await client.query("COMMIT");

    // --- SOCKET EMIT (REAL-TIME) ---
    if (items && items.length > 0) {
      try {
        const io = getIO();
        const eventType = isNewOrder ? "order:new" : "order:updated";
        io.to("role:waiter").emit(eventType, {
          orderId: orderId,
          tableNumber: tableNumber,
          tableId: finalTableId,
          total: grandTotal,
          items: processedItems,
          isNewOrder,
        });
        io.to(`table:${finalTableId}`).emit("order:update", {
          status: "pending",
          orderId: orderId,
        });
      } catch (sErr) {
        console.error("Socket emit error:", sErr.message);
      }
    }
    // -------------------------------

    res.status(201).json({
      data: {
        order_id: orderId,
        id: orderId,
        total: grandTotal,
        status: "pending",
        is_new_order: isNewOrder,
      },
      message: isNewOrder ? "Order placed successfully" : "Items added to existing order",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}
/**
 * PATCH /api/orders/:id/items
 * Add items to existing order
 */
exports.addItems = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const orderId = req.params.id;
    const { items } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Item list is empty" });

    await client.query("BEGIN");

    const orderRes = await client.query("SELECT * FROM orders WHERE id = $1", [
      orderId,
    ]);
    if (orderRes.rowCount === 0)
      return res.status(404).json({ message: "Order not found" });
    const currentOrder = orderRes.rows[0];

    if (["paid", "cancelled"].includes(currentOrder.status)) {
      return res
        .status(400)
        .json({ message: "Cannot add items to a paid or cancelled order" });
    }

    let additionalTotal = 0;
    const newItemsInfo = [];

    for (const item of items) {
      const itemRes = await client.query(
        "SELECT price, name FROM menu_items WHERE id = $1",
        [item.menu_item_id]
      );
      if (itemRes.rowCount === 0)
        throw new Error(`Item ${item.menu_item_id} not found`);
      
      const basePrice = parseFloat(itemRes.rows[0].price);
      let modifiersPrice = 0;
      
      if (item.modifiers && Array.isArray(item.modifiers)) {
        modifiersPrice = item.modifiers.reduce(
          (sum, mod) => sum + parseFloat(mod.price || 0),
          0
        );
      }

      const unitTotal = basePrice + modifiersPrice;
      const lineTotal = unitTotal * item.quantity;
      additionalTotal += lineTotal;

      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, modifiers_selected, notes, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
        [
          orderId,
          item.menu_item_id,
          item.quantity,
          basePrice,
          lineTotal,
          JSON.stringify(item.modifiers || []),
          item.notes,
        ]
      );
      newItemsInfo.push({
        name: itemRes.rows[0].name,
        quantity: item.quantity,
      });
    }

    const newTotal = parseFloat(currentOrder.total_amount) + additionalTotal;
    await client.query(
      "UPDATE orders SET total_amount = $1, updated_at = NOW() WHERE id = $2",
      [newTotal, orderId]
    );

    await client.query("COMMIT");

    // Socket: Báo Waiter có món thêm
    try {
      const io = getIO();
      io.to("role:waiter").emit("order:updated", {
        message: "The customer orders more dishes",
        orderId,
        newItems: newItemsInfo,
      });
    } catch (e) {
      console.error(e.message);
    }

    res.json({ message: "Items added successfully", new_total: newTotal });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

/**
 * GET /api/orders/:id
 * Get single order by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderRes = await db.query(
      `SELECT o.*, t.table_number 
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       WHERE o.id = $1`,
      [id]
    );
    if (orderRes.rowCount === 0)
      return res.status(404).json({ message: "Order not found" });

    const itemsRes = await db.query(
      `
            SELECT oi.*, 
                   mi.name as item_name,
                   mip.photo_url as item_image
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            LEFT JOIN menu_item_photos mip ON mi.id = mip.menu_item_id AND mip.is_primary = true
            WHERE oi.order_id = $1
        `,
      [id]
    );

    res.json({
      ...orderRes.rows[0],
      items: itemsRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/table/:tableId/order
 * Get orders for a table
 */
exports.getByTable = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const { rows } = await db.query(
      `
            SELECT o.*, t.table_number,
                   json_agg(
                     json_build_object(
                       'id', oi.id,
                       'item_name', mi.name,
                       'quantity', oi.quantity,
                       'price', oi.price_per_unit,
                       'total_price', oi.total_price
                     )
                   ) as items
            FROM orders o
            LEFT JOIN tables t ON o.table_id = t.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.table_id = $1 
            AND o.status NOT IN ('paid', 'cancelled')
            GROUP BY o.id, t.table_number
            ORDER BY o.created_at DESC
        `,
      [tableId]
    );

    // Return array (even if empty)
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/orders/:id/attach-customer
 * Attach customer to order for loyalty points
 */
exports.attachCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kiểm tra customer đã login chưa (từ header Authorization)
    if (!req.customer || !req.customer.userId) {
      return res.status(401).json({ message: "Customer login required" });
    }

    const userId = req.customer.userId;

    // Kiểm tra order tồn tại và chưa thanh toán
    const orderCheck = await db.query(
      "SELECT * FROM orders WHERE id = $1 AND status NOT IN ('paid', 'cancelled')",
      [id]
    );

    if (orderCheck.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Order not found or already completed" });
    }

    const order = orderCheck.rows[0];

    // Nếu order đã có customer khác thì không cho gắn
    if (order.user_id && order.user_id !== userId) {
      return res
        .status(400)
        .json({ message: "Order already assigned to another customer" });
    }

    // Gắn customer vào order
    const { rows } = await db.query(
      `UPDATE orders 
             SET user_id = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
      [userId, id]
    );

    res.json({
      message: "Customer attached to order successfully",
      order: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/orders/:id/request-bill
 * Request bill/payment from waiter (guest action)
 */
exports.requestBill = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check order exists and is not paid/cancelled
    const orderCheck = await db.query(
      "SELECT o.*, t.table_number FROM orders o LEFT JOIN tables t ON o.table_id = t.id WHERE o.id = $1",
      [id]
    );

    if (orderCheck.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderCheck.rows[0];

    if (order.status === 'paid') {
      return res.status(400).json({ message: "Order already paid" });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: "Order is cancelled" });
    }

    // Just emit socket event to waiter (no need to update DB)
    try {
      const io = getIO();
      io.to("role:waiter").emit("bill:requested", {
        orderId: id,
        tableNumber: order.table_number,
        tableId: order.table_id,
        total: order.total_amount,
        requestedAt: new Date().toISOString(),
      });
      io.to("role:admin").emit("bill:requested", {
        orderId: id,
        tableNumber: order.table_number,
        tableId: order.table_id,
      });
    } catch (sErr) {
      console.error("Socket emit error:", sErr.message);
    }

    res.json({
      message: "Bill request sent to waiter successfully",
      order_id: id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/orders/:id/discount
 * Apply discount to order (Admin/Waiter only)
 */
exports.applyDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { discountType, discountValue } = req.body;

    if (!discountType || discountValue === undefined) {
      return res.status(400).json({ message: "Discount type and value are required" });
    }

    const orderRes = await db.query("SELECT total_amount FROM orders WHERE id = $1", [id]);
    if (!finalTableId) {
      return res.status(400).json({ message: "Missing tableId" });
    }
    // Cho phép items rỗng khi tạo đơn nháp (draft)
    // Nếu items có phần tử thì mới kiểm tra và thêm vào order_items

    const total = parseFloat(orderRes.rows[0].total_amount);
    let discountAmount = 0;

    if (discountType === "percentage") {
      discountAmount = (total * parseFloat(discountValue)) / 100;
    } else if (discountType === "fixed") {
      discountAmount = parseFloat(discountValue);
    } else {
      return res.status(400).json({ message: "Invalid discount type" });
    }

    await db.query("UPDATE orders SET discount_amount = $1 WHERE id = $2", [discountAmount, id]);

    res.json({
      message: "Discount applied",
      discount_amount: discountAmount,
      new_total: total - discountAmount
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id/bill/pdf
 * Generate bill PDF with VAT and professional formatting
 */
exports.generateBillPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const PDFDocument = require("pdfkit");
    const path = require("path");

    const orderRes = await db.query(
      `SELECT o.*, t.table_number,
              json_agg(json_build_object(
                'name', mi.name, 
                'quantity', oi.quantity, 
                'price', oi.price_per_unit,
                'total', oi.total_price,
                'modifiers', oi.modifiers_selected
              )) as items
       FROM orders o
       JOIN tables t ON o.table_id = t.id
       JOIN order_items oi ON o.id = oi.order_id
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.id = $1 GROUP BY o.id, t.table_number`,
      [id]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderRes.rows[0];
    const doc = new PDFDocument({ size: 'A5', margin: 30 });

    // Register Roboto fonts for Vietnamese support
    const fontPath = path.join(__dirname, '../../public/fonts');
    doc.registerFont('Roboto', path.join(fontPath, 'Roboto-Regular.ttf'));
    doc.registerFont('Roboto-Bold', path.join(fontPath, 'Roboto-Bold.ttf'));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=bill-table-${order.table_number}-${Date.now()}.pdf`);
    doc.pipe(res);

    // Header - Restaurant Info
    doc.font('Roboto-Bold').fontSize(24).text("SMART RESTAURANT", { align: "center" });
    doc.font('Roboto').fontSize(10).text("123 Nguyễn Huệ, Quận 1, TP.HCM", { align: "center" });
    doc.text("Tel: 028 1234 5678 | MST: 0123456789", { align: "center" });
    doc.moveDown(1.5);
    
    // Bill Title
    doc.font('Roboto-Bold').fontSize(16).text("HÓA ĐƠN THANH TOÁN", { align: "center" });
    doc.moveDown(0.5);
    
    // Bill Info
    doc.font('Roboto').fontSize(11);
    doc.text(`Số hóa đơn: #${id.slice(-8).toUpperCase()}`, { align: 'left' });
    doc.text(`Bàn số: ${order.table_number}`);
    doc.text(`Ngày: ${new Date(order.created_at).toLocaleString("vi-VN")}`);
    if (order.customer_name && order.customer_name !== 'Guest') {
      doc.text(`Khách hàng: ${order.customer_name}`);
    }
    doc.moveDown(1);

    // Table Header
    doc.font('Roboto-Bold').fontSize(10);
    const tableTop = doc.y;
    doc.text("Món ăn", 50, tableTop, { width: 200, continued: false });
    doc.text("SL", 250, tableTop, { width: 40, align: 'center', continued: false });
    doc.text("Đơn giá", 290, tableTop, { width: 80, align: 'right', continued: false });
    doc.text("Thành tiền", 370, tableTop, { width: 100, align: 'right' });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(520, doc.y).stroke();
    doc.moveDown(0.5);

    // Items
    doc.font('Roboto');
    order.items.forEach((item) => {
      const y = doc.y;
      const itemName = item.name.length > 25 ? item.name.substring(0, 23) + '...' : item.name;
      doc.text(itemName, 50, y, { width: 200 });
      doc.text(item.quantity.toString(), 250, y, { width: 40, align: 'center' });
      doc.text(`${parseFloat(item.price).toLocaleString()}đ`, 290, y, { width: 80, align: 'right' });
      doc.text(`${parseFloat(item.total).toLocaleString()}đ`, 370, y, { width: 100, align: 'right' });
      doc.moveDown(0.8);
    });

    // Totals Section
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(520, doc.y).stroke();
    doc.moveDown(0.5);

    const subtotal = parseFloat(order.total_amount);
    const discount = parseFloat(order.discount_amount || 0);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * 0.10; // VAT 10%
    const total = afterDiscount + tax;

    doc.font('Roboto').fontSize(11);
    doc.text(`Tạm tính:`, 300, doc.y, { width: 120, continued: true });
    doc.text(`${subtotal.toLocaleString()}đ`, { width: 100, align: 'right' });
    
    if (discount > 0) {
      doc.text(`Giảm giá:`, 300, doc.y, { width: 120, continued: true });
      doc.text(`-${discount.toLocaleString()}đ`, { width: 100, align: 'right' });
    }
    
    doc.text(`VAT (10%):`, 300, doc.y, { width: 120, continued: true });
    doc.text(`${tax.toLocaleString()}đ`, { width: 100, align: 'right' });
    
    doc.moveDown(0.3);
    doc.moveTo(300, doc.y).lineTo(520, doc.y).stroke();
    doc.moveDown(0.3);
    
    doc.font('Roboto-Bold').fontSize(14);
    doc.text(`TỔNG CỘNG:`, 300, doc.y, { width: 120, continued: true });
    doc.text(`${total.toLocaleString()}đ`, { width: 100, align: 'right' });

    // Footer
    doc.moveDown(2);
    doc.font('Roboto').fontSize(10).fillColor('#666');
    doc.text("Cảm ơn quý khách!", { align: "center" });
    doc.text("Hẹn gặp lại!", { align: "center" });

    doc.end();
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id/bill/thermal
 * Generate ESC/POS commands for thermal printer (80mm)
 */
exports.generateThermalBill = async (req, res, next) => {
  try {
    const { id } = req.params;

    const orderRes = await db.query(
      `SELECT o.*, t.table_number,
              json_agg(json_build_object(
                'name', mi.name, 
                'quantity', oi.quantity, 
                'price', oi.price_per_unit,
                'total', oi.total_price
              )) as items
       FROM orders o
       JOIN tables t ON o.table_id = t.id
       JOIN order_items oi ON o.id = oi.order_id
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.id = $1 GROUP BY o.id, t.table_number`,
      [id]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderRes.rows[0];
    const subtotal = parseFloat(order.total_amount);
    const discount = parseFloat(order.discount_amount || 0);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * 0.10;
    const total = afterDiscount + tax;

    // Generate ESC/POS command string
    const ESC = '\x1B';
    const GS = '\x1D';
    
    let escpos = '';
    
    // Initialize printer
    escpos += `${ESC}@`; // Initialize
    escpos += `${ESC}a\x01`; // Center align
    
    // Header
    escpos += `${ESC}!\x38`; // Double height + width + bold
    escpos += 'SMART RESTAURANT\n';
    escpos += `${ESC}!\x00`; // Normal
    escpos += '123 Nguyen Hue, Q.1, HCMC\n';
    escpos += 'Tel: 028 1234 5678\n';
    escpos += '================================\n';
    
    // Bill info
    escpos += `${ESC}!\x10`; // Bold
    escpos += 'HOA DON THANH TOAN\n';
    escpos += `${ESC}!\x00`; // Normal
    escpos += `${ESC}a\x00`; // Left align
    escpos += `So HD: #${id.slice(-8).toUpperCase()}\n`;
    escpos += `Ban: ${order.table_number}\n`;
    escpos += `Ngay: ${new Date(order.created_at).toLocaleString('vi-VN')}\n`;
    escpos += '================================\n';
    
    // Items
    order.items.forEach((item) => {
      const itemName = item.name.length > 20 ? item.name.substring(0, 18) + '..' : item.name;
      const qty = item.quantity.toString().padStart(2);
      const price = parseFloat(item.total).toLocaleString().padStart(10);
      escpos += `${itemName}\n`;
      escpos += `  ${qty} x ${parseFloat(item.price).toLocaleString()}  ${price}d\n`;
    });
    
    escpos += '================================\n';
    
    // Totals
    escpos += `Tam tinh:${subtotal.toLocaleString().padStart(20)}d\n`;
    if (discount > 0) {
      escpos += `Giam gia:${('-' + discount.toLocaleString()).padStart(20)}d\n`;
    }
    escpos += `VAT (10%):${tax.toLocaleString().padStart(19)}d\n`;
    escpos += '================================\n';
    escpos += `${ESC}!\x30`; // Double height + bold
    escpos += `TONG:${total.toLocaleString().padStart(24)}d\n`;
    escpos += `${ESC}!\x00`; // Normal
    escpos += '================================\n';
    
    // Footer
    escpos += `${ESC}a\x01`; // Center
    escpos += '\nCam on quy khach!\n';
    escpos += 'Hen gap lai!\n\n\n';
    
    // Cut paper
    escpos += `${GS}V\x00`; // Full cut
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(escpos);
  } catch (err) {
    next(err);
  }
};

