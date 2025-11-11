import styles from './Contact.module.css';

const Contact = () => {
  return (
    <div className="container">
      <section className={styles.hero}>
        <h1>Contact & Service client</h1>
        <p>
          Besoin d’aide pour votre réservation ou pour toute autre question concernant Cinéma Nova ?
          Notre équipe est à votre disposition.
        </p>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h2>Support téléphonique</h2>
          <p>
            Du lundi au samedi, 9h-19h
            <br />
            <strong>+33 1 23 45 67 89</strong>
          </p>
        </div>

        <div className={styles.card}>
          <h2>Email</h2>
          <p>
            Réponse sous 24h ouvrées
            <br />
            <a href="mailto:support@cinemanova.app">support@cinemanova.app</a>
          </p>
        </div>

        <div className={styles.card}>
          <h2>Annulation de réservation</h2>
          <p>
            Pour annuler une place réservée, contactez notre service client en précisant votre numéro de réservation.
            Nous effectuerons la mise à jour dès réception de votre demande.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Contact;
