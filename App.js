
// Imports
import React, { Component } from 'react';

import {
  AsyncStorage
} from 'react-native';

import {
  Font,
  AppLoading
} from 'expo';

import initalConfig from './assets/inital-config.json';

// Views
import Home from './views/Home';

// Global Variables
const GURAKHAR_FONT = require('./assets/fonts/gurakhar.ttf');

let savedConfig = null;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appIsReady: false
    };
  }

  async loadAssetsAsync() {
    await Font.loadAsync({
      gurakhar: GURAKHAR_FONT
    });
    savedConfig = await AsyncStorage.getItem('config');
  }
  render() {
    // load assets while app in loading state
    if (!this.state.appIsReady) {
      return (
        <AppLoading
          startAsync={this.loadAssetsAsync}
          onFinish={() => this.setState({ appIsReady: true })}
        />
      );
    }
    return <Home config={savedConfig ? JSON.parse(savedConfig) : initalConfig} />;
  }
}
