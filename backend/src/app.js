const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productsRoutes = require('./routes/productsRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const wilayas = require('./config/wilayas');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Les images produits sont hébergées sur Cloudinary (voir uploadMiddleware.js),
// plus besoin de servir un dossier /uploads local.

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/wilayas', (req, res) => res.json(wilayas));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message && err.message.includes('image')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Erreur serveur interne.' });
});

module.exports = app;
