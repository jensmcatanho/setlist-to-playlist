import React, { Component } from 'react';
import queryString from "query-string";
import axios from 'axios';

import Playlist from '../Playlist.js';;

require('dotenv').config()
const Config = {
  express_port: process.env['REACT_APP_EXPRESS_PORT'],
  main_host: process.env['REACT_APP_MAIN_HOST'],
};

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

    axios.get(`${Config.main_host}:${Config.express_port}/code/${parsed.code}`).then(
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

    console.log(`URL: ${Config.main_host}:${Config.express_port}/artist/${artist}/date/${date}`);

    axios({
      url: `${Config.main_host}:${Config.express_port}/artist/${artist}/date/${date}`,
      method: "GET"
    }).then( response => {
      let playlist = new Playlist(response.data);

      axios({
        url: `${Config.main_host}:${Config.express_port}/access_token/${this.state.access_token}`,
        method: "GET",
      }).then( response => {
        axios({
          method: 'POST',
          url: `${Config.main_host}:${Config.express_port}/playlist/`,
          data: {
            "user_id": response.data.id,
            "access_token": this.state.access_token,
            "playlist": playlist
          }
        }).then(
          response => {
             console.log(response.data);
        });
      });
    });
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