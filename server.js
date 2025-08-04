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
    console.log("Received request for albumId:", albumId);
    const redisKey = `photos?albumId=${albumId}`;

    const photos = await getOrSetCache(redisKey , async() => {
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
        const { data } = await axios.get( `https://jsonplaceholder.typicode.com/photos/${redisKey}`);
        return data;
    });
    
    res.json(photo);
});

function getOrSetCache(key, cb) {
    return new Promise ((resolve, reject) => {
        redisClient.get(key, async(error, data) =>{
            if(error) return reject(error);
            if (data !== null) return resolve(JSON.parse(data));
            const freshData = await cb();
            redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
        })
    })
}

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
