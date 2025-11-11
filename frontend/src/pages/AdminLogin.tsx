import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, setAuthToken } from '@services/api';
import { useAuth } from '../context/AuthContext';

import styles from './AdminLogin.module.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      login(data);
      setAuthToken(data.token);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Identifiants invalides ou accès refusé.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <h1>Espace administrateur</h1>
        <p>Connectez-vous pour gérer les films et utilisateurs.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Mot de passe
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className={styles.hint}>
          Identifiants de démonstration : <code>admin@cinema.app</code> / <code>Admin123!</code>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

