require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')
const queryString = require('query-string')
const app = express()

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
}

app.use(bodyParser.json())

app.get('/healthcheck', (req, res) => res.send('WORKING'))

app.get('/artist/:artistName/date/:date', cors(), (req, res) => {
    fetchSetlist(req.params.artistName, req.params.date).then(response => res.send(response))
})

app.get('/code/:code', cors(), (req, res) => {
    getAccessToken(req.params.code).then(response => res.send(response))
})

app.get('/access_token/:access_token', cors(), (req, res) => {
    getUserID(req.params.access_token).then(response => res.send(response))
})

app.options('/playlist', cors())
app.post('/playlist', cors(), (req, res) => {
    createPlaylist(req.body.user_id, req.body.access_token, req.body.playlist).then(response => res.send(response))
})

function fetchSetlist(artistName, date) {
    return axios({
        url: `https://api.setlist.fm/rest/1.0/search/setlists/?artistName=${artistName}&date=${date}`,
        method: 'GET',
        headers: {
            "Accept": "application/json",
            "x-api-key": Config.setlistfm.api_key
        }
    }).then(response => {
        return response.data
    }).catch(error => {
        logRequestError('fetchSetlist', error)
    })
}

function getAccessToken(authorizationCode) {
    return axios({
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        data: queryString.stringify({
            code: authorizationCode,
            redirect_uri: `${Config.main_host}:${Config.main_port}/create-playlist/`,
            grant_type: 'authorization_code'
        }),
        headers: {
            'Authorization': 'Basic ' + (new Buffer(`${Config.spotify.client_id}:${Config.spotify.client_secret}`).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => {
        console.log('Access token generated');
        return response.data.access_token
    }).catch(error => {
        logRequestError('getAccessToken', error)
    })
}

function getUserID(accessToken) {
    return axios({
        url: 'https://api.spotify.com/v1/me',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    }).then(response => {
        return response.data.id
    }).catch(error => {
        logRequestError('getUserID', error)
    })
}

function createPlaylist(userID, accessToken, playlist) {
    return initPlaylist(userID, accessToken, playlist).then(response => {
        getSongIDs(accessToken, playlist).then(songIDs => {        
            addSongsToPlaylist(response.id, accessToken, songIDs).then(response => {
                return response.data
            })
        })
    })
}

function initPlaylist(userID, accessToken, playlist) {
    return axios({
        url: `https://api.spotify.com/v1/users/${userID}/playlists`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            "Accept": "application/json",
            'Content-Type': 'application/json'
        },
        data: {
            "name": `${playlist.artistName} -  ${playlist.date}`,
            "description": `${playlist.description}`,
            "public": false
        }
    }).then(response => {
        return response.data
    }).catch(error => {
        logRequestError('initPlaylist', error)
    })
}

function getSongIDs(accessToken, playlist) {
    let promises = []
    const artistEncoded = encodeURIComponent(playlist.artistName)

    for (let i = 0; i < playlist.songs.length; ++i) {
        let songEncoded = encodeURIComponent(playlist.songs[i].name)
        promises.push(getSong(songEncoded, artistEncoded, accessToken))
    }

    let songIDs = []
    return axios.all(promises).then(response => {
        songIDs = response.map((r, i) => {
            if (r.data.tracks.items.length == 0)
                return ""

            for (let j = 0; j < r.data.tracks.items.length; ++j) {
                if (r.data.tracks.items[j].name.toLowerCase().includes(playlist.songs[i].name.toLowerCase())) {
                    return r.data.tracks.items[j].uri
                }
            }
            
            return r.data.tracks.items[0].uri
        }).filter(function(value, index, arr) {
            return value != ""
        })

        return songIDs
    }).catch(error => {
        logRequestError('getSongIDs', error)
    })
}

function getSong(song, artist, accessToken) {
    return axios({
        url: `https://api.spotify.com/v1/search?q=${song}%20artist:${artist}&type=track&limit=20`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            "Accept": "application/json",
            'Content-Type': 'application/json'
        }
    })
}

function addSongsToPlaylist(playlistID, accessToken, songIDs) {
    return axios({
        url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            "Accept": "application/json",
            'Content-Type': 'application/json'
        },
        data: {
            "uris": songIDs
        }

    }).then(response => {
        return response.data
    }).catch(error => {
        logRequestError('addSongToPlaylist', error)
    })
}

function logRequestError(handlerName, error) {
    if (error.response) {
        console.log(`${handlerName}: ${JSON.stringify(error.response.data, null, 4)}`)
        console.log(`${handlerName}: ${JSON.stringify(error.response.status, null, 4)}`)
        console.log(`${handlerName}: ${JSON.stringify(error.response.headers, null, 4)}`)
    } else if (error.request) {
        console.log(`${handlerName}: ${JSON.stringify(error.request, null, 4)}`)
    } else {
        console.log('Error', error.message)
    }
    console.log(error.config)
}

app.listen(Config.express_port, () => console.log(`Listening on port ${Config.express_port}!`))
