const pool = require('../config/db');

async function listProducts(req, res, next) {
  try {
    const { category, minPrice, maxPrice, featured } = req.query;
    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (minPrice) {
      conditions.push('price >= ?');
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      conditions.push('price <= ?');
      params.push(Number(maxPrice));
    }
    if (featured === 'true') {
      conditions.push('is_featured = 1');
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT * FROM products ${where} ORDER BY created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const {
      title_fr, title_en, title_ar,
      description_fr, description_en, description_ar,
      price, category, is_featured, stock_status,
    } = req.body;

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO products
        (title_fr, title_en, title_ar, description_fr, description_en, description_ar, price, category, image_url, is_featured, stock_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title_fr, title_en, title_ar,
        description_fr || null, description_en || null, description_ar || null,
        price, category, image_url,
        is_featured === 'true' || is_featured === true ? 1 : 0,
        stock_status || 'in_stock',
      ]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const [existingRows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    const {
      title_fr, title_en, title_ar,
      description_fr, description_en, description_ar,
      price, category, is_featured, stock_status,
    } = req.body;

    const image_url = req.file ? `/uploads/${req.file.filename}` : existing.image_url;

    await pool.query(
      `UPDATE products SET
        title_fr = ?, title_en = ?, title_ar = ?,
        description_fr = ?, description_en = ?, description_ar = ?,
        price = ?, category = ?, image_url = ?, is_featured = ?, stock_status = ?
       WHERE id = ?`,
      [
        title_fr ?? existing.title_fr,
        title_en ?? existing.title_en,
        title_ar ?? existing.title_ar,
        description_fr ?? existing.description_fr,
        description_en ?? existing.description_en,
        description_ar ?? existing.description_ar,
        price ?? existing.price,
        category ?? existing.category,
        image_url,
        is_featured === undefined ? existing.is_featured : (is_featured === 'true' || is_featured === true ? 1 : 0),
        stock_status ?? existing.stock_status,
        req.params.id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ message: 'Impossible de supprimer : ce produit a des demandes de commande associées.' });
    }
    next(err);
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
