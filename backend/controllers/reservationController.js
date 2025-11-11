import * as Reservation from '../models/Reservation.js';

const TOTAL_SEATS = 50; // Capacité de la salle : 50 sièges numérotés

export async function listReservations(req, res) {
  try {
    // Renvoie toutes les places déjà bloquées (utilisé côté public et admin).
    const reservations = await Reservation.listReserved();
    res.json(reservations);
  } catch (error) {
    console.error('Erreur listReservations :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations.' });
  }
}

export async function createReservation(req, res) {
  try {
    const { seatNumber } = req.body;

    // On valide que la valeur reçue est bien un entier compris entre 1 et 50.
    const parsedSeat = Number(seatNumber);
    if (!Number.isInteger(parsedSeat) || parsedSeat < 1 || parsedSeat > TOTAL_SEATS) {
      return res.status(400).json({ message: 'Numéro de siège invalide.' });
    }

    // Double-check pour éviter d’insérer un doublon si deux utilisateurs cliquent en même temps.
    const existing = await Reservation.findBySeat(parsedSeat);
    if (existing) {
      return res.status(409).json({ message: 'Ce siège est déjà réservé.' });
    }

    // Création : génère un code de réservation unique + horodatage.
    const reservation = await Reservation.create(parsedSeat);
    res.status(201).json(reservation);
  } catch (error) {
    console.error('Erreur createReservation :', error);
    if (String(error?.message).includes('UNIQUE')) {
      return res.status(409).json({ message: 'Ce siège est déjà réservé.' });
    }
    res.status(500).json({ message: 'Erreur lors de la réservation de la place.' });
  }
}

export async function cancelReservation(req, res) {
  try {
    const { seatNumber } = req.params;
    const parsedSeat = Number(seatNumber);
    // Les annulations sont réservées aux admins (route /admin/*), on applique les mêmes validations.
    if (!Number.isInteger(parsedSeat) || parsedSeat < 1 || parsedSeat > TOTAL_SEATS) {
      return res.status(400).json({ message: 'Numéro de siège invalide.' });
    }

    const existing = await Reservation.findBySeat(parsedSeat);
    if (!existing) {
      return res.status(404).json({ message: 'Aucune réservation pour ce siège.' });
    }

    await Reservation.removeBySeat(parsedSeat);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur cancelReservation :', error);
    res.status(500).json({ message: 'Erreur lors de l’annulation de la réservation.' });
  }
}

export async function resetReservations(req, res) {
  try {
    // Purge toutes les réservations (utilisé entre deux séances).
    await Reservation.clearAll();
    res.status(204).send();
  } catch (error) {
    console.error('Erreur resetReservations :', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation des réservations.' });
  }
}
