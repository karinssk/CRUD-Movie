import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/moviesController';

const router = Router();

router.use(authenticate);

router.get('/',     getMovies);
router.post('/',    createMovie);
router.put('/:id',  updateMovie);
router.delete('/:id', requireRole('MANAGER'), deleteMovie);

export default router;
