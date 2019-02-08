import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PeerBaseLights from './PeerBaseLights';

class App extends Component {
  render() {
    return (
      <div className="App">
        <PeerBaseLights />
      </div>
    );
  }
}

export default App;
