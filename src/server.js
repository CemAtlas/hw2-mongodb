import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js'; // ✅ eklendi
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  // ✅ Root endpoint
  app.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'Welcome to Contacts API 👋 — use /auth or /contacts endpoints.',
    });
  });

  // ✅ ROUTES
  app.use('/auth', authRouter);     // <-- burası eksikti
  app.use('/contacts', contactsRouter);

  // ✅ 404 & Error Middleware
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};


