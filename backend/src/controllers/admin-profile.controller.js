/**
 * Admin Profile Controller
 * Handles admin profile management
 */

const db = require("../db");
const bcrypt = require("bcrypt");

/**
 * GET /api/admin/profile
 * Get current admin profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, full_name, phone, email, role, avatar_url as avatar, created_at 
       FROM users WHERE id = $1`,
      [req.user.userId]
    );
    
    if (!rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ user: rows[0] });
  } catch (err) { 
    next(err); 
  }
};

/**
 * PUT /api/admin/profile
 * Update admin profile info
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;
    
    const { rows } = await db.query(
      `UPDATE users 
       SET full_name = COALESCE(NULLIF($1, ''), full_name), 
           phone = COALESCE(NULLIF($2, ''), phone)
       WHERE id = $3 
       RETURNING id, full_name, phone, email, avatar_url as avatar`,
      [full_name, phone, req.user.userId]
    );

    res.json({ 
      message: "Cập nhật thành công", 
      user: rows[0] 
    });
  } catch (err) { 
    next(err); 
  }
};

/**
 * PUT /api/admin/profile/avatar
 * Update admin avatar
 */
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const { rows } = await db.query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING avatar_url`,
      [avatarPath, req.user.userId]
    );

    res.json({ 
      message: "Cập nhật avatar thành công", 
      avatar_url: rows[0].avatar_url 
    });
  } catch (err) { 
    next(err); 
  }
};
