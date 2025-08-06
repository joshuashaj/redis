import { Redis } from 'ioredis';

// Connect to Redis running on localhost:6379
const redisClient = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

export default redisClient;
