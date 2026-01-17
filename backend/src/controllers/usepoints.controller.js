const db = require("../db");

/**
 * PATCH /api/orders/:id/use-points
 * Apply customer points to reduce order total (1 point = 1đ)
 * Body: { points: number }
 * Auth: customer
 */
exports.usePoints = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { points } = req.body;
    if (!req.customer || !req.customer.userId) {
      return res.status(401).json({ message: "Customer login required" });
    }
    if (!points || points <= 0) {
      return res.status(400).json({ message: "Số điểm không hợp lệ" });
    }
    await client.query("BEGIN");
    // Lấy order và user
    const orderRes = await client.query("SELECT * FROM orders WHERE id = $1", [id]);
    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }
    const order = orderRes.rows[0];
    if (order.status === 'paid' || order.status === 'cancelled') {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Order đã thanh toán hoặc đã hủy" });
    }
    if (order.user_id !== req.customer.userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Bạn không thể dùng điểm cho đơn này" });
    }
    // Lấy điểm hiện tại
    const userRes = await client.query("SELECT total_points FROM users WHERE id = $1", [order.user_id]);
    const currentPoints = userRes.rows[0]?.total_points || 0;
    if (points > currentPoints) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Bạn không đủ điểm" });
    }
    // Trừ điểm và cập nhật giảm giá cho order
    await client.query("UPDATE users SET total_points = total_points - $1 WHERE id = $2", [points, order.user_id]);
    // Cộng vào discount_amount (nếu đã có giảm giá khác thì cộng dồn)
    await client.query("UPDATE orders SET discount_amount = COALESCE(discount_amount,0) + $1 WHERE id = $2", [points, id]);
    await client.query("COMMIT");
    res.json({ message: `Đã dùng ${points} điểm để giảm ${points}đ cho đơn hàng`, pointsUsed: points });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};
