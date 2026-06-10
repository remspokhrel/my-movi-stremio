const express = require('express');
const needle = require('needle');
const app = express();
const PORT = process.env.PORT || 7000;
​const MANIFEST = {
id: "org.mymovi.netmirror",
version: "1.0.0",
name: "My Movi - NetMirror",
description: "Stream directly from NetMirror",
resources: ["stream"],
types: ["movie", "tv"],
idPrefixes: ["tt"],
catalogs: []
};
​const NETMIRROR_URL = "https://net22.cc";
​app.get('/manifest.json', (req, res) => {
res.setHeader('Access-Control-Allow-Origin', '');
res.setHeader('Access-Control-Allow-Headers', '');
res.json(MANIFEST);
});
​app.get('/stream/:type/:id.json', async (req, res) => {
res.setHeader('Access-Control-Allow-Origin', '');
res.setHeader('Access-Control-Allow-Headers', '');
const { type, id } = req.params;
​let streams = [];
​try {
if (id) {
streams.push({
title: "My Movi - NetMirror Stream",
url: ${NETMIRROR_URL}/movies/${id}.mp4
});
}
} catch (e) {
console.error(e);
}
​res.json({ streams: streams });
});
​app.listen(PORT, () => {
console.log(Addon is running on port ${PORT});
});
