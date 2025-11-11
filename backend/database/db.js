import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Ce module encapsule toute la configuration SQLite :
// - ouverture de la connexion
// - helpers `run`, `get`, `all` pour retourner des promesses
// - création des tables et seed initial (films + compte admin)
// Toute la logique métier consomme ensuite ces helpers via les modèles.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'cinema.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base SQLite :', err.message);
  } else {
    console.log('Connexion SQLite établie :', dbPath);
  }
});

/**
 * Exécute une requête SQL sans résultat (INSERT/UPDATE/DELETE/DDL).
 */
export function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Exécute une requête SELECT retournant une seule ligne.
 */
export function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Exécute une requête SELECT retournant plusieurs lignes.
 */
export function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function initializeDatabase() {
  // Création des tables nécessaires si elles n’existent pas encore.
  await run(`CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    synopsis TEXT,
    genre TEXT,
    duration INTEGER,
    year INTEGER,
    cast TEXT,
    trailerUrl TEXT,
    posterUrl TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    movieId INTEGER NOT NULL,
    rating INTEGER,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE
  )`);

  await run(`CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seatNumber INTEGER NOT NULL UNIQUE,
    reservationCode TEXT NOT NULL UNIQUE,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS daily_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    movieId INTEGER NOT NULL,
    startTime TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE
  )`);

  try {
    // Migration douce : on tente d’ajouter la colonne (si déjà présente, on ignore l’erreur).
    await run('ALTER TABLE daily_schedule ADD COLUMN startTime TEXT');
  } catch (error) {
    if (!String(error?.message).includes('duplicate column name')) {
      throw error;
    }
  }

  // Seed du compte administrateur par défaut.
  const admin = await get('SELECT id FROM users WHERE email = ?', ['admin@cinema.app']);
  if (!admin) {
    const hashed = await bcrypt.hash('Admin123!', 10);
    await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Administrateur', 'admin@cinema.app', hashed, 'admin']
    );
    console.log('Compte admin par défaut créé : admin@cinema.app / Admin123!');
  }

  const movieCount = await get('SELECT COUNT(*) as total FROM movies');
  if (!movieCount || movieCount.total === 0) {
    // Remplit la base avec trois films de démonstration pour donner du contenu initial.
    await seedMovies();
  }
}

async function seedMovies() {
  // Jeux d’échantillon pour que l’interface publique affiche des films lors du premier lancement.
  const samples = [
    {
      title: 'Les Échos de la Nuit',
      synopsis: 'Une enquête surnaturelle dans une métropole où chaque son révèle un secret.',
      genre: 'Thriller',
      duration: 118,
      year: 2024,
      cast: 'A. Dupont, L. Garnier',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      posterUrl: 'https://picsum.photos/400/600?random=1'
    },
    {
      title: 'Odyssée Quantique',
      synopsis: 'Deux scientifiques explorent des réalités parallèles pour sauver l’humanité.',
      genre: 'Science-Fiction',
      duration: 132,
      year: 2025,
      cast: 'M. Laurent, J. Saidi',
      trailerUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      posterUrl: 'https://picsum.photos/400/600?random=2'
    },
    {
      title: 'Un été à Séville',
      synopsis: 'Un récit intimiste sur la quête de soi au cœur de l’Andalousie.',
      genre: 'Drame',
      duration: 104,
      year: 2023,
      cast: 'C. Moreno, P. Ruiz',
      trailerUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
      posterUrl: 'https://picsum.photos/400/600?random=3'
    }
  ];

  for (const movie of samples) {
    await run(
      `INSERT INTO movies (title, synopsis, genre, duration, year, cast, trailerUrl, posterUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        movie.title,
        movie.synopsis,
        movie.genre,
        movie.duration,
        movie.year,
        movie.cast,
        movie.trailerUrl,
        movie.posterUrl
      ]
    );
  }

  console.log('Films de démonstration insérés.');
}

