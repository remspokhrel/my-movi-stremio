const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

const MANIFEST = {
    id: "org.mymovi.netmirror",
    version: "1.0.0",
    name: "My Movi - NetMirror",
    description: "Stream directly from NetMirror",
    resources: ["stream"],
    types: ["movie", "tv"],
    idPrefixes: ["tt"],
    catalogs: []
};

const NETMIRROR_URL = "https://net22.cc"; 

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.get('/manifest.json', (req, res) => {
    res.json(MANIFEST);
});

app.get('/stream/:type/:id.json', (req, res) => {
    const { id } = req.params;
    let streams = [];

    if (id) {
        streams.push({
            title: "My Movi - NetMirror Stream",
            url: `${NETMIRROR_URL}/movies/${id}.mp4`
        });
    }

    res.json({ streams: streams });
});

app.listen(PORT, () => {
    console.log(`Addon is live on port ${PORT}`);
});
