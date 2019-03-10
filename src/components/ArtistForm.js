import React, { Component } from 'react';
import queryString from "query-string";
import axios from 'axios';

import Playlist from '../Playlist.js';;

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      "access_token": "",
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const parsed = queryString.parse(this.props.location.search);

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
    let playlist = new Playlist();
    console.log(artist);
    console.log(date);

    axios.get(`http://localhost:4000/artist/${artist}/date/${date}`).then(
        res => {
          playlist.constructor2(res.data);
        }
    );

    console.log(playlist);

    axios.get(`http://localhost:4000/access_token/${this.state.access_token}`).then(
      res => {
        axios({
          method: 'POST',
          url: 'http://localhost:4000/playlist/',
          data: {
            "user_id": res.data.id,
            "access_token": this.state.access_token,
            "playlist": playlist
          }
        }).then(
            res => {
              console.log(res.data);
            }
        );
      }
    );

  }

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