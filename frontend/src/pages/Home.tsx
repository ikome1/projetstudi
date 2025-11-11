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
    async function loadMovies() {
      try {
        setLoading(true);
        const data = await movieService.list({
          search: filters.search || undefined,
          genre: filters.genre || undefined,
          sortBy: filters.sortBy || undefined
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
    return () => controller.abort();
  }, [filters]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container">
      <section className={styles.hero}>
        <div>
          <h1>Découvrez, notez et partagez vos films favoris</h1>
          <p>
            Cinéma Nova vous propose une sélection de films soigneusement choisis. Explorez les genres, regardez les bandes-annonces et créez votre liste personnelle.
          </p>
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
          </div>
        </div>
      </section>

      <section className={styles.listSection}>
        {loading && <p>Chargement des films...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <div className={styles.grid}>
            {movies.map((movie) => (
              <FilmCard key={movie.id} movie={movie} />
            ))}
            {movies.length === 0 && <p>Aucun film ne correspond à vos critères.</p>}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

