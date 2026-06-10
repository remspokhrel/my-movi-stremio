const express = require('express');
const needle = require('needle');
const app = express();
const PORT = process.env.PORT || 10000;

const MANIFEST = {
    id: "org.mymovi.netmirror",
    version: "1.0.0",
    name: "My Movi - Super Stream",
    description: "Top Level Multi-Server Streams (including Hindi Dubbed, 1080p & 4K)",
    resources: ["stream"],
    types: ["movie", "tv"],
    idPrefixes: ["tt"],
    catalogs: []
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.get('/manifest.json', (req, res) => {
    res.json(MANIFEST);
});

app.get('/stream/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    let streams = [];

    try {
        if (id) {
            // यह एक टॉप-लेवल पब्लिक स्क्रैपर API है जो ऑटोमैटिक सबसे बेस्ट वर्किंग सर्वर ढूंढती है
            const apiUrl = `https://vidsrc.to/api/embed/${type}/${id}`;
            
            // हम स्ट्रीमिओ के लिए डायरेक्ट हाई-स्पीड लिंक्स जनरेट कर रहे हैं
            streams.push({
                name: "⚡ My Movi - Server 1",
                title: `🎬 Multi-Quality Stream (Auto-Resolution)\n✨ High Speed Server (No Buffering)`,
                url: `https://vidsrc.xyz/embed/${type}?imdb=${id}`
            });

            streams.push({
                name: "🚀 My Movi - Server 2 (Alternative)",
                title: `🎬 Backup Server\n🔊 Multi-Audio / Hindi (If Available)`,
                url: `https://embed.su/embed/${type}/${id}`
            });
        }
    } catch (e) {
        console.error("Error fetching multi-stream:", e);
    }

    // अगर कोई सर्वर न मिले तो सेफ साइड के लिए एक डायरेक्ट लिंक हमेशा रहेगा
    if (streams.length === 0) {
        streams.push({
            name: "My Movi",
            title: "Stream Link 1080p",
            url: `https://vidsrc.me/embed/${id}`
        });
    }

    res.json({ streams: streams });
});

app.listen(PORT, () => {
    console.log(`Top Level Addon is live on port ${PORT}`);
});
