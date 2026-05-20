import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/auth';
import moviesRoutes from './routes/movies';

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET env var is not set');
  process.exit(1);
}

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

app.use('/api/auth',   authRoutes);
app.use('/api/movies', moviesRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

export default app;
