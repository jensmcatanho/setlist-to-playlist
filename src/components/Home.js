import React, { Component } from 'react';

require('dotenv').config()
const Config = {
  main_host: process.env['REACT_APP_MAIN_HOST'],
  main_port: process.env['REACT_APP_MAIN_PORT'],
  spotify: {
    client_id: process.env['REACT_APP_SPOTIFY_CLIENT_ID'],
  },
};

export default class Home extends Component {

  handleSpotifyLogin() {
    console.log(Config);

    window.location.href = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    `&client_id=${Config.spotify.client_id}` +
    '&scope=playlist-modify-private' +
    '&redirect_uri=' + encodeURIComponent(`${Config.main_host}:${Config.main_port}/create-playlist/`);
  }

  render() {
    return (
      <div className="Home">
        <h1>Setlist to Playlist</h1>
        <button type="button" class="button" name="spotify-login" onClick={this.handleSpotifyLogin}>Log in with Spotify</button>
      </div>
    );
  }
}