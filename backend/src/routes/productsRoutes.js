const express = require('express');
const { body } = require('express-validator');
const {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require('../controllers/productsController');
const { requireAdmin } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

const productValidation = [
  body('title_fr').trim().notEmpty().withMessage('Titre (FR) requis.'),
  body('title_en').trim().notEmpty().withMessage('Titre (EN) requis.'),
  body('title_ar').trim().notEmpty().withMessage('Titre (AR) requis.'),
  body('price').isFloat({ min: 0 }).withMessage('Prix invalide.'),
  body('category').trim().notEmpty().withMessage('Catégorie requise.'),
];

router.get('/', listProducts);
router.get('/:id', getProduct);

router.post('/', requireAdmin, upload.single('image'), productValidation, handleValidation, createProduct);
router.put('/:id', requireAdmin, upload.single('image'), handleValidation, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;
