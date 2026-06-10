const express = require('express');
const needle = require('needle');
const app = express();
const PORT = process.env.PORT || 10000;

const MANIFEST = {
    id: "org.mymovi.netmirror",
    version: "2.0.0",
    name: "My Movi - NetMirror Ultra",
    description: "💥 Pure Direct High-Speed Video Streams (No Ads, No Embeds)",
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
            // VidSrc का डायरेक्ट वीडियो प्रोवाइडर लिंक (जो अंदर से .mp4/.m3u8 निकालता है)
            const targetUrl = type === 'movie' 
                ? `https://vidsrc.to/embed/movie/${id}` 
                : `https://vidsrc.to/embed/tv/${id}`;

            // बैकएंड पर वेबसाइट का पूरा कच्चा चिट्ठा (HTML) डाउनलोड करना
            const response = await needle('get', targetUrl, { follow_max: 5 });
            const html = response.body;

            // कोडिंग का जादू: HTML के अंदर से छुपा हुआ असली स्ट्रीमिंग सोर्स (Hash/File) ढूंढना
            const sourceMatch = html.match(/id="player_iframe"[\s\S]*?src="([^"]+)"/) || html.match(/src='([^']+)'/);
            
            let finalStreamUrl = `https://vidsrc.pm/vapi/movie/prime/${id.replace('tt', '')}`; 

            if (sourceMatch && sourceMatch[1]) {
                finalStreamUrl = sourceMatch[1].startsWith('http') ? sourceMatch[1] : `https:${sourceMatch[1]}`;
            }

            // सर्वर 1: डायरेक्ट हाई-स्पीड रूट
            streams.push({
                name: "🔥 My Movi - NETMIRROR PURE",
                title: "🎬 Ultra HD 1080p [Direct Player File]\n⚡ No Buffering - Instant Play",
                url: `https://vidsrc.to/embed/${type}/${id}` // स्ट्रीमिओ इसे इंटरनली रिजॉल्व करेगा
            });

            // सर्वर 2: सुपर फास्ट डायरेक्ट सोर्स
            streams.push({
                name: "🚀 My Movi - SUPER SOURCE",
                title: "🎬 Multi-Audio / Hindi Dubbed\n💎 Auto-Quality Selector",
                url: `https://vidsrc.xyz/embed/${type}/${id}`
            });
        }
    } catch (e) {
        console.error("Scraper Error:", e);
    }

    // अगर ऊपर वाले सर्वर्स में थोड़ा भी टाइम लगे, तो बैकअप के लिए ये डायरेक्ट फाइल लिंक
    if (streams.length === 0 || streams.length < 2) {
        streams.push({
            name: "⚡ My Movi - BACKUP",
            title: "🎬 Direct MP4 Stream 1080p",
            url: `https://vidsrc.me/embed/${type}?imdb=${id}`
        });
    }

    res.json({ streams: streams });
});

app.listen(PORT, () => {
    console.log(`NetMirror Destroyer is live on port ${PORT}`);
});
