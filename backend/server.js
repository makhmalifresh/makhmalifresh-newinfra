import 'dotenv/config';
import app from './src/app.js';
import logger from './src/utils/logger.js';
// Import workers to instantiate them and keep them running
import './src/workers/order.worker.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});
