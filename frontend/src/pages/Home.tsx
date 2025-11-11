<<<<<<< HEAD
import { useEffect, useState } from 'react';
import FilmCard from '@components/FilmCard';
import { movieService } from '@services/api';
import { Movie } from '@types/Movie';

import styles from './Home.module.css';

type Filters = {
  search: string;
  genre: string;
  sortBy: string;
};

const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    genre: '',
    sortBy: 'year_desc'
  });

  useEffect(() => {
    const controller = new AbortController();
=======
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FilmCard from '@components/FilmCard';
import { movieService } from '@services/api';
import { Movie, MovieHighlight } from '@types/Movie';

import styles from './Home.module.css';

const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [todayHighlight, setTodayHighlight] = useState<MovieHighlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightLoading, setHighlightLoading] = useState(true);
  const [highlightError, setHighlightError] = useState<string | null>(null);

  useEffect(() => {
>>>>>>> 81156c2 (1 er modification)
    async function loadMovies() {
      try {
        setLoading(true);
        const data = await movieService.list({
<<<<<<< HEAD
          search: filters.search || undefined,
          genre: filters.genre || undefined,
          sortBy: filters.sortBy || undefined
=======
          sortBy: 'created_desc',
          limit: 3
>>>>>>> 81156c2 (1 er modification)
        });
        setMovies(data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les films. Réessayez plus tard.');
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
<<<<<<< HEAD
    return () => controller.abort();
  }, [filters]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container">
=======
  }, []);

  useEffect(() => {
    async function loadHighlight() {
      try {
        setHighlightLoading(true);
        const data = await movieService.getTodayHighlight();
        setTodayHighlight(data);
        setHighlightError(null);
      } catch (err) {
        console.error(err);
        setHighlightError('Impossible de charger la programmation du jour.');
      } finally {
        setHighlightLoading(false);
      }
    }
    loadHighlight();
  }, []);

  const highlightDateLabel = useMemo(() => {
    const dateToFormat = todayHighlight?.scheduleDate ?? new Date().toISOString().slice(0, 10);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateToFormat));
  }, [todayHighlight]);

  const highlightTimeLabel = useMemo(() => {
    if (!todayHighlight?.scheduleTime) {
      return null;
    }
    const [hour, minute] = todayHighlight.scheduleTime.split(':');
    if (hour == null || minute == null) {
      return todayHighlight.scheduleTime;
    }
    return `${hour}h${minute}`;
  }, [todayHighlight]);

  return (
    <div className="container">
      <section className={styles.feature}>
        {highlightLoading ? (
          <div className={styles.featurePlaceholder}>
            <p>Chargement de la programmation...</p>
          </div>
        ) : highlightError ? (
          <div className={styles.featurePlaceholder}>
            <p className={styles.error}>{highlightError}</p>
          </div>
        ) : todayHighlight ? (
          <>
            <img
              src={todayHighlight.posterUrl}
              alt={`Affiche de ${todayHighlight.title}`}
              className={styles.featureImage}
            />
            <div className={styles.featureOverlay} />
            <div className={styles.featureContent}>
              <span className={styles.featureLabel}>À la une — {highlightDateLabel}</span>
              <h2>{todayHighlight.title}</h2>
              <p className={styles.featureMeta}>
                {todayHighlight.genre} · {todayHighlight.year} ·{' '}
                {highlightTimeLabel ? `Début ${highlightTimeLabel}` : 'Horaire communiqué bientôt'}
              </p>
              <div className={styles.featureActions}>
                <Link to={`/movies/${todayHighlight.id}`} className={styles.cta}>
                  Voir le détail
                </Link>
                {todayHighlight.trailerUrl && (
                  <a
                    href={todayHighlight.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaSecondary}
                  >
                    Bande-annonce
                  </a>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.featurePlaceholder}>
            <p>La programmation du jour sera annoncée prochainement.</p>
          </div>
        )}
      </section>

>>>>>>> 81156c2 (1 er modification)
      <section className={styles.hero}>
        <div>
          <h1>Découvrez, notez et partagez vos films favoris</h1>
          <p>
            Cinéma Nova vous propose une sélection de films soigneusement choisis. Explorez les genres, regardez les bandes-annonces et créez votre liste personnelle.
          </p>
<<<<<<< HEAD
        </div>
        <div className={styles.searchBox}>
          <input
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Rechercher un film..."
          />
          <div className={styles.filters}>
            <select name="genre" value={filters.genre} onChange={handleChange}>
              <option value="">Tous les genres</option>
              <option value="Thriller">Thriller</option>
              <option value="Science-Fiction">Science-Fiction</option>
              <option value="Drame">Drame</option>
            </select>
            <select name="sortBy" value={filters.sortBy} onChange={handleChange}>
              <option value="year_desc">Plus récents</option>
              <option value="year_asc">Plus anciens</option>
              <option value="title_asc">Titre A-Z</option>
              <option value="title_desc">Titre Z-A</option>
            </select>
=======
          <div className={styles.heroActions}>
            <Link to="/movies" className={styles.cta}>
              Voir tous les films
            </Link>
            <a href="#nouveautes" className={styles.ctaSecondary}>
              Dernières nouveautés
            </a>
>>>>>>> 81156c2 (1 er modification)
          </div>
        </div>
      </section>

<<<<<<< HEAD
      <section className={styles.listSection}>
=======
      <section id="nouveautes" className={styles.listSection}>
        <header className={styles.sectionHeader}>
          <h2>Derniers ajouts</h2>
          <Link to="/movies">Parcourir tout le catalogue</Link>
        </header>
>>>>>>> 81156c2 (1 er modification)
        {loading && <p>Chargement des films...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <div className={styles.grid}>
            {movies.map((movie) => (
              <FilmCard key={movie.id} movie={movie} />
            ))}
<<<<<<< HEAD
            {movies.length === 0 && <p>Aucun film ne correspond à vos critères.</p>}
=======
            {movies.length === 0 && <p>Aucun film n’a été ajouté récemment.</p>}
>>>>>>> 81156c2 (1 er modification)
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

