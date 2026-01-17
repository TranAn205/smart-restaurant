/**
 * Orders Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");
const { optionalCustomer } = require("../middleware/authMiddleware");

// GET /api/orders - Get all orders (Admin)
router.get("/", ordersController.getAll);

// POST /api/orders - Create new order (with optional customer auth)
router.post("/", optionalCustomer, ordersController.create);

// GET /api/orders/table/:tableId/order - Get orders by table
// NOTE: This route must come BEFORE /:id to avoid matching 'table' as an id
router.get("/table/:tableId/order", ordersController.getByTable);

// GET /api/orders/:id - Get order by ID
router.get("/:id", ordersController.getById);

// PATCH /api/orders/:id/items - Add items to order
router.patch("/:id/items", ordersController.addItems);

// PATCH /api/orders/:id/attach-customer - Attach customer to order
router.patch("/:id/attach-customer", ordersController.attachCustomer);

// POST /api/orders/:id/request-bill - Request bill from waiter
router.post("/:id/request-bill", ordersController.requestBill);

// PATCH /api/orders/:id/discount - Apply discount (Admin/Waiter)
router.patch("/:id/discount", ordersController.applyDiscount);

// GET /api/orders/:id/bill/pdf - Download bill as PDF
router.get("/:id/bill/pdf", ordersController.generateBillPDF);

const { requireCustomer } = require("../middleware/authMiddleware");
const usePointsController = require("../controllers/usepoints.controller");

// PATCH /api/orders/:id/use-points - Khách dùng điểm trừ vào tiền đơn hàng
router.patch("/:id/use-points", requireCustomer, usePointsController.usePoints);

module.exports = router;
