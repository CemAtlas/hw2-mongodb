import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // NEW
import pino from 'pino';
import pinoHttp from 'pino-http';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js'; // NEW
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const setupServer = () => {
  const app = express();

  app.use(cors({ origin: true, credentials: true })); // cookies için credentials
  app.use(express.json());
  app.use(cookieParser()); // NEW
  app.use(pinoHttp({ logger }));

  app.use('/auth', authRouter);       // NEW
  app.use('/contacts', contactsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};



