import { Link } from 'react-router-dom';
import { Movie } from '@types/Movie';
import styles from './FilmCard.module.css';

type FilmCardProps = {
  movie: Movie;
};

const FilmCard = ({ movie }: FilmCardProps) => {
  return (
    <article className={styles.card}>
      <div className={styles.poster}>
        <img src={movie.posterUrl} alt={`Affiche de ${movie.title}`} />
        <span className={styles.year}>{movie.year}</span>
      </div>
      <div className={styles.content}>
        <h3>{movie.title}</h3>
        <p className={styles.genre}>{movie.genre}</p>
        <p className={styles.synopsis}>{movie.synopsis}</p>
        <div className={styles.meta}>
          <span>{movie.duration} min</span>
          <span>{movie.cast}</span>
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

