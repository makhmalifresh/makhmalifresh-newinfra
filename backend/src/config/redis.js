import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_URL;

if (!redisUrl) {
  console.warn("WARNING: UPSTASH_REDIS_URL is not set in environment variables.");
}

// A standard ioredis connection leveraging Upstash Redis URL
export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    // Reconnect after
    return Math.max(Math.min(Math.exp(times), 20000), 1000);
  }
});

connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default connection;
