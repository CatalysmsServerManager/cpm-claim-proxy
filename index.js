const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))

app.get('/api/claims', (req, res) => {

    if (!validateServerObject(req.query)) {
        return res.status(400).send('Malformed querystring');
    }

    fetch(`http://${req.query.ip}:${req.query.port}/api/getmapclaims?type=${req.query.type}`)
        .then(res => {
            const response = res.json().then(d => d).catch(e => {
                return []
            })
            return response
        })
        .then(json => res.status(200).send(json))
        .catch(e => {
            console.log(e)
            return res.status(500).send('Oopsie, something went wrong!')
        })
})

app.listen(port, () => console.log(`Listening on port ${port}!`));


function validateServerObject(obj) {
    const includesIP = obj.ip;
    const includesPort = obj.port;

    return includesIP && includesPort;
}