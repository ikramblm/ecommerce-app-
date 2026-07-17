const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Trop de tentatives de connexion. Réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Trop de demandes envoyées. Réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, orderLimiter };
