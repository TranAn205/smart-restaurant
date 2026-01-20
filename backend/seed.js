// backend/seed.js - Demo Data Seeder (Optimized for Demo)
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const sslConfig = process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig
});

// ═══════════════════════════════════════════════════════════════
// DEMO DATA DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const CATEGORIES_DATA = [
    { 
        name: 'Khai vị', 
        description: 'Các món khai vị ngon miệng để bắt đầu bữa ăn',
        img: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80',
        items: [
            { name: 'Gỏi cuốn tôm thịt', description: 'Gỏi cuốn tươi ngon với tôm, thịt, bún, rau thơm', price: 45000, img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80', prepTime: 10 },
            { name: 'Chả giò giòn', description: 'Chả giò chiên vàng giòn với nhân thịt heo, mộc nhĩ', price: 50000, img: 'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?auto=format&fit=crop&w=800&q=80', prepTime: 15 },
            { name: 'Salad trộn dầu giấm', description: 'Salad rau củ tươi mát với sốt dầu giấm', price: 55000, img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80', prepTime: 8 },
            { name: 'Súp hải sản', description: 'Súp hải sản đậm đà với tôm, mực, nghêu', price: 65000, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', prepTime: 12 },
        ]
    },
    { 
        name: 'Món chính', 
        description: 'Các món chính phong phú từ Á đến Âu',
        img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        items: [
            { name: 'Phở bò Hà Nội', description: 'Phở bò truyền thống với nước dùng ninh 12 tiếng', price: 65000, img: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=800&q=80', prepTime: 15, isChefRecommended: true },
            { name: 'Bún chả Hà Nội', description: 'Bún chả thơm ngon với thịt nướng than hoa', price: 60000, img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80', prepTime: 20 },
            { name: 'Cơm gà Hội An', description: 'Cơm gà vàng ươm đặc sản Hội An', price: 70000, img: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?auto=format&fit=crop&w=800&q=80', prepTime: 18, isChefRecommended: true },
            { name: 'Bò bít tết Úc', description: 'Bò Úc 200g nướng chín vừa, kèm khoai tây', price: 220000, img: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=80', prepTime: 22, isChefRecommended: true },
            { name: 'Cá hồi nướng teriyaki', description: 'Cá hồi Na Uy với sốt teriyaki đặc biệt', price: 180000, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80', prepTime: 25 },
            { name: 'Mì Quảng tôm thịt', description: 'Mì Quảng đặc sản với tôm tươi, thịt heo', price: 75000, img: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80', prepTime: 20 },
        ]
    },
    { 
        name: 'Đồ uống', 
        description: 'Thức uống tươi mát và thơm ngon',
        img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
        items: [
            { name: 'Trà sữa trân châu', description: 'Trà sữa Đài Loan với trân châu đường đen', price: 45000, img: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80', prepTime: 8 },
            { name: 'Cà phê sữa đá', description: 'Cà phê phin truyền thống với sữa đặc', price: 35000, img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', prepTime: 10 },
            { name: 'Sinh tố bơ', description: 'Sinh tố bơ sánh mịn, béo ngậy', price: 40000, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
            { name: 'Nước ép cam tươi', description: 'Nước cam vắt tươi 100%', price: 35000, img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
        ]
    },
    { 
        name: 'Tráng miệng', 
        description: 'Các món tráng miệng ngọt ngào',
        img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
        items: [
            { name: 'Tiramisu Ý', description: 'Bánh Tiramisu với cà phê Espresso', price: 65000, img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80', prepTime: 5, isChefRecommended: true },
            { name: 'Chè Thái', description: 'Chè Thái 7 màu với dừa tươi, thạch', price: 45000, img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', prepTime: 8 },
            { name: 'Bánh Flan caramel', description: 'Bánh Flan mềm mịn với caramel', price: 35000, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
        ]
    },
];

const SAMPLE_REVIEWS = [
    { rating: 5, comment: 'Món ăn rất ngon, phục vụ tận tình! Sẽ quay lại lần sau.' },
    { rating: 5, comment: 'Phở ngon nhất Sài Gòn, nước dùng đậm đà!' },
    { rating: 4, comment: 'Đồ ăn ngon, không gian đẹp. Giá hơi cao một chút.' },
    { rating: 5, comment: 'Bò bít tết chín vừa, mềm và ngọt thịt. Highly recommend!' },
    { rating: 4, comment: 'Nhân viên nhiệt tình, món ăn ra nhanh.' },
    { rating: 5, comment: 'Cà phê sữa đá đúng gu, đậm vị Việt Nam!' },
    { rating: 3, comment: 'Món ăn ổn, nhưng hơi lâu ra món.' },
    { rating: 5, comment: 'Tiramisu ngon tuyệt vời, béo mà không ngấy!' },
    { rating: 4, comment: 'Gỏi cuốn tươi ngon, nước chấm đậm đà.' },
    { rating: 5, comment: 'Quán đẹp, view đẹp, đồ ăn ngon. 10/10!' },
    { rating: 4, comment: 'Cơm gà Hội An đúng vị, sẽ giới thiệu bạn bè.' },
    { rating: 5, comment: 'Không gian yên tĩnh, thích hợp hẹn hò.' },
];

// ═══════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════

const seed = async () => {
    const client = await pool.connect();
    
    try {
        console.log("╔═══════════════════════════════════════════════════════════╗");
        console.log("║     🌱 SMART RESTAURANT - SEEDING DEMO DATA               ║");
        console.log("╚═══════════════════════════════════════════════════════════╝\n");

        await client.query('BEGIN');

        // ═══════════════════════════════════════════════════════════
        // 1. CLEANUP OLD DATA
        // ═══════════════════════════════════════════════════════════
        console.log('🧹 Cleaning existing data...');
        await client.query(`
            TRUNCATE TABLE reviews, order_items, orders, menu_item_modifier_groups, 
            modifier_options, modifier_groups, menu_item_photos, menu_items, 
            menu_categories, tables, users RESTART IDENTITY CASCADE
        `);
        console.log('   ✓ Data cleaned\n');

        // ═══════════════════════════════════════════════════════════
        // 2. CREATE USERS
        // ═══════════════════════════════════════════════════════════
        console.log('👤 Creating users...');
        const hash = await bcrypt.hash('123456', 10);

        // Admin
        await client.query(
            `INSERT INTO users (email, password_hash, full_name, role, status) 
             VALUES ($1, $2, $3, $4, $5)`,
            ['admin@restaurant.com', hash, 'Admin Nhà Hàng', 'admin', 'active']
        );

        // Waiters
        const waiterIds = [];
        const waiters = [
            { email: 'waiter1@res.com', name: 'Nguyễn Văn An' },
            { email: 'waiter2@res.com', name: 'Trần Thị Bình' },
        ];
        for (const w of waiters) {
            const res = await client.query(
                `INSERT INTO users (email, password_hash, full_name, role, status) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [w.email, hash, w.name, 'waiter', 'active']
            );
            waiterIds.push(res.rows[0].id);
        }

        // Kitchen Staff
        const kitchenIds = [];
        const kitchenStaff = [
            { email: 'kitchen1@res.com', name: 'Đầu bếp Minh' },
            { email: 'kitchen2@res.com', name: 'Phó bếp Hùng' },
        ];
        for (const k of kitchenStaff) {
            const res = await client.query(
                `INSERT INTO users (email, password_hash, full_name, role, status) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [k.email, hash, k.name, 'kitchen', 'active']
            );
            kitchenIds.push(res.rows[0].id);
        }

        // Guest accounts (customers with order history)
        const guestIds = [];
        const guests = [
            { email: 'guest1@gmail.com', name: 'Nguyễn Thị Mai', phone: '0901234567', points: 150, tier: 'Silver' },
            { email: 'guest2@gmail.com', name: 'Trần Văn Hùng', phone: '0912345678', points: 320, tier: 'Gold' },
            { email: 'guest3@gmail.com', name: 'Lê Thị Hoa', phone: '0923456789', points: 50, tier: 'Bronze' },
            { email: 'guest4@gmail.com', name: 'Phạm Văn Đức', phone: '0934567890', points: 200, tier: 'Silver' },
            { email: 'guest5@gmail.com', name: 'Hoàng Thị Lan', phone: '0945678901', points: 500, tier: 'Gold' },
        ];
        for (const g of guests) {
            const res = await client.query(
                `INSERT INTO users (email, password_hash, full_name, phone, role, status, total_points, tier) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [g.email, hash, g.name, g.phone, 'guest', 'active', g.points, g.tier]
            );
            guestIds.push(res.rows[0].id);
        }
        console.log(`   ✓ Created ${1 + waiters.length + kitchenStaff.length + guests.length} users\n`);

        // ═══════════════════════════════════════════════════════════
        // 3. CREATE TABLES
        // ═══════════════════════════════════════════════════════════
        console.log('🪑 Creating restaurant tables...');
        const tableIds = [];
        const tablesData = [
            { number: 'A01', capacity: 2, location: 'Tầng 1 - Cửa sổ', desc: 'Bàn đôi view đẹp' },
            { number: 'A02', capacity: 2, location: 'Tầng 1 - Cửa sổ', desc: 'Bàn đôi lãng mạn' },
            { number: 'A03', capacity: 4, location: 'Tầng 1 - Trung tâm', desc: 'Bàn gia đình nhỏ' },
            { number: 'A04', capacity: 4, location: 'Tầng 1 - Trung tâm', desc: 'Bàn nhóm bạn' },
            { number: 'B01', capacity: 6, location: 'Tầng 1 - Khu B', desc: 'Bàn gia đình' },
            { number: 'B02', capacity: 6, location: 'Tầng 1 - Khu B', desc: 'Bàn tiệc nhỏ' },
            { number: 'VIP01', capacity: 8, location: 'Tầng 2 - VIP', desc: 'Phòng VIP riêng tư' },
            { number: 'VIP02', capacity: 10, location: 'Tầng 2 - VIP', desc: 'Phòng VIP lớn' },
            { number: 'R01', capacity: 4, location: 'Rooftop', desc: 'View thành phố' },
            { number: 'R02', capacity: 4, location: 'Rooftop', desc: 'View hoàng hôn' },
        ];
        
        for (const t of tablesData) {
            const res = await client.query(`
                INSERT INTO tables (table_number, capacity, location, description, qr_token, qr_token_created_at, status)
                VALUES ($1, $2, $3, $4, $5, NOW(), 'active') RETURNING id`,
                [t.number, t.capacity, t.location, t.desc, `QR_${t.number}_${Date.now()}`]
            );
            tableIds.push(res.rows[0].id);
        }
        console.log(`   ✓ Created ${tablesData.length} tables\n`);

        // ═══════════════════════════════════════════════════════════
        // 4. CREATE MODIFIER GROUPS
        // ═══════════════════════════════════════════════════════════
        console.log('⚙️ Creating modifiers...');
        
        const sizeGroupRes = await client.query(`
            INSERT INTO modifier_groups (name, selection_type, is_required, min_selection, max_selection)
            VALUES ('Chọn Size', 'single', true, 1, 1) RETURNING id
        `);
        const sizeGroupId = sizeGroupRes.rows[0].id;
        await client.query(`
            INSERT INTO modifier_options (group_id, name, price_adjustment) VALUES 
            ($1, 'Size M (Mặc định)', 0),
            ($1, 'Size L (+10k)', 10000)
        `, [sizeGroupId]);

        const toppingGroupRes = await client.query(`
            INSERT INTO modifier_groups (name, selection_type, is_required, min_selection, max_selection)
            VALUES ('Topping thêm', 'multiple', false, 0, 3) RETURNING id
        `);
        const toppingGroupId = toppingGroupRes.rows[0].id;
        await client.query(`
            INSERT INTO modifier_options (group_id, name, price_adjustment) VALUES 
            ($1, 'Thêm trân châu', 5000),
            ($1, 'Thêm thạch dừa', 5000),
            ($1, 'Thêm kem cheese', 15000)
        `, [toppingGroupId]);

        const spiceGroupRes = await client.query(`
            INSERT INTO modifier_groups (name, selection_type, is_required, min_selection, max_selection)
            VALUES ('Độ cay', 'single', false, 0, 1) RETURNING id
        `);
        const spiceGroupId = spiceGroupRes.rows[0].id;
        await client.query(`
            INSERT INTO modifier_options (group_id, name, price_adjustment) VALUES 
            ($1, 'Không cay', 0),
            ($1, 'Cay nhẹ', 0),
            ($1, 'Cay vừa', 0),
            ($1, 'Cay nhiều', 0)
        `, [spiceGroupId]);

        console.log('   ✓ Created 3 modifier groups\n');

        // ═══════════════════════════════════════════════════════════
        // 5. CREATE MENU
        // ═══════════════════════════════════════════════════════════
        console.log('🍔 Creating menu...');
        const menuItemsMap = {};

        for (let catIndex = 0; catIndex < CATEGORIES_DATA.length; catIndex++) {
            const catData = CATEGORIES_DATA[catIndex];
            
            const catRes = await client.query(
                `INSERT INTO menu_categories (name, description, image_url, sort_order, status) 
                 VALUES ($1, $2, $3, $4, 'active') RETURNING id`,
                [catData.name, catData.description, catData.img, catIndex]
            );
            const catId = catRes.rows[0].id;

            for (const item of catData.items) {
                const itemRes = await client.query(`
                    INSERT INTO menu_items (category_id, name, description, price, prep_time_minutes, is_chef_recommended, status)
                    VALUES ($1, $2, $3, $4, $5, $6, 'available') RETURNING id`,
                    [catId, item.name, item.description, item.price, item.prepTime, item.isChefRecommended || false]
                );
                const itemId = itemRes.rows[0].id;
                menuItemsMap[item.name] = { id: itemId, price: item.price };

                await client.query(`
                    INSERT INTO menu_item_photos (menu_item_id, photo_url, is_primary)
                    VALUES ($1, $2, true)`,
                    [itemId, item.img]
                );

                if (catData.name === 'Đồ uống') {
                    await client.query(`
                        INSERT INTO menu_item_modifier_groups (menu_item_id, modifier_group_id, sort_order)
                        VALUES ($1, $2, 0), ($1, $3, 1)`,
                        [itemId, sizeGroupId, toppingGroupId]
                    );
                }
                
                if (catData.name === 'Món chính') {
                    await client.query(`
                        INSERT INTO menu_item_modifier_groups (menu_item_id, modifier_group_id, sort_order)
                        VALUES ($1, $2, 0)`,
                        [itemId, spiceGroupId]
                    );
                }
            }
        }
        console.log(`   ✓ Created ${CATEGORIES_DATA.length} categories, ${Object.keys(menuItemsMap).length} menu items\n`);

        // ═══════════════════════════════════════════════════════════
        // 6. CREATE ORDERS - OPTIMIZED FOR DEMO
        // ═══════════════════════════════════════════════════════════
        console.log('🧾 Creating orders for demo...');
        
        const createOrder = async (tableId, userId, customerName, customerPhone, status, items, daysAgo = 0, minutesAgo = 0) => {
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - daysAgo);
            createdAt.setMinutes(createdAt.getMinutes() - minutesAgo);
            
            const paidAt = (status === 'paid') ? createdAt : null;
            
            const orderRes = await client.query(`
                INSERT INTO orders (table_id, user_id, customer_name, customer_phone, status, total_amount, created_at, updated_at, paid_at)
                VALUES ($1, $2, $3, $4, $5, 0, $6, $6, $7) RETURNING id`,
                [tableId, userId, customerName, customerPhone, status, createdAt, paidAt]
            );
            const orderId = orderRes.rows[0].id;
            
            let totalAmount = 0;
            for (const item of items) {
                const menuItem = menuItemsMap[item.name];
                if (!menuItem) continue;
                
                const totalPrice = menuItem.price * item.qty;
                totalAmount += totalPrice;
                
                let itemStatus = 'pending';
                if (['accepted', 'preparing'].includes(status)) itemStatus = 'preparing';
                if (['ready'].includes(status)) itemStatus = 'ready';
                if (['served', 'paid'].includes(status)) itemStatus = 'completed';
                if (status === 'cancelled') itemStatus = 'cancelled';
                
                await client.query(`
                    INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, modifiers_selected, status, notes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [orderId, menuItem.id, item.qty, menuItem.price, totalPrice, JSON.stringify(item.modifiers || []), itemStatus, item.notes || null]
                );
            }
            
            await client.query(`UPDATE orders SET total_amount = $1 WHERE id = $2`, [totalAmount, orderId]);
            return orderId;
        };

        // ─────────────────────────────────────────────────────────────
        // A. ACTIVE ORDERS (For Waiter & Kitchen Demo)
        // ─────────────────────────────────────────────────────────────
        console.log('   📌 Creating active orders for workflow demo...');
        
        // 3 đơn PENDING - Khách vừa đặt, Waiter cần xác nhận
        await createOrder(tableIds[0], null, 'Anh Minh', '0909111222', 'pending', [
            { name: 'Phở bò Hà Nội', qty: 2 },
            { name: 'Cà phê sữa đá', qty: 2 },
        ], 0, 5); // 5 phút trước
        
        await createOrder(tableIds[1], guestIds[0], guests[0].name, guests[0].phone, 'pending', [
            { name: 'Bún chả Hà Nội', qty: 1 },
            { name: 'Gỏi cuốn tôm thịt', qty: 1 },
            { name: 'Trà sữa trân châu', qty: 1, modifiers: [{ name: 'Size L', price: 10000 }] },
        ], 0, 3); // 3 phút trước
        
        await createOrder(tableIds[2], null, 'Chị Hương', '0909333444', 'pending', [
            { name: 'Cơm gà Hội An', qty: 2 },
            { name: 'Sinh tố bơ', qty: 2 },
        ], 0, 1); // 1 phút trước

        // 2 đơn ACCEPTED - Đã xác nhận, Kitchen sẽ thấy
        await createOrder(tableIds[3], guestIds[1], guests[1].name, guests[1].phone, 'accepted', [
            { name: 'Bò bít tết Úc', qty: 2, notes: 'Chín vừa' },
            { name: 'Salad trộn dầu giấm', qty: 1 },
            { name: 'Nước ép cam tươi', qty: 2 },
        ], 0, 15); // 15 phút trước

        await createOrder(tableIds[4], null, 'Anh Tuấn', '0909555666', 'accepted', [
            { name: 'Cá hồi nướng teriyaki', qty: 1 },
            { name: 'Súp hải sản', qty: 1 },
        ], 0, 12); // 12 phút trước
        
        // 2 đơn PREPARING - Bếp đang làm
        await createOrder(tableIds[5], guestIds[2], guests[2].name, guests[2].phone, 'preparing', [
            { name: 'Mì Quảng tôm thịt', qty: 2 },
            { name: 'Chả giò giòn', qty: 1 },
        ], 0, 20); // 20 phút trước
        
        await createOrder(tableIds[6], null, 'Cô Lan', '0909777888', 'preparing', [
            { name: 'Phở bò Hà Nội', qty: 3 },
            { name: 'Cà phê sữa đá', qty: 3 },
        ], 0, 18); // 18 phút trước
        
        // 2 đơn READY - Sẵn sàng, Waiter cần mang ra
        await createOrder(tableIds[7], guestIds[3], guests[3].name, guests[3].phone, 'ready', [
            { name: 'Bò bít tết Úc', qty: 1 },
            { name: 'Tiramisu Ý', qty: 1 },
            { name: 'Trà sữa trân châu', qty: 1 },
        ], 0, 25); // 25 phút trước

        await createOrder(tableIds[8], null, 'Anh Nam', '0909999000', 'ready', [
            { name: 'Cơm gà Hội An', qty: 2 },
            { name: 'Chè Thái', qty: 2 },
        ], 0, 22); // 22 phút trước
        
        // 1 đơn SERVED - Đã phục vụ, chờ thanh toán
        await createOrder(tableIds[9], guestIds[4], guests[4].name, guests[4].phone, 'served', [
            { name: 'Cá hồi nướng teriyaki', qty: 2 },
            { name: 'Salad trộn dầu giấm', qty: 1 },
            { name: 'Bánh Flan caramel', qty: 2 },
        ], 0, 45); // 45 phút trước

        console.log('      ✓ 3 pending, 2 accepted, 2 preparing, 2 ready, 1 served');

        // ─────────────────────────────────────────────────────────────
        // B. ORDER HISTORY (For Customer & Reports)
        // ─────────────────────────────────────────────────────────────
        console.log('   📜 Creating order history...');
        
        // Khách hàng 1 - 3 đơn lịch sử
        await createOrder(tableIds[0], guestIds[0], guests[0].name, guests[0].phone, 'paid', [
            { name: 'Phở bò Hà Nội', qty: 2 },
            { name: 'Chả giò giòn', qty: 1 },
        ], 2);
        
        await createOrder(tableIds[1], guestIds[0], guests[0].name, guests[0].phone, 'paid', [
            { name: 'Cơm gà Hội An', qty: 1 },
            { name: 'Cà phê sữa đá', qty: 1 },
        ], 7);
        
        await createOrder(tableIds[2], guestIds[0], guests[0].name, guests[0].phone, 'paid', [
            { name: 'Bún chả Hà Nội', qty: 2 },
            { name: 'Chè Thái', qty: 2 },
        ], 14);

        // Khách hàng 2 - 4 đơn (VIP)
        await createOrder(tableIds[6], guestIds[1], guests[1].name, guests[1].phone, 'paid', [
            { name: 'Bò bít tết Úc', qty: 2 },
            { name: 'Cá hồi nướng teriyaki', qty: 1 },
            { name: 'Tiramisu Ý', qty: 2 },
        ], 1);
        
        await createOrder(tableIds[7], guestIds[1], guests[1].name, guests[1].phone, 'paid', [
            { name: 'Mì Quảng tôm thịt', qty: 3 },
            { name: 'Gỏi cuốn tôm thịt', qty: 2 },
        ], 5);
        
        await createOrder(tableIds[6], guestIds[1], guests[1].name, guests[1].phone, 'paid', [
            { name: 'Bò bít tết Úc', qty: 1, notes: 'Chín tái' },
            { name: 'Salad trộn dầu giấm', qty: 1 },
        ], 10);
        
        await createOrder(tableIds[8], guestIds[1], guests[1].name, guests[1].phone, 'paid', [
            { name: 'Phở bò Hà Nội', qty: 2 },
            { name: 'Trà sữa trân châu', qty: 2 },
        ], 20);

        // Khách hàng 3, 4, 5
        await createOrder(tableIds[3], guestIds[2], guests[2].name, guests[2].phone, 'paid', [
            { name: 'Cơm gà Hội An', qty: 2 },
            { name: 'Sinh tố bơ', qty: 2 },
        ], 3);

        await createOrder(tableIds[4], guestIds[3], guests[3].name, guests[3].phone, 'paid', [
            { name: 'Súp hải sản', qty: 1 },
            { name: 'Cá hồi nướng teriyaki', qty: 1 },
        ], 4);
        
        await createOrder(tableIds[5], guestIds[3], guests[3].name, guests[3].phone, 'paid', [
            { name: 'Chả giò giòn', qty: 2 },
            { name: 'Bún chả Hà Nội', qty: 2 },
        ], 12);

        await createOrder(tableIds[7], guestIds[4], guests[4].name, guests[4].phone, 'paid', [
            { name: 'Bò bít tết Úc', qty: 3 },
            { name: 'Tiramisu Ý', qty: 3 },
        ], 2);
        
        await createOrder(tableIds[6], guestIds[4], guests[4].name, guests[4].phone, 'paid', [
            { name: 'Gỏi cuốn tôm thịt', qty: 3 },
            { name: 'Phở bò Hà Nội', qty: 3 },
        ], 8);

        // 1 cancelled order
        await createOrder(tableIds[9], null, 'Khách hủy', '0909999888', 'cancelled', [
            { name: 'Phở bò Hà Nội', qty: 1 },
        ], 5);

        console.log('      ✓ 12 paid orders, 1 cancelled\n');

        // ═══════════════════════════════════════════════════════════
        // 7. CREATE REVIEWS
        // ═══════════════════════════════════════════════════════════
        console.log('⭐ Creating reviews...');
        
        const reviewAssignments = [
            { guestIndex: 0, itemName: 'Phở bò Hà Nội', reviewIndex: 1 },
            { guestIndex: 0, itemName: 'Cơm gà Hội An', reviewIndex: 10 },
            { guestIndex: 0, itemName: 'Chả giò giòn', reviewIndex: 4 },
            { guestIndex: 1, itemName: 'Bò bít tết Úc', reviewIndex: 3 },
            { guestIndex: 1, itemName: 'Tiramisu Ý', reviewIndex: 7 },
            { guestIndex: 1, itemName: 'Cá hồi nướng teriyaki', reviewIndex: 0 },
            { guestIndex: 1, itemName: 'Mì Quảng tôm thịt', reviewIndex: 4 },
            { guestIndex: 2, itemName: 'Cơm gà Hội An', reviewIndex: 11 },
            { guestIndex: 3, itemName: 'Cá hồi nướng teriyaki', reviewIndex: 9 },
            { guestIndex: 3, itemName: 'Bún chả Hà Nội', reviewIndex: 4 },
            { guestIndex: 4, itemName: 'Bò bít tết Úc', reviewIndex: 0 },
            { guestIndex: 4, itemName: 'Gỏi cuốn tôm thịt', reviewIndex: 8 },
            { guestIndex: 4, itemName: 'Cà phê sữa đá', reviewIndex: 5 },
            { guestIndex: 4, itemName: 'Phở bò Hà Nội', reviewIndex: 9 },
        ];
        
        for (const r of reviewAssignments) {
            const menuItem = menuItemsMap[r.itemName];
            if (!menuItem) continue;
            
            const review = SAMPLE_REVIEWS[r.reviewIndex];
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 20));
            
            await client.query(`
                INSERT INTO reviews (user_id, menu_item_id, rating, comment, created_at)
                VALUES ($1, $2, $3, $4, $5)`,
                [guestIds[r.guestIndex], menuItem.id, review.rating, review.comment, createdAt]
            );
        }
        
        console.log(`   ✓ Created ${reviewAssignments.length} reviews\n`);

        // ═══════════════════════════════════════════════════════════
        // 8. UPDATE STATISTICS
        // ═══════════════════════════════════════════════════════════
        console.log('📊 Updating statistics...');
        await client.query(`
            UPDATE menu_items 
            SET order_count = (
                SELECT COALESCE(SUM(oi.quantity), 0)
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.menu_item_id = menu_items.id
                AND o.status = 'paid'
            )
        `);
        console.log('   ✓ Updated order counts\n');

        // ═══════════════════════════════════════════════════════════
        // COMMIT & SUMMARY
        // ═══════════════════════════════════════════════════════════
        await client.query('COMMIT');
        
        const stats = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users,
                (SELECT COUNT(*) FROM users WHERE role = 'guest') as guests,
                (SELECT COUNT(*) FROM tables) as tables,
                (SELECT COUNT(*) FROM menu_categories) as categories,
                (SELECT COUNT(*) FROM menu_items) as menu_items,
                (SELECT COUNT(*) FROM orders) as total_orders,
                (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
                (SELECT COUNT(*) FROM orders WHERE status IN ('accepted', 'preparing')) as kitchen_orders,
                (SELECT COUNT(*) FROM orders WHERE status = 'ready') as ready_orders,
                (SELECT COUNT(*) FROM orders WHERE status = 'paid') as paid_orders,
                (SELECT COUNT(*) FROM reviews) as reviews,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'paid') as total_revenue
        `);
        const s = stats.rows[0];

        console.log('✅ SEED COMPLETED - READY FOR DEMO!');
        console.log('📋 LOGIN ACCOUNTS (Password: 123456)');
        console.log('   • 👑 Admin:    admin@restaurant.com');
        console.log('   • 🧑‍💼 Waiter:   waiter1@res.com');
        console.log('   • 👨‍🍳 Kitchen:  kitchen1@res.com');
        console.log('   • 👤 Guest:    guest1@gmail.com');
        console.log('   • 👤 VIP:      guest2@gmail.com');
        console.log('📊 DATA SUMMARY║');
        console.log(`   • ${s.users} Users (${s.guests} guests with accounts)`);
        console.log(`   • ${s.tables} Tables with QR codes`);
        console.log(`   • ${s.categories} Categories, ${s.menu_items} Menu items`);
        console.log(`   • ${s.total_orders} Orders total `);
        console.log(`   • ${s.reviews} Reviews with comments`);
        console.log(`   • ${parseInt(s.total_revenue).toLocaleString('vi-VN')}đ Total revenue                        ║`);
        console.log('🎯 DEMO SCENARIOS');
        console.log(`   • Waiter: ${s.pending_orders} pending → Confirm orders`);
        console.log(`   • Kitchen: ${s.kitchen_orders} orders → Cook & mark ready`);
        console.log(`   • Waiter: ${s.ready_orders} ready → Serve to tables`);
        console.log(`   • Customer: Login to view order history`);
        console.log(`   • Admin: View reports with ${s.paid_orders} paid orders`);

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('\n❌ SEED FAILED:', e.message);
        console.error(e.stack);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

seed().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});