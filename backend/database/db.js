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

  const admin = await get('SELECT id FROM users WHERE email = ?', ['admin@cinema.app']);
  if (!admin) {
    const hashed = await bcrypt.hash('Admin123!', 10);
    await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Administrateur', 'admin@cinema.app', hashed, 'admin']
    );
    console.log('Compte admin par défaut créé : admin@cinema.app / Admin123!');
  }

  await seedMovies();
}

async function seedMovies() {
  const legacyTitles = [
    'Les Échos de la Nuit',
    'Odyssée Quantique',
    'Un été à Séville'
  ];

  if (legacyTitles.length > 0) {
    await run(
      `DELETE FROM movies WHERE title IN (${legacyTitles.map(() => '?').join(', ')})`,
      legacyTitles
    );
  }

  const samples = [
    {
      title: 'Matrix',
      synopsis:
        'Un hacker découvre que la réalité est une simulation et rejoint la résistance pour libérer l’humanité.',
      genre: 'Science-Fiction',
      duration: 136,
      year: 1999,
      cast: 'Keanu Reeves, Laurence Fishburne',
      trailerUrl: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
      posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg'
    },
    {
      title: 'Transformers',
      synopsis:
        'Les Autobots et les Decepticons s’affrontent sur Terre, entraînant un jeune homme au cœur de leur guerre.',
      genre: 'Action',
      duration: 144,
      year: 2007,
      cast: 'Shia LaBeouf, Megan Fox',
      trailerUrl: 'https://www.youtube.com/watch?v=AntcyqJ6brc',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/6/66/Transformers07.jpg'
    },
    {
      title: 'Avatar',
      synopsis:
        'Sur Pandora, un soldat humain tombe amoureux de la culture Na’vi et doit choisir son camp.',
      genre: 'Science-Fiction',
      duration: 162,
      year: 2009,
      cast: 'Sam Worthington, Zoe Saldaña',
      trailerUrl: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
      posterUrl: 'https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg'
    },
    {
      title: 'Avatar : La Voie de l’Eau',
      synopsis:
        'Jake Sully et Neytiri protègent leur famille face à une nouvelle menace humaine en explorant les océans de Pandora.',
      genre: 'Science-Fiction',
      duration: 192,
      year: 2022,
      cast: 'Sam Worthington, Zoe Saldaña',
      trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
      posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg'
    },
    {
      title: 'John Wick',
      synopsis:
        'Un ancien tueur à gages reprend les armes pour venger ceux qui ont tué son chien et profané la mémoire de sa femme.',
      genre: 'Action',
      duration: 101,
      year: 2014,
      cast: 'Keanu Reeves, Michael Nyqvist',
      trailerUrl: 'https://www.youtube.com/watch?v=2AUmvWm5ZDQ',
      posterUrl: 'https://image.tmdb.org/t/p/w500/b9uYMMbm87IBFOq59pppvkkkgNg.jpg'
    },
    {
      title: 'Mad Max: Fury Road',
      synopsis:
        'Dans un désert post-apocalyptique, Max et Furiosa fuient un tyran au cours d’une poursuite effrénée.',
      genre: 'Action',
      duration: 120,
      year: 2015,
      cast: 'Tom Hardy, Charlize Theron',
      trailerUrl: 'https://www.youtube.com/watch?v=hEJnMQG9ev8',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg'
    },
    {
      title: 'Die Hard',
      synopsis:
        'John McClane affronte seul un groupe de terroristes dans un gratte-ciel de Los Angeles le soir de Noël.',
      genre: 'Action',
      duration: 132,
      year: 1988,
      cast: 'Bruce Willis, Alan Rickman',
      trailerUrl: 'https://www.youtube.com/watch?v=jaJuwKCmJbY',
      posterUrl: 'https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg'
    },
    {
      title: 'The Dark Knight',
      synopsis:
        'Batman affronte le Joker, qui plonge Gotham City dans le chaos et met sa morale à l’épreuve.',
      genre: 'Super-héros',
      duration: 152,
      year: 2008,
      cast: 'Christian Bale, Heath Ledger',
      trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
    },
    {
      title: 'Inception',
      synopsis:
        'Un voleur qui pénètre les rêves doit implanter une idée dans l’esprit d’un héritier et affronter son subconscient.',
      genre: 'Science-Fiction',
      duration: 148,
      year: 2010,
      cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt',
      trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      posterUrl: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg'
    },
    {
      title: 'Fast & Furious 7',
      synopsis:
        'Dom et son équipe affrontent un ancien agent décidés à se venger, dans des poursuites à travers le monde.',
      genre: 'Action',
      duration: 137,
      year: 2015,
      cast: 'Vin Diesel, Paul Walker',
      trailerUrl: 'https://www.youtube.com/watch?v=Skpu5HaVkOc',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Furious_7_poster.jpg'
    }
  ];

  const sampleTitles = samples.map((movie) => movie.title);
  await run(
    `DELETE FROM movies WHERE title IN (${sampleTitles.map(() => '?').join(', ')})`,
    sampleTitles
  );

  for (const movie of samples) {
    const existing = await get('SELECT id FROM movies WHERE title = ?', [movie.title]);
    if (!existing) {
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
  }
}

