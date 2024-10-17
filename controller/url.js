const url = require('../model/url');
const shortid = require('shortid')
const URLModel = url.urlModel;

async function handleGenerateNewShortURL(req, res) {
    const body = req.body;
    console.log(body);
    console.log(body.url);
    try {
        if (!body.url) return res.status(400).json({ error: 'url is required' });
        const shortID = shortid();
        const urlmodel = await URLModel.create({
            shortId: shortID,
            redirectURL: body.url,
            visitHistory: [],
        });
        return res.json(
            { shortenUrl: `https://quicktrim-server-production.up.railway.app/url/${shortID}`,originalUrl :body.url, id: urlmodel._id, visitedCount: urlmodel.visitHistory.length })
    } catch (error) {
        console.log('Error occured inside controller', error)
    }
}

async function handleGetOriginalUrlFromShortenedUrl(req, res) {
    const shortId = req.params.shortId;
    try {
        const entry = await URLModel.findOneAndUpdate({
            shortId,
        }, {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },
            }
        },);
        res.redirect(entry.redirectURL);
    } catch (error) {
        console.log('Error occured inside controller', error)
    }
}

async function handleGetAnalytics(req, res) {
    try {
        const shortId = req.params.shortId;
        const result = await URLModel.findOne(
            { shortId }
        );
        return res.json({
            totalClicks: result.visitHistory.length,
            analytics: result.visitHistory,
        });
    } catch (error) {
        console.log('Error occured inside controller', error)
    }

}


module.exports = {
    handleGenerateNewShortURL: handleGenerateNewShortURL,
    handleGetOriginalUrlFromShortenedUrl: handleGetOriginalUrlFromShortenedUrl,
    handleGetAnalytics: handleGetAnalytics,
}