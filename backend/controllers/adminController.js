import bcrypt from 'bcryptjs';
import { listUsers, createUser, updateUserRole, deleteUser, findById } from '../models/User.js';

export async function getUsers(req, res) {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    console.error('Erreur getUsers :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
  }
}

export async function createAdminUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({
      name: name || email,
      email,
      password: hashed,
      role: role || 'user'
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erreur createAdminUser :', error);
    if (error && error.message && error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }
    res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur.' });
  }
}

export async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: 'Rôle requis.' });
    }

    const user = await updateUserRole(id, role);
    res.json(user);
  } catch (error) {
    console.error('Erreur updateRole :', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle.' });
  }
}

export async function removeUser(req, res) {
  try {
    const { id } = req.params;
    const user = await findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    await deleteUser(id);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur removeUser :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
}

