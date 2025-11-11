import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import movieRoutes from './routes/movieRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import { initializeDatabase } from './database/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'API Cinéma prête à l’emploi' });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reservations', reservationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable.' });
});

app.use((err, req, res, next) => {
  console.error('Erreur interne :', err);
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur API opérationnel sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Impossible d’initialiser la base :', error);
    process.exit(1);
  });

