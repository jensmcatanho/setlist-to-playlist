import React, { Component } from 'react';

export default class Home extends Component {

  handleSpotifyLogin() {
    window.location.href = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    `&client_id=${process.env.SPOTIFY_CLIENTID}` +
    '&scope=playlist-modify-private' +
    '&redirect_uri=' + encodeURIComponent(`${process.env.WEB_URL}/create-playlist/`);
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