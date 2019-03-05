import React, { Component } from 'react';
import './App.css';

import ArtistForm from './components/ArtistForm.js'

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <ArtistForm />
        </header>
      </div>
    );
  }
}