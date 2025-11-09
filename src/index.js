import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';

const bootstrap = async () => {
  await initMongoConnection();
  setupServer();
};

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

