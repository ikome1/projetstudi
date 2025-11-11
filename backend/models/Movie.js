import { all, get, run } from '../database/db.js';

// Fonctions d’accès aux données pour la ressource `movies`.
// Encapsulent les requêtes SQLite afin de garder les contrôleurs simples.

export async function findAll({ search, genre, sortBy, limit } = {}) {
  let query = 'SELECT * FROM movies';
  const clauses = [];
  const params = [];

  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    const pattern = `%${normalizedSearch}%`;
    // Recherche insensible à la casse sur le titre ou le genre.
    clauses.push('(title LIKE ? COLLATE NOCASE OR genre LIKE ? COLLATE NOCASE)');
    params.push(pattern, pattern);
  }

  const normalizedGenre = genre?.trim();
  if (normalizedGenre) {
    clauses.push('genre = ? COLLATE NOCASE');
    params.push(normalizedGenre);
  }

  if (clauses.length > 0) {
    query += ` WHERE ${clauses.join(' AND ')}`;
  }

  switch (sortBy) {
    case 'created_desc':
      query += ' ORDER BY createdAt DESC';
      break;
    case 'created_asc':
      query += ' ORDER BY createdAt ASC';
      break;
    case 'year_desc':
      query += ' ORDER BY year DESC';
      break;
    case 'year_asc':
      query += ' ORDER BY year ASC';
      break;
    case 'title_asc':
      query += ' ORDER BY title ASC';
      break;
    case 'title_desc':
      query += ' ORDER BY title DESC';
      break;
    default:
      query += ' ORDER BY createdAt DESC';
      break;
  }

  if (typeof limit === 'number' && Number.isInteger(limit) && limit > 0) {
    query += ' LIMIT ?';
    params.push(limit);
  }

  return all(query, params);
}

export function findById(id) {
  // Retourne un film unique ou `undefined` si aucun résultat.
  return get('SELECT * FROM movies WHERE id = ?', [id]);
}

export async function create(movie) {
  // Insertion d’un nouveau film. Certaines colonnes sont optionnelles côté formulaire,
  // on les remplace donc par des valeurs neutres (chaîne vide ou NULL).
  const result = await run(
    `INSERT INTO movies (title, synopsis, genre, duration, year, cast, trailerUrl, posterUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      movie.title,
      movie.synopsis || '',
      movie.genre || '',
      movie.duration || null,
      movie.year || null,
      movie.cast || '',
      movie.trailerUrl || '',
      movie.posterUrl || ''
    ]
  );
  return findById(result.id);
}

export async function update(id, movie) {
  // Mise à jour complète des champs d’un film existant, avec horodatage automatique.
  await run(
    `UPDATE movies SET
      title = ?,
      synopsis = ?,
      genre = ?,
      duration = ?,
      year = ?,
      cast = ?,
      trailerUrl = ?,
      posterUrl = ?,
      updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      movie.title,
      movie.synopsis || '',
      movie.genre || '',
      movie.duration || null,
      movie.year || null,
      movie.cast || '',
      movie.trailerUrl || '',
      movie.posterUrl || '',
      id
    ]
  );
  return findById(id);
}

export function remove(id) {
  // Suppression définitive du film en base.
  return run('DELETE FROM movies WHERE id = ?', [id]);
}

