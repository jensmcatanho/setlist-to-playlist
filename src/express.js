const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require("node-fetch");
const request = require('request');
const axios = require('axios');
const app = express();
const port = 4000;

const rootPath = path.join(__dirname, '..');

app.use(express.static(path.join( rootPath, 'build' )))
app.get('/', (req, res) => {
  res.sendFile(path.join( rootPath, 'build', 'index.html' ));
})


app.get('/artist/:artistName/date/:date', cors(), function(req, res) {
    let config = {
        headers: {
            "Accept": "application/json",
            "x-api-key": "eb4ad752-21d6-433a-ab6c-0a52a62d7f57"
        }
    }

    axios.get(`https://api.setlist.fm/rest/1.0/search/setlists/?artistName=${req.params.artistName}&date=${req.params.date}`, config).then(
        response => {
            res.send(response.data)
        }
    );
});

app.get('/code/:code', cors(), function(req, res) {
    // Refactor: change it to use axios
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
    let config = {
        headers: {
            'Authorization': 'Bearer ' + req.params.access_token
        }
    }

    axios.get('https://api.spotify.com/v1/me', config).then(
        response => {
            res.send(response.data)
        }
    );
});

app.listen(port, () => console.log(`Listening on port ${port}!`));