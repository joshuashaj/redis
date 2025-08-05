import express from "express";
import cors from "cors";
import axios from "axios";
import Redis from "redis";

const app = express();
app.use(cors());

const redisClient = Redis.createClient();

const DEFAULT_EXPIRATION = 3600;

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});

await redisClient.connect();


// GET /photos?albumId=1
app.get("/photos", async (req, res) => {
    const albumId = req.query.albumId;
    const redisKey = `photos?albumId=${albumId}`;

    const photos = await getOrSetCache(redisKey, async () => {
        const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos", {
            params: { albumId },
        });
        return data;
    });
    res.json(photos);
});

// GET /photos/:id
app.get("/photos/:id", async (req, res) => {
    const redisKey = `photos/${req.params.id}`;

    const photo = await getOrSetCache(redisKey, async () => {
        const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos/${req.params.id}`);
        return data;
    });

    res.json(photo);
});

const getOrSetCache = async (key, cb) => {
    try {
        const cachedData = await redisClient.get(key);
        if (cachedData !== null) { return JSON.parse(cachedData); }
        const freshData = await cb();
        await redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
        return freshData;
    } catch (error) { return await cb(); }
} 

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
