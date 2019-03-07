import React, { Component } from 'react';

export default class Home extends Component {

  handleSpotifyLogin() {
    window.location.href = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=e7a1436f0ecd4ae9aec4da4db57fb48e' +
    '&scope=playlist-modify-private' +
    '&redirect_uri=' + encodeURIComponent('http://localhost:3000/create-playlist/');
  }

  render() {
    return (
      <div className="Home">
        <button type="button" name="spotify-login" onClick={this.handleSpotifyLogin}>Log in with Spotify</button>
      </div>
    );
  }
}