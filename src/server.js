import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import contactsRouter from './routes/contacts.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
    }),
  );

  // Routes
  app.use('/contacts', contactsRouter);

  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  // Global error handler (isteğe bağlı ama faydalı)
  app.use((err, req, res, _next) => {
    req.log?.error({ err }, 'Unhandled error');
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

