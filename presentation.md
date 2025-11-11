# Présentation du projet – Cinéma Nova

## 1. Vision d’ensemble

Cinéma Nova est une application web permettant :

- aux spectateurs de découvrir les films à l’affiche, consulter les détails et bandes-annonces ;
- de mettre en avant la programmation du jour via un bandeau “À la une” ;
- de réserver une place parmi 50 sièges disponibles (paiement simulé, code de réservation à présenter) ;
- aux administrateurs de gérer les films, la programmation quotidienne et l’ensemble des réservations depuis un espace sécurisé.

Le projet illustre une architecture moderne avec :

- **Front-end** : React + TypeScript (Vite)
- **Back-end** : Node.js + Express
- **Base de données** : SQLite (embarqué, facilement remplaçable par MySQL/PostgreSQL)

---

## 2. Parcours utilisateur

### Côté public
- Page d’accueil avec bannière “À la une” (film programmé aujourd’hui), bouton vers la fiche et bande-annonce.
- Catalogue `/movies` avec pagination (12 films par page), recherche, filtrage et tri.
- Page détail : synopsis, distribution, durée, genre, année et lien bande-annonce.
- Page `/reservation` : sélection interactive des 50 places (vert = disponible, gris = réservée), formulaire de paiement fictif et génération d’un numéro de réservation individuel.
- Page `/contact` : informations service client et procédure d’annulation (contact obligatoire pour libérer une place déjà bloquée).
- Gestion d’erreurs (message si l’API est indisponible, si une place vient d’être prise entre-temps, etc.).

### Côté administrateur
- Page de connexion (`/admin/login`) protégée par JWT (le lien n’apparaît qu’une fois connecté).
- Dashboard (`/admin`) regroupant :
  - formulaire d’ajout/modification de film ;
  - tableau de gestion (édition/suppression) ;
  - liste des utilisateurs enregistrés avec leur rôle ;
  - programmation du film du jour (choix du film + horaire) ;
  - tableau des réservations (code, place, date) avec actions *Annuler* et *Réinitialiser toutes les places*.
- Upload d’affiches : l’admin peut téléverser directement une image (PNG/JPG/WebP) ; le serveur renvoie l’URL publique et stocke le fichier dans `backend/uploads`.

Les routes d’API sont sécurisées par un middleware qui vérifie le token et le rôle `admin`.

---

## 3. Architecture applicative

```
projetstudi/
├── backend/             # API REST Express
│   ├── controllers/     # Logique métier par ressource (films, auth, admin, réservations)
│   ├── routes/          # Définition des endpoints
│   ├── models/          # Accès aux données SQLite
│   ├── middleware/      # Authentification & rôles
│   ├── database/        # Connexion + initialisation (seed)
│   └── server.js        # Point d’entrée Express
├── frontend/            # App React/Vite
│   ├── components/      # UI réutilisable (Header, FilmCard, AdminForm…)
│   ├── pages/           # Pages routées (Home, Movies, Reservation, Admin…)
│   ├── services/        # Appels API via Axios
│   ├── context/         # AuthContext (gestion session admin)
│   └── styles/          # Styles globaux + modules CSS
└── docs/                # Documentation (installation, présentation)
```

---

## 4. API REST

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/movies` | Liste des films avec filtres (`search`, `genre`, `sortBy`, `limit`) | Public |
| `GET` | `/api/movies/:id` | Détails d’un film | Public |
| `GET` | `/api/movies/highlight/today` | Film programmé aujourd’hui | Public |
| `POST` | `/api/movies` | Ajouter un film | Admin |
| `PUT` | `/api/movies/:id` | Modifier un film | Admin |
| `DELETE` | `/api/movies/:id` | Supprimer un film | Admin |
| `POST` | `/api/auth/login` | Authentification admin (JWT) | Public |
| `GET` | `/api/reservations` | Liste des places réservées | Public |
| `POST` | `/api/reservations` | Réserver une place (paiement simulé) | Public |
| `GET` | `/api/admin/users` | Liste des utilisateurs | Admin |
| `POST` | `/api/admin/users` | Créer un utilisateur | Admin |
| `PATCH` | `/api/admin/users/:id/role` | Changer le rôle | Admin |
| `DELETE` | `/api/admin/users/:id` | Supprimer un utilisateur | Admin |
| `POST` | `/api/admin/schedule/today` | Définir/retirer le film du jour | Admin |
| `GET` | `/api/admin/reservations` | Liste complète des réservations | Admin |
| `DELETE` | `/api/admin/reservations/:seatNumber` | Annuler une place | Admin |
| `POST` | `/api/admin/reservations/reset` | Réinitialiser toutes les places | Admin |

Le middleware `authenticate` vérifie la présence du token ; `authorizeAdmin` contrôle le rôle.

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

### Table `daily_schedule`
- `id` (PK)
- `date` (unique, format ISO)
- `movieId` (FK → movies)
- `startTime` (HH:MM)
- `createdAt`, `updatedAt`

### Table `reservations`
- `id` (PK)
- `seatNumber` (unique, 1..50)
- `reservationCode` (unique, type `RSV-05-AB12CD`)
- `createdAt`

---

## 6. Sécurité

- Mots de passe chiffrés (bcrypt, salt 10).
- Tokens JWT signés avec `JWT_SECRET` (durée de vie 8h).
- Routes admin protégées (authentification + autorisation) et liens masqués tant que l’admin n’est pas connecté.
- Réservation : paiement simulé, aucune donnée bancaire persistée, code de réservation à conserver pour l’entrée.
- Entrées sanitizées côté front ; validations basiques côté back (contrôle de l’intervalle des sièges, unicité…).

---

## 7. UX & design

- Thème sombre inspiré de l’univers cinéma.
- Responsive (grid, flex et media queries).
- Animations légères (hover, transitions).
- Navigation React Router ; retour en haut de page à chaque changement de route.

---

## 8. Pistes d’évolution

- Mettre en place la gestion des favoris côté front (association user/film).
- Ajouter la notation et un top des films les mieux notés.
- Implémenter un système de commentaires ou critiques.
- Étendre la réservation à plusieurs salles / horaires, ajouter les annulations côté utilisateur.
- Intégrer l’envoi d’emails (confirmation de réservation, récupération de mot de passe, rappel de séance).
- Migrer la base vers MySQL/PostgreSQL pour une production à grande échelle.

---

## 9. Maintenance

- Linting (`npm run lint`) côté back et front.
- Couvrir les contrôleurs avec des tests (Jest/Supertest) — non inclus mais facilement ajoutable.
- Mise à jour du seed initial dans `backend/database/db.js` si de nouveaux films doivent apparaître au premier lancement.

Cinéma Nova fournit une base solide pour un site de cinéma moderne avec un back-office administrable. Utilisez ce socle pour enrichir votre portfolio ou comme point de départ vers un produit plus complet. 

