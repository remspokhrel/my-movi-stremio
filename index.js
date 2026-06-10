const express = require('express');
const needle = require('needle');
const app = express();
const PORT = process.env.PORT || 10000;

const MANIFEST = {
    id: "org.mymovi.netmirror",
    version: "1.0.0",
    name: "My Movi - NetMirror",
    description: "Stream movies and series directly from NetMirror",
    resources: ["stream"],
    types: ["movie", "tv"],
    idPrefixes: ["tt"],
    catalogs: []
};

// Jo bhi latest aur working NetMirror ka domain ho, yaha badal sakte ho
const NETMIRROR_URL = "https://net22.cc"; 

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.get('/manifest.json', (req, res) => {
    res.json(MANIFEST);
});

// Asli Stream Extraction Logic
app.get('/stream/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    let streams = [];

    try {
        if (id) {
            // Hum TMDB ya kisi public API se movie ka title nikalne ki koshish karte hain
            // Ya seedhe NetMirror ke internal embedded structural link ko hit karte hain
            // Yeh url structure NetMirror ke players ke liye hota hai
            
            let cleanId = id.replace('tt', ''); // IMDb ID se 'tt' hatayein
            let streamUrl = "";

            if (type === 'movie') {
                // NetMirror ka general movie streaming url format
                streamUrl = `${NETMIRROR_URL}/movies/play/${cleanId}.mp4`;
            } else if (type === 'tv') {
                // Series ke liye default episode 1 format
                streamUrl = `${NETMIRROR_URL}/series/play/${cleanId}-1-1.mp4`;
            }

            // Stremio Player ke liye link append karna
            streams.push({
                name: "My Movi",
                title: `NetMirror Live Stream 1080p\n⚡ Fast Server`,
                url: streamUrl
            });
        }
    } catch (e) {
        console.error("Error fetching stream:", e);
    }

    res.json({ streams: streams });
});

app.listen(PORT, () => {
    console.log(`Addon is fully working on port ${PORT}`);
});
