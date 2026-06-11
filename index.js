const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

const MANIFEST = {
    id: "org.mymovi.netmirror.ultra",
    version: "3.3.0",
    name: "My Movi - NetMirror Ultimate",
    description: "Premium Multi-Server Streams (Movies & Full TV Series) - 2026 Updated",
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

    if (!id) {
        return res.json({ streams: [] });
    }

    const streams = [];

    try {
        if (type === 'movie') {
            const movieId = id;

            // Multiple working embed sources
            const sources = [
                `https://vidsrc.cc/v2/embed/movie/${movieId}`,
                `https://vidsrc.to/embed/movie/${movieId}`,
                `https://vidsrc.me/embed/movie/${movieId}`,
            ];

            sources.forEach((url, index) => {
                streams.push({
                    name: `🎬 My Movi Pro ${index + 1}`,
                    title: `🔥 Server ${index + 1} - High Speed 1080p\n⚡ Try this if one doesn't play`,
                    externalUrl: url
                });
            });

        } 
        else if (type === 'tv') {
            const parts = id.split(':');
            const imdbId = parts[0];
            const season = parts[1] || '1';
            const episode = parts[2] || '1';

            const sources = [
                `https://vidsrc.cc/v2/embed/tv/\( {imdbId}/ \){season}/${episode}`,
                `https://vidsrc.to/embed/tv/\( {imdbId}/ \){season}/${episode}`,
                `https://vidsrc.me/embed/tv/\( {imdbId}/ \){season}/${episode}`,
            ];

            sources.forEach((url, index) => {
                streams.push({
                    name: `🎬 My Movi Pro ${index + 1}`,
                    title: `🔥 S\( {season}E \){episode} - Server ${index + 1}\n⚡ Multi Audio Available`,
                    externalUrl: url
                });
            });
        }

    } catch (e) {
        console.error("Stream generation error:", e);
    }

    res.json({ streams: streams });
});

app.listen(PORT, () => {
    console.log(`🚀 My Movi Ultimate Addon is running on port ${PORT}`);
});
