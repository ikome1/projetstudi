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

<<<<<<< HEAD
=======
  const isAdmin = isAuthenticated && user?.role === 'admin';

>>>>>>> 81156c2 (1 er modification)
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
<<<<<<< HEAD
            <NavLink to="/admin">Admin</NavLink>
=======
            <NavLink to="/movies">Films</NavLink>
            <NavLink to="/reservation">Réservation</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
>>>>>>> 81156c2 (1 er modification)
          </nav>
          <div className={styles.actions}>
            {isAuthenticated && user ? (
              <>
                <span className={styles.user}>{user.name}</span>
                <button onClick={handleLogout}>Déconnexion</button>
              </>
<<<<<<< HEAD
            ) : (
              <Link to="/admin/login" className={styles.login}>
                Connexion
              </Link>
            )}
=======
            ) : null}
>>>>>>> 81156c2 (1 er modification)
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

