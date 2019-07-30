require('dotenv').config()
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const app = express();

const Config = {
  express_port: process.env['REACT_APP_EXPRESS_PORT'],
  main_host: process.env['REACT_APP_MAIN_HOST'],
  main_port: process.env['REACT_APP_MAIN_PORT'],
  spotify: {
    client_id: process.env['REACT_APP_SPOTIFY_CLIENT_ID'],
    client_secret: process.env['SPOTIFY_CLIENT_SECRET'],
  },
  setlistfm: {
    api_key: process.env['SETLISTFM_API_KEY'],
  }
};

const rootPath = path.join(__dirname, '..');

app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/artist/:artistName/date/:date', cors(), function(req, res) {
    let config = {
        headers: {
            "Accept": "application/json",
            "x-api-key": Config.setlistfm.api_key
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
          // redirect_url: `$host`
          redirect_uri: `${Config.main_host}:${Config.main_port}/create-playlist/`,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(`${Config.spotify.client_id}:${Config.spotify.client_secret}`).toString('base64'))
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
    };

    axios.get('https://api.spotify.com/v1/me', config).then(
        response => {
            res.send(response.data)
        }
    );
});

app.options('/playlist', cors());
app.post('/playlist', cors(), function(req, res) {
    let user_id = req.body.user_id;
    let access_token = req.body.access_token;
    let playlist = req.body.playlist;
    let playlist_id = "";

    axios({
        url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            "Accept": "application/json",
            'Content-Type': 'application/json'
        },
        data: {
            "name": `${playlist.artistName} -  ${playlist.date}`,
            "description": `${playlist.description}`,
            "public": false
        }
    }).then( response => {
        playlist_id = response.data.id;

        let promises = [];
        for (let i = 0; i < playlist.songs.length; i++) {
            let songEncoded = playlist.songs[i].name.split(' ').join('%20');
            let artistEncoded = playlist.artistName.split(' ').join('%20');

            promises.push(axios({
                url: `https://api.spotify.com/v1/search?q=${songEncoded}%20artist:${artistEncoded}&type=track&limit=20`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    "Accept": "application/json",
                    'Content-Type': 'application/json'
                }
            }));
        }

        let song_ids = [];
        axios.all(promises).then(response => {
            song_ids = response.map((r, i) => {
                if (r.data.tracks.items.length > 0) {
                    for (let j = 0; j < r.data.tracks.items.length; j++) {
                        if (r.data.tracks.items[j].name.toLowerCase().includes(playlist.songs[i].name.toLowerCase())) {
                            return r.data.tracks.items[j].uri;
                        }
                    }
    
                    return r.data.tracks.items[0].uri;
                }

                return "";
            }).filter(function(value, index, arr) {
                return value != "";
            });

            axios({
                url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    "Accept": "application/json",
                    'Content-Type': 'application/json'
                },
                data: {
                    "uris": song_ids
                }

            }).then(response => {
               res.send(response.data);
            });
        });
    });
});

app.listen(Config.express_port, () => console.log(`Listening on port ${Config.express_port}!`));
