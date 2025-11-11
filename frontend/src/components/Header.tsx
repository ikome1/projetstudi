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

  const isAdmin = isAuthenticated && user?.role === 'admin';

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
            <NavLink to="/movies">Films</NavLink>
            <NavLink to="/reservation">Réservation</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
          </nav>
          <div className={styles.actions}>
            {isAuthenticated && user ? (
              <>
                <span className={styles.user}>{user.name}</span>
                <button onClick={handleLogout}>Déconnexion</button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

