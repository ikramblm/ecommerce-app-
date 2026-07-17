# Doudis Beauty

Site vitrine + demande de commande pour une boutique de maquillage en Algérie.
Multilingue FR (défaut) / EN / AR (RTL). Pas de paiement en ligne — les visiteurs
envoient une demande de commande que l'administrateur traite depuis un dashboard.

## Architecture

```
doudis-beauty/
├── backend/                 # API Node.js + Express + MySQL
│   ├── src/
│   │   ├── config/          # connexion DB, wilayas, script de seed
│   │   ├── controllers/     # logique auth / produits / commandes
│   │   ├── middleware/      # JWT auth, validation, upload, rate limit
│   │   ├── routes/          # /api/auth, /api/products, /api/orders
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/              # images produits uploadées
│   └── .env.example
├── database/
│   └── schema.sql            # tables products, orders, admins
└── frontend/                 # Vite + Tailwind CSS + JS vanilla (multi-pages)
    ├── index.html             # accueil
    ├── produits.html           # liste + filtres
    ├── produit.html             # détail produit + formulaire de commande
    ├── admin-login.html
    ├── admin-dashboard.html     # CRUD produits + gestion des commandes
    └── src/
        ├── css/main.css
        ├── i18n/{fr,en,ar}.json + wilayas.json
        └── js/                  # i18n.js, api.js, layout.js, pages...
```

## Schéma de base de données

- **admins**(id, email UNIQUE, password_hash, full_name, created_at)
- **products**(id, title_fr/en/ar, description_fr/en/ar, price, category,
  image_url, is_featured, stock_status, created_at, updated_at)
- **orders**(id, product_id → products, quantity, customer_name, customer_phone,
  customer_email, wilaya, address, payment_type[cod|bank_transfer|ccp],
  delivery_type[home|pickup], status[pending|processed|cancelled], created_at)

## Installation

### 1. Base de données

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # ajuster DB_PASSWORD, JWT_SECRET, ADMIN_EMAIL/PASSWORD
npm install
npm run seed            # crée l'admin + produits de démo
npm run dev              # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev               # http://localhost:5173
```

Compte admin par défaut (après `npm run seed`) : voir `ADMIN_EMAIL` / `ADMIN_PASSWORD`
dans `backend/.env`.

## Sécurité

- Mots de passe admin hachés avec bcrypt (12 rounds).
- Authentification admin par JWT (Bearer token).
- Validation stricte côté serveur (express-validator) : email, téléphone algérien
  (`0[5-7]XXXXXXXX`), wilaya parmi les 58 officielles, champs requis.
- Requêtes SQL paramétrées (mysql2) contre les injections SQL.
- Rate limiting sur le login admin et sur la création de demandes de commande.
- Upload d'images limité aux formats jpg/jpeg/png/webp, 5 Mo max.
