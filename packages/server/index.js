import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import axios from 'axios'
import dotenv from 'dotenv'
import { stringify } from 'query-string'

dotenv.config()

const app = express()

app.use(bodyParser.json())

app.get('/healthcheck', (req, res) => {
    res.send(healthCheck ? 'WORKING\n' : 'NOT WORKING\n')
})

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

function healthCheck() {
    return process.env.SPOTIFY_CLIENTID &&
        process.env.SPOTIFY_CLIENT_SECRET &&
        process.env.SETLISTFM_API_KEY
}

async function fetchSetlist(artistName, date) {
    try {
        const response = await axios({
            url: `https://api.setlist.fm/rest/1.0/search/setlists/?artistName=${artistName}&date=${date}`,
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "x-api-key": process.env.SETLISTFM_API_KEY
            }
        })
        return response.data
    } catch (error) {
        logRequestError('fetchSetlist', error)
    }
}

async function getAccessToken(authorizationCode) {
    try {
        const response = await axios({
            url: 'https://accounts.spotify.com/api/token',
            method: 'POST',
            data: stringify({
                code: authorizationCode,
                redirect_uri: `${process.env.WEB_URL}/create-playlist/`,
                grant_type: 'authorization_code'
            }),
            headers: {
                'Authorization': 'Basic ' + (new Buffer(`${process.env.SPOTIFY_CLIENTID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        console.log('Access token generated')
        return response.data.access_token
    } catch (error) {
        logRequestError('getAccessToken', error)
    }
}

async function getUserID(accessToken) {
    try {
        const response = await axios({
            url: 'https://api.spotify.com/v1/me',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        return response.data.id
    } catch (error) {
        logRequestError('getUserID', error)
    }
}

async function createPlaylist(userID, accessToken, playlist) {
    const response = await initPlaylist(userID, accessToken, playlist)
    console.log(`createPlaylist: ${JSON.stringify(response, null, 4)}`)
    getSongIDs(accessToken, playlist).then(songIDs => {
        addSongsToPlaylist(response.id, accessToken, songIDs).then(response_1 => {
            return response_1.data
        })
    })
}

async function initPlaylist(userID, accessToken, playlist) {
    try {
        const response = await axios({
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
        })
        return response.data
    } catch (error) {
        logRequestError('initPlaylist', error)
    }
}

async function getSongIDs(accessToken, playlist) {
    let promises = []
    const artistEncoded = encodeURIComponent(playlist.artistName)

    for (let i = 0; i < playlist.songs.length; ++i) {
        let songEncoded = encodeURIComponent(playlist.songs[i].name)
        promises.push(getSong(songEncoded, artistEncoded, accessToken))
    }

    let songIDs = []
    try {
        const response = await axios.all(promises)
        songIDs = response.map((r, i_1) => {
            if (r.data.tracks.items.length == 0)
                return ""

            for (let j = 0; j < r.data.tracks.items.length; ++j) {
                if (r.data.tracks.items[j].name.toLowerCase().includes(playlist.songs[i_1].name.toLowerCase())) {
                    return r.data.tracks.items[j].uri
                }
            }

            return r.data.tracks.items[0].uri
        }).filter(function (value, index, arr) {
            return value != ""
        })
        return songIDs
    } catch (error) {
        logRequestError('getSongIDs', error)
    }
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

async function addSongsToPlaylist(playlistID, accessToken, songIDs) {
    try {
        const response = await axios({
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
        })
        return response.data
    } catch (error) {
        logRequestError('addSongToPlaylist', error)
    }
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

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}!`))