import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import categoryRoutes from './routes/category.routes';
import reservationRoutes from './routes/reservation.routes';
import loanRoutes from './routes/loan.routes';
import bookRoutes from './routes/book.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/errorHandler';



// Load environment variables
dotenv.config();

// Create Express app
const app = express() as express.Application;
const PORT = process.env.PORT || 9999;

// Configure multer for file uploads
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

// Apply middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Keeping Express built-in parsers as fallback
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static('uploads'));

// Configuration CORS flexible
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : (process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:5173', 'http://localhost:3000']);

app.use(cors({
  origin: function(origin, callback) {
    // Permettre les requêtes sans origine (comme les applications mobiles ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true
}));

app.use(helmet());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reservations', reservationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
