import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route } from 'react-router-dom'

import ArtistForm from './components/ArtistForm.js'
import Home from './components/Home.js'

export default class App extends Component {
  render() {
    return (
      <BrowserRouter basename="/">
        <div className="App">
          <header className="App-header">
            <Route path="/" exact component={Home} />
            <Route path="/create-playlist" exact component={ArtistForm} />
          </header>
        </div>
      </BrowserRouter>
    );
  }
}