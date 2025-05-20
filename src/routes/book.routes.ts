import express from 'express';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/book.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import multer from 'multer';

const router = express.Router() as express.Router;

// Configure multer for this route
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware pour transformer les données multipart en JSON
const parseMultipartData = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    // Si les données sont en multipart, convertir les champs en objet JSON
    if (req.body) {
      // Convertir les valeurs numériques
      if (req.body.publicationYear) req.body.publicationYear = parseInt(req.body.publicationYear);
      if (req.body.quantity) req.body.quantity = parseInt(req.body.quantity);
      
      // Si une image de couverture est téléchargée, stocker le chemin
      if (req.file) {
        req.body.coverImage = req.file.path;
      }
    }
  }
  next();
};

// Public routes
router.get('/', getBooks);
router.get('/:id', getBook);

// Protected routes
router.use(protect);

// Admin and Librarian routes
router.use(restrictTo(Role.ADMIN, Role.LIBRARIAN));
router.post('/', upload.single('coverImage'), parseMultipartData, createBook);
router.patch('/:id', upload.single('coverImage'), parseMultipartData, updateBook);
router.delete('/:id', deleteBook);

export default router;
