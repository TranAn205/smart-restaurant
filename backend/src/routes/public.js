/**
 * Public Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public.controller");

// GET /api/menu/verify - Verify QR code
router.get("/verify", publicController.verifyQR);

// GET /api/menu/categories - Get active categories
router.get("/categories", publicController.getCategories);

// GET /api/menu/items - Get menu items
router.get("/items", publicController.getItems);

// GET /api/menu/items/:id/related - Get related items
router.get("/items/:id/related", publicController.getRelatedItems);

module.exports = router;