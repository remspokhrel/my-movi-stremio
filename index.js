const express = require("express");
const app = express();

const PORT = process.env.PORT || 10000;

// CORS (Stremio के लिए बहुत ज़रूरी है)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
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
        // 🎬 MOVIES - externalUrl का उपयोग ताकि ब्राउज़र में खुले
        if (type === "movie") {
            streams = [
                {
                    title: "🔥 NetMirror HD [Browser]",
                    externalUrl: `https://vidsrc.pro/embed/movie/${id}`
                },
                {
                    title: "⚡ NetMirror Backup [Browser]",
                    externalUrl: `https://vidsrc.in/embed/movie/${id}`
                }
            ];
        }

        // 📺 SERIES
        else if (type === "series") {
            const decodedId = decodeURIComponent(id);
            const parts = decodedId.split(":");
            
            const imdb = parts[0];
            const season = parts[1] || "1";
            const episode = parts[2] || "1";

            streams = [
                {
                    title: `📺 S${season}E${episode} HD [Browser]`,
                    externalUrl: `https://vidsrc.pro/embed/tv/${imdb}/${season}/${episode}`
                },
                {
                    title: `⚡ Backup Server [Browser]`,
                    externalUrl: `https://vidsrc.in/embed/tv/${imdb}/${season}/${episode}`
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
