const dns = require('dns');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Certains réseaux de sortie (ex: Render) ne routent pas bien l'IPv6, ce qui
// provoque des ETIMEDOUT sur les hôtes qui publient un enregistrement AAAA
// (ex: Aiven). On force la résolution DNS à préférer IPv4.
dns.setDefaultResultOrder('ipv4first');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'doudis_beauty',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  // Les fournisseurs managés (ex: Aiven) exigent une connexion TLS.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
});

module.exports = pool;
