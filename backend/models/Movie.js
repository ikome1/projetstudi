import { all, get, run } from '../database/db.js';

export async function findAll({ search, genre, sortBy } = {}) {
  let query = 'SELECT * FROM movies';
  const clauses = [];
  const params = [];

  if (search) {
    clauses.push('(LOWER(title) LIKE ? OR LOWER(genre) LIKE ?)');
    const s = `%${search.toLowerCase()}%`;
    params.push(s, s);
  }

  if (genre) {
    clauses.push('LOWER(genre) = ?');
    params.push(genre.toLowerCase());
  }

  if (clauses.length > 0) {
    query += ` WHERE ${clauses.join(' AND ')}`;
  }

  switch (sortBy) {
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

  return all(query, params);
}

export function findById(id) {
  return get('SELECT * FROM movies WHERE id = ?', [id]);
}

export async function create(movie) {
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
  return run('DELETE FROM movies WHERE id = ?', [id]);
}

