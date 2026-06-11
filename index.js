const express = require("express");
const needle = require("needle"); // आपके package.json के अनुसार needle का उपयोग
const app = express();

const PORT = process.env.PORT || 10000;

// CORS - स्ट्रीमियो ऐप के कनेक्ट होने के लिए बेहद ज़रूरी है
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    next();
});

// MANIFEST (App के अंदर लोड होने के लिए रेडी)
app.get("/manifest.json", (req, res) => {
    res.json({
        id: "org.mymovi.netmirror.ultra",
        version: "4.0.0",
        name: "NetMirror Ultra",
        description: "Direct In-App Play Streams for Movies & Series",
        resources: ["stream"],
        types: ["movie", "series"],
        idPrefixes: ["tt"], 
        catalogs: []
    });
});

// STREAM ENDPOINT (Direct In-App Play Logic)
app.get("/stream/:type/:id.json", (req, res) => {
    const { type } = req.params;
    let rawId = req.params.id;

    if (!rawId) {
        return res.json({ streams: [] });
    }

    // ID के अंत से .json साफ करना
    let id = rawId.replace(".json", ""); 
    let streams = [];

    // 🎬 MOVIES - डायरेक्ट इन-ऐप प्ले के लिए YTS API का इस्तेमाल
    if (type === "movie") {
        const ytsUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${id}`;
        
        needle("get", ytsUrl)
            .then((response) => {
                const data = response.body;
                if (data && data.data && data.data.movies && data.data.movies[0]) {
                    const movie = data.data.movies[0];
                    
                    // सभी उपलब्ध क्वालिटी (720p, 1080p) को स्ट्रीमियो में जोड़ना
                    movie.torrents.forEach(torrent => {
                        streams.push({
                            name: "NetMirror Ultra",
                            title: `🎬 Direct Play [YTS] - ${torrent.quality} (${torrent.size})`,
                            infoHash: torrent.hash // स्ट्रीमियो ऐप इस हैश को सीधे अपने प्लेयर में चला देगा
                        });
                    });
                }
                
                // अगर कोई टोरेंट नहीं मिला, तो बैकअप ब्राउज़र लिंक देना
                if (streams.length === 0) {
                    streams.push({
                        name: "NetMirror Ultra [Backup]",
                        title: "🌐 No Direct Stream found. Click to open in Browser",
                        externalUrl: `https://vidsrc.pro/embed/movie/${id}`
                    });
                }
                res.json({ streams });
            })
            .catch((err) => {
                console.error("YTS API Error:", err);
                res.json({ streams: [{ name: "Error", title: "Click to open in Browser", externalUrl: `https://vidsrc.pro/embed/movie/${id}` }] });
            });
    } 
    
    // 📺 SERIES - वेब सीरीज के लिए लॉजिक
    else if (type === "series") {
        const decodedId = decodeURIComponent(id);
        const parts = decodedId.split(":");
        
        const imdb = parts[0];
        const season = parseInt(parts[1]) || 1;
        const episode = parseInt(parts[2]) || 1;

        // फ्री पब्लिक स्क्रैपर API से सीरीज का डेटा निकालना
        const seriesUrl = `https://api.apipopcorn.com/show/${imdb}/${season}/${episode}`; 
        
        needle("get", seriesUrl)
            .then((response) => {
                const seriesData = response.body;
                if (seriesData && seriesData.streams) {
                    seriesData.streams.forEach(str => {
                        streams.push({
                            name: "NetMirror Ultra",
                            title: `📺 S${season}E${episode} - ${str.quality || "HD"} [Direct Play]`,
                            infoHash: str.infoHash
                        });
                    });
                }

                // बैकअप अगर कोई इन-ऐप स्ट्रीम न मिले
                if (streams.length === 0) {
                    streams.push({
                        name: "NetMirror Ultra [Backup]",
                        title: `🌐 S${season}E${episode} [Open in Browser]`,
                        externalUrl: `https://vidsrc.pro/embed/tv/${imdb}/${season}/${episode}`
                    });
                }
                res.json({ streams });
            })
            .catch((err) => {
                // अगर सीरीज API फेल हो जाए तो सीधे बैकअप लिंक भेजें
                streams.push({
                    name: "NetMirror Ultra [Backup]",
                    title: `🌐 S${season}E${episode} [Open in Browser]`,
                    externalUrl: `https://vidsrc.pro/embed/tv/${imdb}/${season}/${episode}`
                });
                res.json({ streams });
            });
    } else {
        res.json({ streams: [] });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`🔥 NetMirror Ultra running on port ${PORT}`);
});
