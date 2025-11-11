import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import {
  listMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getTodayHighlight
} from '../controllers/movieController.js';

const router = Router();

router.get('/highlight/today', getTodayHighlight);
router.get('/', listMovies);
router.get('/:id', getMovie);

router.post('/', authenticate, authorizeAdmin, createMovie);
router.put('/:id', authenticate, authorizeAdmin, updateMovie);
router.delete('/:id', authenticate, authorizeAdmin, deleteMovie);

export default router;

