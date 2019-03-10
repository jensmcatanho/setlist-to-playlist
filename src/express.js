const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

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
          // redirect_url: `$host`
          redirect_uri: `${Config.host}/create-playlist/`,
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
            let songEncoded = playlist.songs[i].name.replace(' ', '%20');
            let artistEncoded = playlist.artistName.replace(' ', '%20');

            promises.push(axios({
                url: `https://api.spotify.com/v1/search?q=${songEncoded}%20artist:${artistEncoded}&type=track&limit=1`,
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
            song_ids = response.map(r => r.data.tracks.items[0].uri);
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
               res.send(status)
            });
        });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
