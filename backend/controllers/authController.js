import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';
import { findByEmail } from '../models/User.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur login :', error);
    res.status(500).json({ message: 'Connexion impossible pour le moment.' });
  }
}

