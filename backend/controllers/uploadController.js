import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function uploadPoster(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier reçu.' });
  }

  const relativePath = req.file.path.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/');
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  const baseUrl = process.env.APP_URL ?? `${req.protocol}://${req.get('host')}`;
  const publicUrl = `${baseUrl}${normalizedPath}`;

  return res.status(201).json({
    message: 'Affiche envoyée avec succès.',
    url: publicUrl
  });
}

