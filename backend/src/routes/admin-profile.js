/**
 * Admin Profile Routes
 */

const express = require("express");
const router = express.Router();
const adminProfileController = require("../controllers/admin-profile.controller");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Apply auth middleware
router.use(requireAuth);
router.use(requireRole(["admin"]));

// GET /api/admin/profile - Get profile
router.get("/profile", adminProfileController.getProfile);

// PUT /api/admin/profile - Update profile
router.put("/profile", adminProfileController.updateProfile);

// PUT /api/admin/profile/avatar - Update avatar
router.put("/profile/avatar", upload.single('avatar'), adminProfileController.updateAvatar);

module.exports = router;
