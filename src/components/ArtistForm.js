import React, { Component } from 'react';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleSubmit (event) {
    event.preventDefault();

    const data = new FormData(event.target);
    const artist = data.get("artist");
    const date = this.handleDate(data.get("date"));
    console.log(artist);
    console.log(date);

    fetch(`https://cors-anywhere.herokuapp.com/https://api.setlist.fm/rest/1.0/search/setlists/?artistName=${artist}&date=${date}`, {
      method: 'GET',
      headers: {
        "Accept": "application/json",
        "x-api-key": "eb4ad752-21d6-433a-ab6c-0a52a62d7f57"
      }
    }).then(function(response) {
      console.log(response.body)
      return response.body
    });
  }

  handleDate = (date) => {
    const [year, month, day] = date.split('-')
    return `${day}-${month}-${year}`
  }

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