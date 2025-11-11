import { Link } from 'react-router-dom';
import { Movie } from '@types/Movie';
import styles from './FilmCard.module.css';

type FilmCardProps = {
  movie: Movie;
};

const FilmCard = ({ movie }: FilmCardProps) => {
  const createdAtDate = movie.createdAt ? new Date(movie.createdAt) : null;
  const isValidCreatedAt = createdAtDate && !Number.isNaN(createdAtDate.getTime());

  const isNew = (() => {
    if (!isValidCreatedAt || !createdAtDate) {
      return false;
    }

    const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
    const ageInMs = Date.now() - createdAtDate.getTime();
    return ageInMs >= 0 && ageInMs <= THIRTY_DAYS_IN_MS;
  })();

  const formattedCreatedAt = isValidCreatedAt
    ? new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(createdAtDate!)
    : null;

  return (
    <article className={styles.card}>
      <div className={styles.poster}>
        <img src={movie.posterUrl} alt={`Affiche de ${movie.title}`} />
        <span className={styles.year}>{movie.year}</span>
        {isNew && <span className={styles.newBadge}>Nouveau</span>}
      </div>
      <div className={styles.content}>
        <h3>{movie.title}</h3>
        <p className={styles.genre}>{movie.genre}</p>
        <div className={styles.meta}>
          <span>{movie.duration} min</span>
          <span>{movie.cast}</span>
          {formattedCreatedAt && <span className={styles.createdAt}>Ajouté le {formattedCreatedAt}</span>}
        </div>
        <div className={styles.actions}>
          <Link to={`/movies/${movie.id}`} className={styles.link}>
            Voir les détails
          </Link>
          {movie.trailerUrl && (
            <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer">
              Bande-annonce
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default FilmCard;

