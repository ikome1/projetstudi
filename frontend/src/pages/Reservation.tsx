import { useEffect, useMemo, useState } from 'react';
import { reservationService } from '@services/api';
import { Reservation as ReservationType } from '@types/Reservation';

import styles from './Reservation.module.css';

const TOTAL_SEATS = 50;
const seats = Array.from({ length: TOTAL_SEATS }, (_, index) => index + 1);

type Step = 'select' | 'payment' | 'success';

type PaymentForm = {
  cardholder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

const initialPaymentState: PaymentForm = {
  cardholder: '',
  cardNumber: '',
  expiry: '',
  cvv: ''
};

const Reservation = () => {
  // Gestion de la disponibilité et du parcours en trois étapes.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservedSeats, setReservedSeats] = useState<number[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [step, setStep] = useState<Step>('select');
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(initialPaymentState);
  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState<ReservationType | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    // Récupère la liste actuelle des réservations pour colorer la grille.
    async function loadReservations() {
      try {
        setLoading(true);
        setError(null);
        const data = await reservationService.list();
        setReservedSeats(data.map((reservationItem) => reservationItem.seatNumber));
      } catch (err) {
        console.error(err);
        setError('Impossible de récupérer les disponibilités pour le moment.');
      } finally {
        setLoading(false);
      }
    }
    loadReservations();
  }, []);

  const isSeatReserved = useMemo(() => {
    // On stocke les sièges réservés dans un Set pour accélérer les vérifications dans la grille.
    const lookup = new Set(reservedSeats);
    return (seatNumber: number) => lookup.has(seatNumber);
  }, [reservedSeats]);

  const handleSeatSelect = (seatNumber: number) => {
    // L’utilisateur peut sélectionner/désélectionner une place tant qu’il est à l’étape 1.
    if (step !== 'select') return;
    if (isSeatReserved(seatNumber)) return;
    setSelectedSeat((current) => (current === seatNumber ? null : seatNumber));
  };

  const handleContinue = () => {
    if (selectedSeat == null) {
      setError('Veuillez choisir une place avant de continuer.');
      return;
    }
    setError(null);
    setStep('payment');
  };

  const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedSeat == null) {
      setPaymentError('Aucune place sélectionnée.');
      return;
    }

    const trimmedForm = {
      cardholder: paymentForm.cardholder.trim(),
      cardNumber: paymentForm.cardNumber.trim(),
      expiry: paymentForm.expiry.trim(),
      cvv: paymentForm.cvv.trim()
    };

    if (!trimmedForm.cardholder || !trimmedForm.cardNumber || !trimmedForm.expiry || !trimmedForm.cvv) {
      setPaymentError('Tous les champs de paiement sont requis (simulation).');
      return;
    }

    setPaymentError(null);
    setSubmitting(true);

    try {
      // Tentative de blocage du siège côté API (génère le code de réservation).
      const created = await reservationService.reserve({ seatNumber: selectedSeat });
      setReservation(created);
      setReservedSeats((prev) => [...prev, created.seatNumber]);
      setStep('success');
    } catch (err: unknown) {
      console.error(err);
      setPaymentError('Cette place vient d’être réservée par un autre spectateur.');
      try {
        // La réservation a échoué car la place était prise entre temps : on recharge la liste et on revient à l’étape 1.
        const latest = await reservationService.list();
        setReservedSeats(latest.map((reservationItem) => reservationItem.seatNumber));
        setSelectedSeat(null);
        setStep('select');
        setError('Cette place vient d’être réservée. Merci de choisir une place disponible.');
      } catch (refreshError) {
        console.error(refreshError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetProcess = () => {
    // Permet de repartir sur une nouvelle réservation (revenir à l’étape 1).
    setSelectedSeat(null);
    setPaymentForm(initialPaymentState);
    setReservation(null);
    setStep('select');
    setPaymentError(null);
    setError(null);
  };

  return (
    <div className="container">
      <section className={styles.hero}>
        <div>
          <h1>Réservation de places</h1>
          <p>
            Choisissez parmi les 50 places disponibles. Les places libres apparaissent en vert, les places déjà réservées en gris.
            Une fois votre place sélectionnée, validez la réservation via l’espace de paiement simulé.
          </p>
        </div>
      </section>

      {error && step === 'select' && <p className={styles.error}>{error}</p>}

      <section className={styles.content}>
        <div className={styles.layout}>
          <div className={styles.stage}>Écran</div>
          {loading ? (
            <p>Chargement des disponibilités…</p>
          ) : (
            <div className={styles.seatGrid}>
              {seats.map((seatNumber) => {
                const reserved = isSeatReserved(seatNumber);
                const selected = selectedSeat === seatNumber;
                return (
                  <button
                    key={seatNumber}
                    type="button"
                    className={`
                      ${styles.seat}
                      ${reserved ? styles.seatReserved : styles.seatAvailable}
                      ${selected ? styles.seatSelected : ''}
                    `}
                    onClick={() => handleSeatSelect(seatNumber)}
                    disabled={reserved || step !== 'select'}
                    aria-pressed={selected}
                    aria-label={`Place ${seatNumber}${reserved ? ' (réservée)' : ''}`}
                  >
                    {seatNumber}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {step === 'select' && !loading && (
          <div className={styles.panel}>
            <h2>Étape 1 · Choix de la place</h2>
            <p>
              {selectedSeat ? (
                <>
                  Vous avez sélectionné la place <strong>{selectedSeat}</strong>.
                  Cliquez sur « Continuer » pour passer à la validation.
                </>
              ) : (
                'Sélectionnez une place disponible pour continuer.'
              )}
            </p>
            <div className={styles.legend}>
              <span>
                <span className={`${styles.legendDot} ${styles.legendAvailable}`} /> Disponible
              </span>
              <span>
                <span className={`${styles.legendDot} ${styles.legendReserved}`} /> Réservée
              </span>
              <span>
                <span className={`${styles.legendDot} ${styles.legendSelected}`} /> Votre sélection
              </span>
            </div>
            <button type="button" className={styles.primary} onClick={handleContinue} disabled={selectedSeat == null}>
              Continuer
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className={styles.panel}>
            <h2>Étape 2 · Paiement (simulation)</h2>
            <p>
              La transaction est fictive : aucune donnée bancaire n’est stockée ni transmise. Elle permet simplement de valider votre réservation.
            </p>
            <form className={styles.paymentForm} onSubmit={handlePaymentSubmit}>
              <label>
                Nom sur la carte
                <input
                  name="cardholder"
                  value={paymentForm.cardholder}
                  onChange={handlePaymentChange}
                  placeholder="Jean Dupont"
                  required
                />
              </label>
              <label>
                Numéro de carte
                <input
                  name="cardNumber"
                  value={paymentForm.cardNumber}
                  onChange={handlePaymentChange}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  required
                />
              </label>
              <div className={styles.paymentRow}>
                <label>
                  Expiration
                  <input
                    name="expiry"
                    value={paymentForm.expiry}
                    onChange={handlePaymentChange}
                    placeholder="MM/AA"
                    maxLength={5}
                    required
                  />
                </label>
                <label>
                  CVC
                  <input
                    name="cvv"
                    value={paymentForm.cvv}
                    onChange={handlePaymentChange}
                    placeholder="000"
                    maxLength={4}
                    required
                  />
                </label>
              </div>

              {paymentError && <p className={styles.error}>{paymentError}</p>}

              <div className={styles.actionsRow}>
                <button type="button" className={styles.secondary} onClick={resetProcess} disabled={submitting}>
                  Retour
                </button>
                <button type="submit" className={styles.primary} disabled={submitting}>
                  {submitting ? 'Validation…' : 'Valider la réservation'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'success' && reservation && (
          <div className={styles.panel}>
            <h2>Étape 3 · Confirmation</h2>
            <div className={styles.confirmation}>
              <p className={styles.success}>Vous avez réservé une place !</p>
              <p>
                Place sélectionnée : <strong>{reservation.seatNumber}</strong>
              </p>
              <p>
                Numéro de réservation : <strong>{reservation.reservationCode}</strong>
              </p>
              <p className={styles.notice}>
                Conservez ce numéro : il vous sera demandé à l’entrée du cinéma. Pour toute annulation, contactez notre service client.
              </p>
              <button type="button" className={styles.secondary} onClick={resetProcess}>
                Réserver une autre place
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Reservation;
