require('dotenv').config();
const app = require('./app');
const migrate = require('./config/migrate');
const seed = require('./config/seed');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Idempotents : sûrs à exécuter à chaque démarrage (utile sur les plans
    // gratuits sans accès shell, ex: Render free tier).
    await migrate();
    await seed();
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la base de données:', err);
  }

  app.listen(PORT, () => {
    console.log(`Doudis Beauty API en écoute sur le port ${PORT}`);
  });
}

start();
