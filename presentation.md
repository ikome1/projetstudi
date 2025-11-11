# Présentation du projet – Cinéma Nova

## 1. Vision d’ensemble

Cinéma Nova est une application web permettant :

- aux spectateurs de découvrir les films à l’affiche, consulter les détails et bandes-annonces ;
- aux administrateurs de gérer la base de films et les comptes utilisateurs depuis un espace sécurisé.

Le projet illustre une architecture moderne avec :

- **Front-end** : React + TypeScript (Vite)
- **Back-end** : Node.js + Express
- **Base de données** : SQLite (embarqué, facilement remplaçable par MySQL/PostgreSQL)

---

## 2. Parcours utilisateur

### Côté public
- Page d’accueil avec grille de films, recherche par mot-clé, filtres par genre et tri.
- Page détail : synopsis, distribution, durée, genre, année et lien bande-annonce.
- Possibilité d’ajouter un film aux favoris (fonction prévue côté API via la table `favorites`).
- Gestion d’erreurs (message si l’API est indisponible).

### Côté administrateur
- Page de connexion (`/admin/login`) protégée par JWT.
- Dashboard (`/admin`) regroupant :
  - formulaire d’ajout/modification de film ;
  - tableau de gestion (édition/suppression) ;
  - liste des utilisateurs enregistrés avec leur rôle.
- Upload d’affiches : l’admin peut téléverser directement une image (PNG/JPG/WebP) ; le serveur renvoie l’URL publique et stocke le fichier dans `backend/uploads`.

Les routes d’API sont sécurisées par un middleware qui vérifie le token et le rôle `admin`.

---

## 3. Architecture applicative

```
projetstudi/
├── backend/             # API REST Express
│   ├── controllers/     # Logique métier par ressource (films, auth, admin)
│   ├── routes/          # Définition des endpoints
│   ├── models/          # Accès aux données SQLite
│   ├── middleware/      # Authentification & rôles
│   ├── database/        # Connexion + initialisation (seed)
│   └── server.js        # Point d’entrée Express
├── frontend/            # App React/Vite
│   ├── components/      # UI réutilisable (Header, FilmCard, AdminForm…)
│   ├── pages/           # Pages routées (Home, MovieDetail, Admin…)
│   ├── services/        # Appels API via Axios
│   ├── context/         # AuthContext (gestion session admin)
│   └── styles/          # Styles globaux + modules CSS
└── docs/                # Documentation (installation, présentation)
```

---

## 4. API REST

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/movies` | Liste des films avec filtres (`search`, `genre`, `sortBy`) | Public |
| `GET` | `/api/movies/:id` | Détails d’un film | Public |
| `POST` | `/api/movies` | Ajouter un film | Admin |
| `PUT` | `/api/movies/:id` | Modifier un film | Admin |
| `DELETE` | `/api/movies/:id` | Supprimer un film | Admin |
| `POST` | `/api/auth/login` | Authentification admin (JWT) | Public |
| `GET` | `/api/admin/users` | Liste des utilisateurs | Admin |
| `POST` | `/api/admin/users` | Créer un utilisateur | Admin |
| `PATCH` | `/api/admin/users/:id/role` | Changer le rôle | Admin |
| `DELETE` | `/api/admin/users/:id` | Supprimer un utilisateur | Admin |

Le middleware `authenticate` vérifie la présence du token, `authorizeAdmin` contrôle le rôle.

---

## 5. Modèle de données

### Table `movies`
- `id` (PK)
- `title`, `synopsis`, `genre`
- `duration`, `year`
- `cast`, `trailerUrl`, `posterUrl`
- `createdAt`, `updatedAt`

### Table `users`
- `id` (PK)
- `name`, `email` (unique)
- `password` (hashé via bcrypt)
- `role` (`admin` ou `user`)
- `createdAt`, `updatedAt`

### Table `favorites` (optionnelle)
- `id` (PK)
- `userId` (FK → users)
- `movieId` (FK → movies)
- `rating` (entier 1..5)

---

## 6. Sécurité

- Mots de passe chiffrés (bcrypt, salt 10).
- Tokens JWT signés avec `JWT_SECRET` (durée de vie 8h).
- Routes admin protégées (authentification + autorisation).
- Entrées sanitizées côté front ; validations de base côté back.

---

## 7. UX & design

- Thème sombre inspiré de l’univers cinéma.
- Responsive (grid, flex et media queries).
- Animations légères (hover, transitions).
- Navigation React Router ; scroll vers le haut à chaque changement de page.

---

## 8. Pistes d’évolution

- Mettre en place la gestion des favoris côté front (association user/film).
- Ajouter la notation et un top des films les mieux notés.
- Implémenter un système de commentaires ou critiques.
- Gérer plusieurs salles et séances avec réservation.
- Intégrer l’envoi d’emails (confirmation, récupération de mot de passe).
- Migrer la base vers MySQL/PostgreSQL pour une production à grande échelle.

---

## 9. Maintenance

- Linting (`npm run lint`) côté back et front.
- Couvrir les contrôleurs avec des tests (Jest/Supertest) — non inclus mais facilement ajoutable.
- Mise à jour du seed initial dans `backend/database/db.js` si de nouveaux films doivent apparaître au premier lancement.

Cinéma Nova fournit une base solide pour un site de cinéma moderne avec un back-office administrable. Utilisez ce socle pour enrichir votre portfolio ou comme point de départ vers un produit plus complet. 

