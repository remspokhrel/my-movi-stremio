const express = require("express");
const needle = require("needle");
const app = express();

const PORT = process.env.PORT || 10000; 


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
        version: "4.5.0",
        name: "NetMirror Ultra",
        description: "Direct In-App Streams via NetMirror & YTS Source",
        resources: ["stream"],
        types: ["movie", "series"],
        idPrefixes: ["tt"], 
        catalogs: []
    });
});

// STREAM ENDPOINT
app.get("/stream/:type/:id.json", async (req, res) => {
    const { type } = req.params;
    let rawId = req.params.id;

    if (!rawId) {
        return res.json({ streams: [] });
    }

    let id = rawId.replace(".json", ""); 
    let streams = [];

    // 🎬 MOVIES LOGIC
    if (type === "movie") {
        // 1. NetMirror / VidSrc Direct Link Try (In-App Player के लिए डायरेक्ट स्ट्रीमिंग सोर्स)
        // net22.cc और net52.cc इसी vidsrc API आर्किटेक्चर का उपयोग करते हैं
        streams.push({
            name: "NetMirror (net52.cc)",
            title: "⚡ Direct Stream [Server 1] - Auto Quality",
            url: `https://vidsrc.pro/embed/movie/${id}` // स्ट्रीमियो का नया प्लेयर इसे कुछ डिवाइसेस पर डायरेक्ट सपोर्ट करता है
        });

        streams.push({
            name: "NetMirror (net22.cc)",
            title: "⚡ Direct Stream [Server 2] - Auto Quality",
            url: `https://vidsrc.in/embed/movie/${id}`
        });

        // 2. बैकअप के लिए YTS टोरेंट (ताकि अगर NetMirror लिंक ऐप में न लोड हो, तो वीडियो रुके नहीं)
        try {
            const ytsUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${id}`;
            const ytsRes = await needle("get", ytsUrl);
            const data = ytsRes.body;
            
            if (data && data.data && data.data.movies && data.data.movies[0]) {
                const movie = data.data.movies[0];
                movie.torrents.forEach(torrent => {
                    streams.push({
                        name: "NetMirror Ultra [Torrent]",
                        title: `🎬 Direct Play [YTS] - ${torrent.quality} (${torrent.size})`,
                        infoHash: torrent.hash
                    });
                });
            }
        } catch (err) {
            console.log("YTS Backup Error:", err);
        }
    } 
    
    // 📺 SERIES LOGIC
    else if (type === "series") {
        const decodedId = decodeURIComponent(id);
        const parts = decodedId.split(":");
        
        const imdb = parts[0];
        const season = parts[1] || "1";
        const episode = parts[2] || "1";

        // NetMirror / VidSrc सीरीज़ सोर्स
        streams.push({
            name: "NetMirror (net52.cc)",
            title: `📺 S${season}E${episode} [Server 1]`,
            url: `https://vidsrc.pro/embed/tv/${imdb}/${season}/${episode}`
        });

        streams.push({
            name: "NetMirror (net22.cc)",
            title: `📺 S${season}E${episode} [Server 2]`,
            url: `https://vidsrc.in/embed/tv/${imdb}/${season}/${episode}`
        });

        // सीरीज़ के लिए टोरेंट बैकअप सोर्स
        try {
            const seriesUrl = `https://api.apipopcorn.com/show/${imdb}/${season}/${episode}`; 
            const popRes = await needle("get", seriesUrl);
            const seriesData = popRes.body;
            
            if (seriesData && seriesData.streams) {
                seriesData.streams.forEach(str => {
                    streams.push({
                        name: "NetMirror Ultra [Torrent]",
                        title: `📺 S${season}E${episode} - ${str.quality || "HD"}`,
                        infoHash: str.infoHash
                    });
                });
            }
        } catch (err) {
            console.log("Series Torrent Backup Error");
        }
    }

    
    if (type === "movie") {
        streams.push({
            name: "NetMirror [External]",
            title: "🌐 Open in Browser (If player fails)",
            externalUrl: `https://vidsrc.pro/embed/movie/${id}`
        });
    } else if (type === "series") {
        const decodedId = decodeURIComponent(id);
        const parts = decodedId.split(":");
        const imdb = parts[0];
        const season = parts[1] || "1";
        const episode = parts[2] || "1";

        streams.push({
            name: "NetMirror [External]",
            title: `🌐 S${season}E${episode} [Open in Browser]`,
            externalUrl: `https://vidsrc.pro/embed/tv/${imdb}/${season}/${episode}`
        });
    }

    res.json({ streams });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`🔥 NetMirror Ultra running on port ${PORT}`);
});
