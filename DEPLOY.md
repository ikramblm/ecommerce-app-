# Déploiement gratuit

Stack retenue (100% free tier) :

- **Base de données MySQL** → [Aiven](https://aiven.io/free-mysql-database) (1 Go, gratuit sans CB)
- **Images produits** → [Cloudinary](https://cloudinary.com) (25 Go gratuits, persistant)
- **Backend (API Express)** → [Render](https://render.com) (free web service)
- **Frontend (Vite)** → [Cloudflare Pages](https://pages.cloudflare.com) (gratuit, illimité)

⚠️ Le plan gratuit de Render met le service en veille après 15 min d'inactivité
(premier chargement ~30-60s après une pause) et redémarre parfois le conteneur —
c'est pour ça que les images passent par Cloudinary plutôt que par le disque local.

## 1. Pousser le projet sur GitHub

```bash
cd doudis-beauty
git init
git add .
git commit -m "Initial commit"
```

Puis sur [github.com/new](https://github.com/new), crée un repo (ex: `ecommerce-app`), et :

```bash
git remote add origin https://github.com/<ton-user>/ecommerce-app.git
git branch -M main
git push -u origin main
```

## 2. Base de données MySQL (Aiven)

1. Crée un compte sur [aiven.io](https://aiven.io/free-mysql-database), crée un service **MySQL**
   sur le plan **Free**.
2. Une fois le service "Running", note **Host**, **Port**, **User** (`avnadmin`), **Password**,
   et **Database name** (généralement `defaultdb`) dans l'onglet "Connection information".
   La connexion exige TLS (`SSL mode: REQUIRED`).
3. Aiven ne fournit pas de console SQL pour MySQL : le schéma (`database/schema.sql`) sera
   appliqué automatiquement après le déploiement du backend, via `npm run migrate`
   (voir étape 4.4). Utilise `DB_NAME=defaultdb` (ou le nom donné par Aiven) plutôt que
   `doudis_beauty` — le script de migration s'adapte à la base déjà sélectionnée.

## 3. Images (Cloudinary)

1. Crée un compte gratuit sur [cloudinary.com](https://cloudinary.com).
2. Sur le dashboard, note **Cloud name**, **API Key**, **API Secret**.

## 4. Backend (Render)

1. Sur [render.com](https://render.com), "New +" → "Blueprint", connecte ton repo GitHub.
   Render détecte `render.yaml` à la racine et configure le service `ecommerce-app-api`
   (root dir `backend/`).
2. Renseigne les variables marquées `sync: false` quand Render te les demande :
   `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (valeurs Aiven), `ADMIN_EMAIL`,
   `ADMIN_PASSWORD` (identifiants admin à créer), `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Laisse `FRONTEND_URL` vide pour l'instant.
3. Déploie. Une fois en ligne, note l'URL Render (ex: `https://ecommerce-app-api.onrender.com`).
4. Dans Render, onglet "Shell" du service, exécute dans l'ordre :
   ```bash
   npm run migrate   # crée les tables (admins, products, orders)
   npm run seed       # crée l'admin + produits de démo
   ```

## 5. Frontend (Cloudflare Pages)

1. Sur [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → "Create" → "Pages" →
   connecte le même repo GitHub.
2. Paramètres de build :
   - **Root directory** : `frontend`
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
3. Variable d'environnement de build : `VITE_API_URL` = `https://ecommerce-app-api.onrender.com/api`
   (remplace par l'URL Render obtenue à l'étape 4).
4. Déploie. Cloudflare te donne une URL du type `https://ecommerce-app.pages.dev`.

## 6. Reconnecter le CORS

Retourne dans Render → service `ecommerce-app-api` → Environment → mets à jour
`FRONTEND_URL` avec l'URL Cloudflare Pages obtenue à l'étape 5 (ex:
`https://ecommerce-app.pages.dev`), puis redéploie le backend.

## Récap des URLs à retenir

| Service | URL |
|---|---|
| Site (frontend) | `https://ecommerce-app.pages.dev` |
| API (backend) | `https://ecommerce-app-api.onrender.com` |
| Admin | `https://ecommerce-app.pages.dev/admin-login.html` |

## Limites du plan gratuit à connaître

- Render : veille après 15 min sans trafic → premier visiteur après une pause attend
  ~30-60s. Pas de solution gratuite pour l'éviter (un ping externe périodique est
  contraire aux CGU de Render).
- Aiven : 1 Go de stockage, largement suffisant pour ce projet.
- Cloudinary : 25 Go de stockage/bande passante par mois, largement suffisant.
- Cloudflare Pages : pas de limite réelle pour ce volume de trafic.
