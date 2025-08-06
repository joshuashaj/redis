import redisClient from "./client.js";

const testRedis = async () => {
  await redisClient.set("hello", "world");
  const value = await redisClient.get("hello");
  console.log("Redis Value:", value); // Should log "world"
};

testRedis().catch(console.error);
