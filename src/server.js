import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import contactsRouter from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  // ✅ Root route (Render health check)
  app.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'Welcome to Contacts API  — use /contacts for endpoints.',
    });
  });

  // ✅ Main routes
  app.use('/contacts', contactsRouter);

  // ✅ 404 ve global error handler middleware’leri
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};



