const express = require('express');
const { body } = require('express-validator');
const { login, me } = require('../controllers/authController');
const { requireAdmin } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validateMiddleware');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
    body('password').notEmpty().withMessage('Mot de passe requis.'),
  ],
  handleValidation,
  login
);

router.get('/me', requireAdmin, me);

module.exports = router;
