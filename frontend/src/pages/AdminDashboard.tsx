import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminForm from '@components/AdminForm';
import { movieService, adminService, setAuthToken, adminReservationService } from '@services/api';
import { Movie, MovieHighlight, MovieInput } from '@types/Movie';
import { Reservation } from '@types/Reservation';
import { User } from '@types/User';
import { useAuth } from '../context/AuthContext';

import styles from './AdminDashboard.module.css';

const TOTAL_SEATS = 50;

const AdminDashboard = () => {
  // États globaux partagés par toutes les sections du dashboard.
  const { isAuthenticated, user, token } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [todayHighlight, setTodayHighlight] = useState<MovieHighlight | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [selectedHighlightId, setSelectedHighlightId] = useState<number | ''>('');
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState<{ text: string; status: 'success' | 'error' } | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    // Au montage, on injecte le token dans Axios pour toutes les requêtes admin.
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }
    // Charge en parallèle films, utilisateurs, programmation et réservations.
    async function loadData() {
      try {
        setLoading(true);
        const [movieList, userList, highlight, reservationList] = await Promise.all([
          movieService.list(),
          adminService.listUsers(),
          movieService.getTodayHighlight(),
          adminReservationService.list()
        ]);
        setMovies(movieList);
        setUsers(userList);
        setTodayHighlight(highlight);
        setSelectedHighlightId(highlight ? highlight.id : '');
        setScheduleTime(highlight?.scheduleTime ?? '');
        setReservations(reservationList);
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
    // Réutilise le même formulaire pour créer ou éditer un film.
    if (id) {
      const updated = await movieService.update(id, values);
      setMovies((prev) => prev.map((movie) => (movie.id === id ? updated : movie)));
      setTodayHighlight((prev) =>
        prev && prev.id === id ? { ...prev, ...updated } : prev
      );
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
    if (todayHighlight?.id === id) {
      setTodayHighlight(null);
      setSelectedHighlightId('');
      setScheduleTime('');
    }
  };

  const handleCancelReservation = async (seatNumber: number) => {
    // Action réservée à l’admin : libère une place spécifique suite à une annulation.
    if (!window.confirm(`Annuler la réservation de la place ${seatNumber} ?`)) {
      return;
    }
    try {
      await adminReservationService.cancel(seatNumber);
      setReservations((prev) => prev.filter((reservationItem) => reservationItem.seatNumber !== seatNumber));
    } catch (err) {
      console.error(err);
      alert('Impossible d’annuler cette réservation pour le moment.');
    }
  };

  const handleResetReservations = async () => {
    // Permet de remettre toutes les places à zéro en fin de séance.
    if (!window.confirm('Réinitialiser toutes les réservations ? Cette action libère toutes les places.')) {
      return;
    }
    try {
      await adminReservationService.reset();
      setReservations([]);
    } catch (err) {
      console.error(err);
      alert('Impossible de réinitialiser les réservations pour le moment.');
    }
  };

  const handleHighlightSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Soumission du formulaire programmation (film du jour + horaire).
    event.preventDefault();
    setScheduleSubmitting(true);
    setScheduleMessage(null);

    try {
      const movieId = selectedHighlightId === '' ? null : selectedHighlightId;
      if (movieId && scheduleTime.trim() === '') {
        setScheduleMessage({
          text: "Veuillez renseigner l'heure de diffusion.",
          status: 'error'
        });
        setScheduleSubmitting(false);
        return;
      }

      const response = await adminService.setTodayHighlight({
        movieId,
        startTime: movieId ? scheduleTime : undefined
      });
      setTodayHighlight(response);
      setSelectedHighlightId(movieId ?? '');
      setScheduleTime(response?.scheduleTime ?? '');
      setScheduleMessage({
        text: movieId
          ? 'Programmation du jour mise à jour avec succès.'
          : 'Programmation du jour réinitialisée.',
        status: 'success'
      });
    } catch (err) {
      console.error(err);
      setScheduleMessage({
        text: "Erreur lors de l'enregistrement de la programmation.",
        status: 'error'
      });
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleHighlightReset = async () => {
    // Retire la programmation du jour (bouton "Retirer la sélection").
    setScheduleSubmitting(true);
    setScheduleMessage(null);
    try {
      const response = await adminService.setTodayHighlight({ movieId: null });
      setTodayHighlight(response);
      setSelectedHighlightId('');
      setScheduleTime('');
      setScheduleMessage({
        text: 'Programmation du jour réinitialisée.',
        status: 'success'
      });
    } catch (err) {
      console.error(err);
      setScheduleMessage({
        text: 'Erreur lors de la réinitialisation de la programmation.',
        status: 'error'
      });
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(new Date()),
    []
  );

  const currentHighlightTime = useMemo(() => {
    if (!todayHighlight?.scheduleTime) {
      return null;
    }
    const [hour, minute] = todayHighlight.scheduleTime.split(':');
    if (hour == null || minute == null) {
      return todayHighlight.scheduleTime;
    }
    return `${hour}h${minute}`;
  }, [todayHighlight]);

  const bookedSeatsCount = reservations.length;

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
              <h2>Programmation du jour</h2>
              <span>{todayLabel}</span>
            </div>
            <form className={styles.scheduleForm} onSubmit={handleHighlightSubmit}>
              <label htmlFor="highlightMovie">Film diffusé aujourd'hui</label>
              <select
                id="highlightMovie"
                value={selectedHighlightId === '' ? '' : selectedHighlightId}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === '') {
                    setSelectedHighlightId('');
                    setScheduleTime('');
                  } else {
                    const parsed = Number.parseInt(value, 10);
                    setSelectedHighlightId(parsed);
                    if (todayHighlight && todayHighlight.id === parsed) {
                      setScheduleTime(todayHighlight.scheduleTime ?? '');
                    } else {
                      setScheduleTime('');
                    }
                  }
                }}
                disabled={scheduleSubmitting || movies.length === 0}
              >
                <option value="">Aucun film sélectionné</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
              <label htmlFor="highlightTime">Heure de début</label>
              <input
                id="highlightTime"
                type="time"
                value={scheduleTime}
                onChange={(event) => setScheduleTime(event.target.value)}
                disabled={scheduleSubmitting || selectedHighlightId === ''}
                required={selectedHighlightId !== ''}
              />
              <div className={styles.scheduleActions}>
                <button
                  type="submit"
                  className={styles.schedulePrimary}
                  disabled={scheduleSubmitting}
                >
                  {scheduleSubmitting ? 'Enregistrement...' : 'Enregistrer la programmation'}
                </button>
                {todayHighlight && (
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={handleHighlightReset}
                    disabled={scheduleSubmitting}
                  >
                    Retirer la sélection
                  </button>
                )}
              </div>
              {scheduleMessage && (
                <p
                  className={
                    scheduleMessage.status === 'success'
                      ? styles.feedback
                      : `${styles.feedback} ${styles.feedbackError}`
                  }
                >
                  {scheduleMessage.text}
                </p>
              )}
              {todayHighlight && (
                <p className={styles.currentHighlight}>
                  Film actuel : <strong>{todayHighlight.title}</strong>
                  {currentHighlightTime ? ` — ${currentHighlightTime}` : ''}
                </p>
              )}
            </form>
          </section>

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

          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>Réservations de places</h2>
              <span>
                {bookedSeatsCount}/{TOTAL_SEATS} place(s) réservée(s)
              </span>
            </div>
            {/* Liste des places occupées + actions d’annulation/reset */}
            <div className={styles.tableWrapper}>
              {reservations.length === 0 ? (
                <p>Aucune place réservée actuellement.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Place</th>
                      <th>Numéro de réservation</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservationItem) => (
                      <tr key={reservationItem.seatNumber}>
                        <td>{reservationItem.seatNumber}</td>
                        <td>{reservationItem.reservationCode}</td>
                        <td>{new Date(reservationItem.createdAt).toLocaleString()}</td>
                        <td className={styles.actions}>
                          <button
                            className={styles.danger}
                            onClick={() => handleCancelReservation(reservationItem.seatNumber)}
                          >
                            Annuler
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <button
              type="button"
              className={`${styles.secondary} ${styles.resetButton}`}
              onClick={handleResetReservations}
              disabled={reservations.length === 0}
            >
              Réinitialiser toutes les réservations
            </button>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
