const pool = require('../config/db');

async function createOrder(req, res, next) {
  try {
    const {
      product_id, quantity, customer_name, customer_phone, customer_email,
      wilaya, address, payment_type, delivery_type,
    } = req.body;

    const [productRows] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    const [result] = await pool.query(
      `INSERT INTO orders
        (product_id, quantity, customer_name, customer_phone, customer_email, wilaya, address, payment_type, delivery_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id, quantity || 1, customer_name, customer_phone, customer_email,
        wilaya, address, payment_type || 'cod', delivery_type || 'home',
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Demande enregistrée avec succès.' });
  } catch (err) {
    next(err);
  }
}

async function listOrders(req, res, next) {
  try {
    const { status } = req.query;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT o.*, p.title_fr AS product_title
       FROM orders o
       JOIN products p ON p.id = o.product_id
       ${where}
       ORDER BY o.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['pending', 'processed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Demande introuvable.' });
    }

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, listOrders, updateOrderStatus };
