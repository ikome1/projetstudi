import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import styles from './Header.module.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.wrapper}>
          <Link to="/" className={styles.brand}>
            Cinéma Nova
          </Link>
          <nav className={styles.nav}>
            <NavLink to="/" end>
              Accueil
            </NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </nav>
          <div className={styles.actions}>
            {isAuthenticated && user ? (
              <>
                <span className={styles.user}>{user.name}</span>
                <button onClick={handleLogout}>Déconnexion</button>
              </>
            ) : (
              <Link to="/admin/login" className={styles.login}>
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

