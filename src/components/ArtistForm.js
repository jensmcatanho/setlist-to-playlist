import React, { Component } from 'react';
import queryString from "query-string";

import Playlist from '../Playlist.js';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      "code": "",
      "access_token": "",
      "user_id": ""
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const parsed = queryString.parse(this.props.location.search);
    this.setState({
      code: parsed.code
    });

    fetch(`http://localhost:4000/code/${parsed.code}`, {
      method: 'GET'
    }).then(
      response => response.json()
    ).then(
      data => this.setState({
        access_token: data.access_token
      })
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    const data = new FormData(event.target);
    const artist = data.get("artist");
    const date = this.handleDate(data.get("date"));
    console.log(artist);
    console.log(date);

    fetch(`http://localhost:4000/access_token/${this.state.access_token}`, {
      method: 'GET'
    }).then(
      response => response.json()
    ).then(
      data => this.setState({
        user_id: data.id
      })
    );

    fetch(`http://localhost:4000/artist/${artist}/date/${date}`, {
      method: 'GET'
    }).then(
      response => response.json()
    ).then(
      data => this.handleSetlist(data)
    );
  }

  handleSetlist = (setlist) => {
    let playlist = new Playlist(setlist.setlist[0].artist.name, setlist.setlist[0].eventDate);

    const numSets = setlist.setlist[0].sets.set.length;
    for (let i = 0; i < numSets; i++) {
      const numSongs = setlist.setlist[0].sets.set[i].song.length;

      for (let j = 0; j < numSongs; j++) {
        playlist.addSong(setlist.setlist[0].sets.set[i].song[j].name);
      }
    }

    playlist.printSongs();
    return playlist;
  };

  handleDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`
  };

  render() {
    return (
      <div className="ArtistForm">
        <form onSubmit={this.handleSubmit}>
          <label>Artist:</label><br />
          <input type="text"
                 name="artist"
          /><br />

          <label>Date:</label><br />
          <input type="date"
                 name="date"
          /><br />

          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}