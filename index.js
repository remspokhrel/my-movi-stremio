const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

const MANIFEST = {
    id: "org.mymovi.netmirror.ultra",
    version: "3.2.0",
    name: "My Movi - NetMirror Ultimate",
    description: "Premium Multi-Server Streams (Supports Movies & Full TV Series)",
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

app.get('/stream/:type/:id.json', (req, res) => {
    const { type, id } = req.params;

    // तुम्हारा वैलिडेशन लॉजिक
    if (!id) {
        return res.json({ streams: [] });
    }

    let streams = [];

    try {
        let embedUrl = "";
        let backupUrl = "";

        if (type === 'movie') {
            // वर्किंग प्रीमियम मूवी क्लस्टर्स
            embedUrl = `https://vidsrc.pro/embed/movie/${id}`;
            backupUrl = `https://vidsrc.in/embed/movie/${id}`;
        } else if (type === 'tv') {
            // स्ट्रीमिओ के टीवी सीरीज ID को स्प्लिट करने का लॉजिक
            const parts = id.split(':');
            const imdbId = parts[0];
            const season = parts[1] || '1';
            const episode = parts[2] || '1';
            
            embedUrl = `https://vidsrc.pro/embed/tv/${imdbId}/${season}/${episode}`;
            backupUrl = `https://vidsrc.in/embed/tv/${imdbId}/${season}/${episode}`;
        }

        if (embedUrl) {
            // सर्वर 1: प्रीमियम प्रो क्लस्टर
            streams.push({
                name: "🎬 My Movi - Pro Server",
                title: `🔥 High-Speed Stream (1080p)\n⚡ Instant Play (VLC / Browser)`,
                externalUrl: embedUrl
            });

            // सर्वर 2: बैकअप क्लस्टर
            streams.push({
                name: "🚀 My Movi - India CDN",
                title: `💎 Multi-Audio / Backup Stream\n🔊 Check for Hindi Tracks`,
                externalUrl: backupUrl
            });
        }
    } catch (e) {
        console.error("Stream generation error:", e);
    }

    res.json({ streams: streams });
});

app.listen(PORT, () => {
    console.log(`Ultimate Stable Addon is live on port ${PORT}`);
});
