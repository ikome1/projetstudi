import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from '@components/Header';
import Footer from '@components/Footer';
import Home from '@pages/Home';
import MovieDetail from '@pages/MovieDetail';
import Movies from '@pages/Movies';
import Reservation from '@pages/Reservation';
import Contact from '@pages/Contact';
import AdminDashboard from '@pages/AdminDashboard';
import AdminLogin from '@pages/AdminLogin';
import { useAuth } from './context/AuthContext';
import { setAuthToken } from '@services/api';

// Chaque navigation remonte la page en haut (expérience similaire à un site classique).
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const App = () => {
  const { token } = useAuth();

  useEffect(() => {
    // Injecte/remet à zéro l’en-tête Authorization sur toutes les requêtes Axios.
    setAuthToken(token);
  }, [token]);

  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* Fallback : redirige toute route inconnue vers la page d’accueil */}
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;

