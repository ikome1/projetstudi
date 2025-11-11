import { useEffect, useMemo, useState } from 'react';
import FilmCard from '@components/FilmCard';
import { movieService } from '@services/api';
import { Movie } from '@types/Movie';

import styles from './Movies.module.css';

type Filters = {
  search: string;
  genre: string;
  sortBy: string;
};

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    genre: '',
    sortBy: 'created_desc'
  });
  const [currentPage, setCurrentPage] = useState(1);

  const PER_PAGE = 12;

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setError(null);
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
  }, [filters]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(movies.length / PER_PAGE)), [movies.length]);

  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * PER_PAGE;
    return movies.slice(startIndex, startIndex + PER_PAGE);
  }, [currentPage, movies]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="container">
      <section className={styles.hero}>
        <div>
          <h1>Catalogue complet des films</h1>
          <p>
            Retrouvez ici l’ensemble des films disponibles sur Cinéma Nova. Utilisez la recherche et les filtres pour affiner vos découvertes.
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
              <option value="created_desc">Ajout les plus récents</option>
              <option value="created_asc">Ajout les plus anciens</option>
              <option value="year_desc">Année décroissante</option>
              <option value="year_asc">Année croissante</option>
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
            {paginatedMovies.map((movie) => (
              <div key={movie.id} className={styles.cardItem}>
                <FilmCard movie={movie} />
              </div>
            ))}
            {paginatedMovies.length === 0 && <p>Aucun film ne correspond à vos critères.</p>}
          </div>
        )}
        {!loading && !error && movies.length > 0 && (
          <div className={styles.pagination}>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </button>
            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    type="button"
                    className={page === currentPage ? styles.activePage : undefined}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Movies;

