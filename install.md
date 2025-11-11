# Guide d’installation – Cinéma Nova

Ce guide pas à pas permet d’installer et exécuter l’application (API + front) en local.

---

## 1. Prérequis

- Node.js ≥ 18
- npm ≥ 9 (fourni avec Node)
- Git (optionnel mais recommandé)

> La base de données SQLite est embarquée, aucun serveur externe n’est nécessaire.

---

## 2. Cloner le projet

```bash
git clone https://github.com/idriskity/projetstudi.git
cd projetstudi
```

---

## 3. Installation des dépendances

```bash
# Back-end
cd backend
npm install

# Front-end
cd ../frontend
npm install
```

---

## 4. Configuration de l’API

1. Copier le fichier d’exemple d’environnement :
   ```bash
   cd backend
   cp env.example .env
   ```
2. Adapter les variables si besoin :
   - `PORT` : port HTTP de l’API (par défaut `4000`)
   - `JWT_SECRET` : clé secrète pour signer les tokens
   - `APP_URL` : URL publique de l’API (ex. `http://localhost:4000`) — utilisée pour retourner l’URL complète des affiches uploadées

- **Téléversement d’affiche** : depuis le dashboard admin, vous pouvez importer un fichier (PNG/JPG/WebP, 5 Mo max). Le fichier est stocké dans `backend/uploads` et servi via `http://localhost:4000/uploads/...`.

---

## 5. Lancer l’application en développement

Ouvrir **deux terminaux** :

### Terminal 1 – API
```bash
cd backend
npm run dev
```

### Terminal 2 – Front
```bash
cd frontend
npm run dev
```

Accéder ensuite au front sur `http://localhost:5173` (Vite) et à l’API sur `http://localhost:4000`.

---

## 6. Identifiants de démonstration

Un compte administrateur est créé automatiquement :

- **Email** : `admin@cinema.app`
- **Mot de passe** : `Admin123!`

Modifiez ces identifiants dans la base si nécessaire.

---

## 7. Commandes utiles

| Répertoire | Commande | Description |
| ---------- | -------- | ----------- |
| backend | `npm run dev` | API avec hot reload (nodemon) |
| backend | `npm start` | API en mode production |
| backend | `npm run lint` | Vérifie la qualité du code |
| frontend | `npm run dev` | Front avec Vite |
| frontend | `npm run build` | Build de production |
| frontend | `npm run preview` | Prévisualiser le build |

---

## 8. Déploiement rapide (optionnel)

### Build front
```bash
cd frontend
npm run build
```
Le bundle est généré dans `frontend/dist`.

### Lancer l’API en production
```bash
cd backend
npm install --production
npm start
```
Servir ensuite le front buildé avec un serveur statique (Nginx, Apache, Vercel, Netlify…).

---

## 9. Résolution de problèmes

- **Port déjà utilisé** : modifier `PORT` dans le `.env` back ou `vite.config.ts`.
- **Erreur `SQLITE_BUSY`** : fermer les processus bloquants et redémarrer l’API.
- **Erreur CORS** : vérifier que le front appelle l’API via `/api` (proxy Vite déjà configuré).
- **Token invalide** : se reconnecter depuis `/admin/login`.

---

Vous êtes prêt à utiliser le site ! Consultez `docs/presentation.md` pour la description fonctionnelle et l’architecture. 

