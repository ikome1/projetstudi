import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import {
  listMovies,
  getMovie,
  createMovie,
  updateMovie,
<<<<<<< HEAD
  deleteMovie
=======
  deleteMovie,
  getTodayHighlight
>>>>>>> 81156c2 (1 er modification)
} from '../controllers/movieController.js';

const router = Router();

<<<<<<< HEAD
=======
router.get('/highlight/today', getTodayHighlight);
>>>>>>> 81156c2 (1 er modification)
router.get('/', listMovies);
router.get('/:id', getMovie);

router.post('/', authenticate, authorizeAdmin, createMovie);
router.put('/:id', authenticate, authorizeAdmin, updateMovie);
router.delete('/:id', authenticate, authorizeAdmin, deleteMovie);

export default router;

