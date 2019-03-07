const express = require('express');
const cors = require('cors')
const fetch = require("node-fetch");
var request = require('request');
const app = express();
const port = 4000;

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/artist/:artistName/date/:date', cors(), function(req, res) {
    fetch(`https://api.setlist.fm/rest/1.0/search/setlists/?artistName=${req.params.artistName}&date=${req.params.date}`, {
        method: 'GET',
        headers: {
            "Accept": "application/json",
            "x-api-key": "eb4ad752-21d6-433a-ab6c-0a52a62d7f57"
        }
    }).then(
        response => response.json()
    ).then(
        data => res.send(data)
    );
});

app.get('/code/:code', cors(), function(req, res) {
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: req.params.code,
          redirect_uri: 'http://localhost:3000/create-playlist/',
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer('e7a1436f0ecd4ae9aec4da4db57fb48e:cdd7d80e7b524232a501dd71d732bbc9').toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        res.send(body);
    });
});

app.get('/access_token/:access_token', cors(), function(req, res) {
    let authOptions = {
        url: 'https://api.spotify.com/v1/me',
        headers: {
            'Authorization': 'Bearer ' + req.params.access_token
        }
    }
    request.get(authOptions, function(error, response, body) {
        res.send(body);
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));