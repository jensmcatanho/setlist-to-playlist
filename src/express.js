const express = require('express');
const cors = require('cors')
const fetch = require("node-fetch");
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

app.get('/login', function(req, res) {
    let scopes = 'playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=e7a1436f0ecd4ae9aec4da4db57fb48e' +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent('http://localhost:3000'));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));