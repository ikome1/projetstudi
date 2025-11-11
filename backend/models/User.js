import { get, all, run } from '../database/db.js';

export function findByEmail(email) {
  return get('SELECT * FROM users WHERE email = ?', [email]);
}

export function findById(id) {
  return get('SELECT * FROM users WHERE id = ?', [id]);
}

export function listUsers() {
  return all('SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC');
}

export async function createUser(user) {
  const result = await run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [user.name, user.email, user.password, user.role || 'user']
  );
  return findById(result.id);
}

export async function updateUserRole(id, role) {
  await run('UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [role, id]);
  return findById(id);
}

export function deleteUser(id) {
  return run('DELETE FROM users WHERE id = ?', [id]);
}

