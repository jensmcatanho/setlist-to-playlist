import React, { Component } from 'react';
import queryString from "query-string";
import axios from 'axios';

import Playlist from '../Playlist.js';;

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

    axios.get(`http://localhost:4000/code/${parsed.code}`).then(
      res => {
        this.setState({
          access_token: res.data.access_token
        });
      }
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    const data = new FormData(event.target);
    const artist = data.get("artist");
    const date = this.handleDate(data.get("date"));
    console.log(artist);
    console.log(date);

    axios.get(`http://localhost:4000/access_token/${this.state.access_token}`).then(
      res => {
        this.setState({
          user_id: res.data.id
        });
      }
    );

    axios.get(`http://localhost:4000/artist/${artist}/date/${date}`).then(
      res => {
        this.handleSetlist(res.data);
      }
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