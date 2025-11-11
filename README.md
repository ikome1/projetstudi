# Projet Cinéma Nova

Application complète de gestion de films pour un cinéma : interface grand public en React/Vite et API Node/Express avec base SQLite. L’espace administrateur permet de gérer les films et les utilisateurs.

## Démarrage rapide

1. **Installer les dépendances**
   ```bash
   # Back-end
   cd backend
   npm install

   # Front-end
   cd ../frontend
   npm install
   ```

2. **Configurer les variables d’environnement**
   ```bash
   cd backend
   cp env.example .env
   # éditer .env si besoin (PORT, JWT_SECRET, APP_URL)
   ```

3. **Lancer l’API et le front**
   ```bash
   # Terminal 1
   cd backend
   npm run dev

   # Terminal 2
   cd frontend
   npm run dev
   ```

   - API disponible sur `http://localhost:4000`
   - Front-end Vite sur `http://localhost:5173`

Les identifiants admin par défaut sont `admin@cinema.app` / `Admin123!`. L’espace admin permet aussi d’envoyer une affiche locale (upload) ; le fichier est servi depuis `/uploads/*` sur l’API.

## Documentation

- `install.md` : guide d’installation détaillé (web, commandes, astuces).
- `presentation.md` : présentation fonctionnelle du projet, architecture et parcours utilisateurs.

## Scripts utiles

| Répertoire | Commande | Description |
| ---------- | -------- | ----------- |
| `backend`  | `npm run dev` | API Express via nodemon |
|            | `npm start`   | API en production |
|            | `npm run lint`| Linting ESLint |
| `frontend` | `npm run dev` | Front Vite (hot reload) |
|            | `npm run build` | Build production |
|            | `npm run preview` | Prévisualisation build |

## Structure

```
.
├── backend/           # API REST (Express + SQLite)
├── frontend/          # Interface React + TypeScript (Vite)
└── docs/              # Documentation (installation, présentation)
```

## Licence

Projet pédagogique – librement réutilisable dans un cadre d’apprentissage.

