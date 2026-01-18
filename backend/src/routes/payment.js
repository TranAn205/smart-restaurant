/**
 * Payment Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// GET /api/payment/tables/:tableId/bill - Get bill for table
router.get('/tables/:tableId/bill', paymentController.getBill);

// POST /api/payment/request - Guest requests payment
router.post('/request', paymentController.requestPayment);

// POST /api/payment/orders/:id/pay - Process payment (cash)
router.post('/orders/:id/pay', paymentController.processPayment);

// GET /api/payment/orders/:id/receipt - Get receipt
router.get('/orders/:id/receipt', paymentController.getReceipt);

// ============================================
// VIETQR ROUTES
// ============================================
// POST /api/payment/vietqr/generate - Generate VietQR code
router.post('/vietqr/generate', paymentController.generateVietQR);

// POST /api/payment/vietqr/confirm - Confirm VietQR payment (auto)
router.post('/vietqr/confirm', paymentController.confirmVietQR);

// ============================================
// STRIPE ROUTES
// ============================================
// POST /api/payment/stripe/create-session - Create Stripe Checkout
router.post('/stripe/create-session', paymentController.createStripeSession);

// POST /api/payment/stripe/webhook - Stripe webhook (raw body required)
// Note: This route needs express.raw() middleware, configured in index.js
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

// GET /api/payment/stripe/verify/:sessionId - Verify Stripe session
router.get('/stripe/verify/:sessionId', paymentController.verifyStripeSession);

module.exports = router;