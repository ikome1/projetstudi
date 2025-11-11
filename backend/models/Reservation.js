import { randomBytes } from 'crypto';
import { all, get, run } from '../database/db.js';

// Fonctions utilitaires pour manipuler la table `reservations`.
// Chaque entrée associe un numéro de siège (1..50) à un code de réservation unique.

export function listReserved() {
  // Retourne la liste triée des places déjà réservées (utilisé côté front pour colorer la grille).
  return all('SELECT seatNumber, reservationCode, createdAt FROM reservations ORDER BY seatNumber ASC');
}

export function findBySeat(seatNumber) {
  // Permet de vérifier rapidement si un siège précis est occupé.
  return get('SELECT seatNumber, reservationCode, createdAt FROM reservations WHERE seatNumber = ?', [seatNumber]);
}

export async function create(seatNumber) {
  // Génère un code lisible de type RSV-05-1A2B3C (zéro-padding sur le numéro de place + 3 octets aléatoires).
  const reservationCode = `RSV-${String(seatNumber).padStart(2, '0')}-${randomBytes(3).toString('hex').toUpperCase()}`;
  const result = await run(
    'INSERT INTO reservations (seatNumber, reservationCode) VALUES (?, ?)',
    [seatNumber, reservationCode]
  );
  return get('SELECT seatNumber, reservationCode, createdAt FROM reservations WHERE id = ?', [result.id]);
}

export function removeBySeat(seatNumber) {
  // Utilisé par l’admin pour annuler une place spécifique.
  return run('DELETE FROM reservations WHERE seatNumber = ?', [seatNumber]);
}

export function clearAll() {
  // Remet la salle à zéro (fin de séance).
  return run('DELETE FROM reservations');
}
