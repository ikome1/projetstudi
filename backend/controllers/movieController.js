import * as Movie from '../models/Movie.js';

export async function listMovies(req, res) {
  try {
    const { search, genre, sortBy } = req.query;
    const movies = await Movie.findAll({ search, genre, sortBy });
    res.json(movies);
  } catch (error) {
    console.error('Erreur listMovies :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des films.' });
  }
}

export async function getMovie(req, res) {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ message: 'Film introuvable.' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Erreur getMovie :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du film.' });
  }
}

export async function createMovie(req, res) {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    console.error('Erreur createMovie :', error);
    res.status(500).json({ message: 'Erreur lors de la création du film.' });
  }
}

export async function updateMovie(req, res) {
  try {
    const { id } = req.params;
    const existing = await Movie.findById(id);

    if (!existing) {
      return res.status(404).json({ message: 'Film introuvable.' });
    }

    const movie = await Movie.update(id, req.body);
    res.json(movie);
  } catch (error) {
    console.error('Erreur updateMovie :', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du film.' });
  }
}

export async function deleteMovie(req, res) {
  try {
    const { id } = req.params;
    const existing = await Movie.findById(id);

    if (!existing) {
      return res.status(404).json({ message: 'Film introuvable.' });
    }

    await Movie.remove(id);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur deleteMovie :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du film.' });
  }
}

