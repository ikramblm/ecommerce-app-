require('dotenv').config();
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

dns.setDefaultResultOrder('ipv4first');

async function migrate() {
  const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');

  // On se connecte déjà à la base fournie par DB_NAME (ex: defaultdb sur Aiven,
  // ou le nom généré par Clever Cloud), donc on retire l'instruction
  // CREATE DATABASE (qui peut s'étaler sur plusieurs lignes, ex: la clause
  // CHARACTER SET/COLLATE sur la ligne suivante) ainsi que le USE du script.
  sql = sql
    .replace(/CREATE DATABASE[\s\S]*?;/i, '')
    .replace(/^\s*USE\s+\w+;\s*$/im, '');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'doudis_beauty',
    multipleStatements: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  });

  try {
    await connection.query(sql);
    console.log('Schéma appliqué avec succès.');
  } finally {
    await connection.end();
  }
}

module.exports = migrate;

if (require.main === module) {
  migrate().catch((err) => {
    console.error('Erreur lors de la migration:', err);
    process.exit(1);
  });
}
