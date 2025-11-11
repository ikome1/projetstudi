import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import {
  getUsers,
  createAdminUser,
  updateRole,
  removeUser
} from '../controllers/adminController.js';
import { uploadPoster } from '../controllers/uploadController.js';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/users', getUsers);
router.post('/users', createAdminUser);
router.patch('/users/:id/role', updateRole);
router.delete('/users/:id', removeUser);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const extension = path.extname(file.originalname);
    cb(null, `poster-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format d’image non supporté (jpeg, png, webp).'));
    }
  }
});

router.post('/upload/poster', upload.single('poster'), uploadPoster);

export default router;

