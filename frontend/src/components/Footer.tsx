import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.wrapper}>
          <div>
            <h3>Cinéma Nova</h3>
            <p>12 avenue des Lumières, 75000 Paris</p>
          </div>
          <div>
            <h3>Contact</h3>
            <p>contact@cinemanova.fr</p>
            <p>01 02 03 04 05</p>
          </div>
          <div>
            <h3>Suivez-nous</h3>
            <p>Instagram · Facebook · TikTok</p>
          </div>
        </div>
        <p className={styles.bottom}>© {new Date().getFullYear()} Cinéma Nova. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;

