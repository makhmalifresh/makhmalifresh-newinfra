import winston from 'winston';

const { combine, timestamp, printf, errors, json } = winston.format;

// Format for console (readable but structured)
const customFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ''
  }`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'makhmali-backend' },
  transports: [
    new winston.transports.Console({
      format: combine(
        winston.format.colorize(),
        customFormat
      ),
    })
  ],
});

export default logger;
