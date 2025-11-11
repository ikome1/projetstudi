import * as Movie from '../models/Movie.js';
import * as DailySchedule from '../models/DailySchedule.js';

// Contrôleur responsable des opérations liées aux films ainsi qu’à la mise en avant quotidienne.
// Chaque handler se contente de valider les paramètres, d’appeler le modèle et de retourner une réponse JSON adaptée.

export async function listMovies(req, res) {
  try {
    const { search, genre, sortBy, limit } = req.query;
    let parsedLimit;

    if (typeof limit === 'string' && limit.trim() !== '') {
      const numericLimit = Number.parseInt(limit, 10);
      if (Number.isInteger(numericLimit) && numericLimit > 0) {
        parsedLimit = numericLimit;
      }
    }

    // Récupère la liste de films avec les filtres éventuels (recherche, genre, tri, limite).
    const movies = await Movie.findAll({ search, genre, sortBy, limit: parsedLimit });
    res.json(movies);
  } catch (error) {
    console.error('Erreur listMovies :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des films.' });
  }
}

export async function getMovie(req, res) {
  try {
    const { id } = req.params;
    // Recherche du film par son identifiant unique.
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
    // Insert en base directement depuis le payload (validations côté formulaire/admin).
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
    // On vérifie d’abord que le film existe pour retourner un 404 sinon.
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
    // Suppression sécurisée : on confirme l’existence avant d’effacer.
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

export async function getTodayHighlight(req, res) {
  try {
    const date =
      typeof req.query.date === 'string' && req.query.date.trim() !== ''
        ? req.query.date.trim()
        : new Date().toISOString().slice(0, 10);
    // Renvoie le film programmé pour la date donnée (au format AAAA-MM-JJ).
    const highlight = await DailySchedule.getByDate(date);
    res.json(highlight ?? null);
  } catch (error) {
    console.error('Erreur getTodayHighlight :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la programmation du jour.' });
  }
}

export async function setTodayHighlight(req, res) {
  try {
    const { movieId, date, startTime } = req.body;
    const targetDate =
      typeof date === 'string' && date.trim() !== '' ? date.trim() : new Date().toISOString().slice(0, 10);

    if (movieId == null) {
      // Aucun film envoyé ⇒ on supprime la programmation pour la date ciblée.
      await DailySchedule.removeByDate(targetDate);
      return res.status(200).json(null);
    }

    const numericMovieId = Number(movieId);
    if (!Number.isInteger(numericMovieId) || numericMovieId <= 0) {
      return res.status(400).json({ message: 'Identifiant de film invalide.' });
    }

    if (typeof startTime !== 'string' || startTime.trim() === '') {
      return res.status(400).json({ message: "L'heure de diffusion est requise." });
    }

    // Validation que l’ID correspond bien à un film existant.
    const movie = await Movie.findById(numericMovieId);
    if (!movie) {
      return res.status(404).json({ message: 'Film introuvable.' });
    }

    // Insère ou met à jour le film du jour avec l’heure (table daily_schedule).
    const highlight = await DailySchedule.setForDate(targetDate, numericMovieId, startTime.trim());
    res.json(highlight);
  } catch (error) {
    console.error('Erreur setTodayHighlight :', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la programmation du jour.' });
  }
}
