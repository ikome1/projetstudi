import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminForm from '@components/AdminForm';
import { movieService, adminService, setAuthToken } from '@services/api';
import { Movie, MovieInput } from '@types/Movie';
import { User } from '@types/User';
import { useAuth } from '../context/AuthContext';

import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { isAuthenticated, user, token } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Movie | null>(null);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }
    async function loadData() {
      try {
        setLoading(true);
        const [movieList, userList] = await Promise.all([
          movieService.list(),
          adminService.listUsers()
        ]);
        setMovies(movieList);
        setUsers(userList);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les données admin.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated, isAdmin]);

  const handleCreateOrUpdate = async (values: MovieInput, id?: number) => {
    if (id) {
      const updated = await movieService.update(id, values);
      setMovies((prev) => prev.map((movie) => (movie.id === id ? updated : movie)));
      setEditing(null);
    } else {
      const created = await movieService.create(values);
      setMovies((prev) => [created, ...prev]);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce film ?')) return;
    await movieService.remove(id);
    setMovies((prev) => prev.filter((movie) => movie.id !== id));
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container">
        <p className={styles.error}>Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <section className={styles.header}>
        <div>
          <h1>Dashboard Admin</h1>
          <p>Ajoutez, modifiez ou supprimez les films. Consultez les utilisateurs inscrits.</p>
        </div>
      </section>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p>Chargement des données...</p>}

      {!loading && !error && (
        <>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>{editing ? 'Modifier un film' : 'Ajouter un film'}</h2>
              {editing && (
                <button className={styles.secondary} onClick={() => setEditing(null)}>
                  Nouveau film
                </button>
              )}
            </div>
            <AdminForm
              initialValues={editing}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => setEditing(null)}
            />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>Films publiés</h2>
              <span>{movies.length} film(s)</span>
            </div>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Genre</th>
                    <th>Année</th>
                    <th>Durée</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id}>
                      <td>{movie.title}</td>
                      <td>{movie.genre}</td>
                      <td>{movie.year}</td>
                      <td>{movie.duration} min</td>
                      <td className={styles.actions}>
                        <button onClick={() => setEditing(movie)}>Modifier</button>
                        <button className={styles.danger} onClick={() => handleDelete(movie.id)}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>Utilisateurs</h2>
              <span>{users.length} compte(s)</span>
            </div>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => (
                    <tr key={account.id}>
                      <td>{account.name}</td>
                      <td>{account.email}</td>
                      <td>{account.role}</td>
                      <td>{new Date(account.createdAt ?? '').toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

