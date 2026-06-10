const express = require("express");
const app = express();

const PORT = process.env.PORT || 10000;

// CORS (important for Stremio)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});

// MANIFEST
app.get("/manifest.json", (req, res) => {
    res.json({
        id: "org.mymovi.netmirror.ultra",
        version: "4.0.0",
        name: "NetMirror Ultra",
        description: "Multi-Source Movie & Series Streams",
        resources: ["stream"],
        types: ["movie", "series"],
        idPrefixes: ["tt"],
        catalogs: []
    });
});

// STREAM ENDPOINT
app.get("/stream/:type/:id.json", (req, res) => {
    const { type, id } = req.params;

    if (!id) {
        return res.json({ streams: [] });
    }

    let streams = [];

    try {

        // 🎬 MOVIES
        if (type === "movie") {
            streams = [
                {
                    title: "🔥 HD Primary Stream",
                    url: `https://vidsrc.pro/embed/movie/${id}`
                },
                {
                    title: "⚡ Backup Stream",
                    url: `https://vidsrc.in/embed/movie/${id}`
                }
            ];
        }

        // 📺 SERIES
        else if (type === "series") {
            const parts = id.split(":");
            const imdb = parts[0];
            const season = parts[1] || "1";
            const episode = parts[2] || "1";

            streams = [
                {
                    title: `📺 S${season}E${episode} HD Stream`,
                    url: `https://vidsrc.pro/embed/tv/${imdb}/${season}/${episode}`
                },
                {
                    title: `⚡ Backup Server`,
                    url: `https://vidsrc.in/embed/tv/${imdb}/${season}/${episode}`
                }
            ];
        }

    } catch (e) {
        console.error("Error:", e);
        streams = [];
    }

    res.json({ streams });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`🔥 NetMirror Ultra running on http://localhost:${PORT}`);
});
