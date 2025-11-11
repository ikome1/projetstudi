import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '@services/api';
import { Movie } from '@types/Movie';

import styles from './MovieDetail.module.css';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const movieId = Number(id);
    if (Number.isNaN(movieId)) {
      setError('Identifiant invalide.');
      setLoading(false);
      return;
    }

    async function loadMovie() {
      try {
        setLoading(true);
        const data = await movieService.get(movieId);
        setMovie(data);
      } catch (err) {
        console.error(err);
        setError('Film introuvable ou erreur serveur.');
      } finally {
        setLoading(false);
      }
    }

    loadMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <p>Chargement du film...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container">
        <p className={styles.error}>{error ?? 'Film introuvable.'}</p>
        <Link to="/" className={styles.backLink}>
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.layout}`}>
      <div className={styles.poster}>
        <img src={movie.posterUrl} alt={`Affiche de ${movie.title}`} />
      </div>
      <div className={styles.content}>
        <Link to="/" className={styles.backLink}>
          ← Retour
        </Link>
        <h1>{movie.title}</h1>
        <p className={styles.genre}>{movie.genre} · {movie.year}</p>
        <p className={styles.synopsis}>{movie.synopsis}</p>
        <ul className={styles.meta}>
          <li>Durée : {movie.duration} minutes</li>
          <li>Distribution : {movie.cast}</li>
        </ul>
        {movie.trailerUrl && (
          <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" className={styles.trailer}>
            Voir la bande-annonce
          </a>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;

