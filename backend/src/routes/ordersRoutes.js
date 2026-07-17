const express = require('express');
const { body } = require('express-validator');
const { createOrder, listOrders, updateOrderStatus } = require('../controllers/ordersController');
const { requireAdmin } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validateMiddleware');
const { orderLimiter } = require('../middleware/rateLimitMiddleware');
const wilayas = require('../config/wilayas');

const router = express.Router();

const algerianPhoneRegex = /^0[5-7][0-9]{8}$/;

const orderValidation = [
  body('product_id').isInt({ min: 1 }).withMessage('Produit invalide.'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantité invalide.'),
  body('customer_name').trim().isLength({ min: 2, max: 150 }).withMessage('Nom complet requis.'),
  body('customer_phone')
    .trim()
    .matches(algerianPhoneRegex)
    .withMessage('Numéro de téléphone algérien invalide (ex: 05/06/07 + 8 chiffres).'),
  body('customer_email').isEmail().withMessage('Email invalide.').normalizeEmail(),
  body('wilaya').trim().isIn(wilayas).withMessage('Wilaya invalide.'),
  body('address').trim().isLength({ min: 5 }).withMessage('Adresse complète requise.'),
  body('payment_type').isIn(['cod', 'bank_transfer', 'ccp']).withMessage('Type de paiement invalide.'),
  body('delivery_type').isIn(['home', 'pickup']).withMessage('Type de livraison invalide.'),
];

router.post('/', orderLimiter, orderValidation, handleValidation, createOrder);
router.get('/', requireAdmin, listOrders);
router.patch(
  '/:id/status',
  requireAdmin,
  [body('status').isIn(['pending', 'processed', 'cancelled'])],
  handleValidation,
  updateOrderStatus
);

module.exports = router;
