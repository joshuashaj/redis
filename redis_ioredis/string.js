import redisClient from "./client.js";

const testRedis = async () => {
  // await redisClient.set("hello", "world");
  await redisClient.expire("hello", 10); 
  const value = await redisClient.get("hello");
  console.log("Redis Value:", value); // Should log "world"
};

testRedis().catch(console.error);
