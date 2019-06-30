const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 500
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

app.get('/api/command', (req, res) => {

    if (!validateServerObject(req.query)) {
        return res.status(400).send('Malformed querystring');
    }

    fetch(`http://${req.query.ip}:${req.query.port}/api/executeconsolecommand?command=${req.query.command}&adminuser=${req.query.adminUser}&admintoken=${req.query.adminToken}`)
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }

            return response.json()
        })
        .then(json => {
            return res.status(200).send(json)
        })
        .catch(e => {
            console.log(e)
            return res.status(400).send(e)


        })
})

app.listen(port, () => console.log(`Listening on port ${port}!`));


function validateServerObject(obj) {
    const includesIP = obj.ip;
    const includesPort = obj.port;

    return includesIP && includesPort;
}