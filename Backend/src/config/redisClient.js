// redisClient.js
const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.connect()
    .then(() => console.log('✅ Connected to Redis'))
    .catch(console.error);

module.exports = redisClient;
