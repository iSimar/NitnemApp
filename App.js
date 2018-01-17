
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

import { setGoogleAnalyticsId, reportGoogleAnalyticsEvent } from './utils';

import configLocal from './config-local.json';

// Views
import Home from './views/Home';

// Global Variables
const GURAKHAR_FONT = require('./assets/fonts/gurakhar.ttf');
const GURAKHAR_S_FONT = require('./assets/fonts/gurakh_s.ttf');
const GURAKHAR_L_FONT = require('./assets/fonts/gurakh_l.ttf');
const GURAKHAR_H_FONT = require('./assets/fonts/gurakh_h.ttf');
const GUAK_TH_FONT = require('./assets/fonts/guak_th.ttf');

let savedConfig = null;

// console.disableYellowBox = true;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appIsReady: false
    };
  }

  async loadAssetsAsync() {
    await setGoogleAnalyticsId(configLocal.googleAnalyticsId);
    await Font.loadAsync({
      gurakhar: GURAKHAR_FONT,
      gurakhar_slim: GURAKHAR_S_FONT,
      gurakhar_light: GURAKHAR_L_FONT,
      gurakhar_heavy: GURAKHAR_H_FONT,
      gurakhar_thick: GUAK_TH_FONT
    });
    savedConfig = await AsyncStorage.getItem('config');
    if (savedConfig) {
      const parsedSavedConfig = JSON.parse(savedConfig);
      for (const key of Object.keys(parsedSavedConfig)) {
        if (key && parsedSavedConfig[key]) {
          reportGoogleAnalyticsEvent('App Load Up', 'Read Saved Config', key, parsedSavedConfig[key]);
        }
      }
    }
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
    return (<Home config={savedConfig ?
        { ...initalConfig, ...JSON.parse(savedConfig) }
        : initalConfig}
    />
    );
  }
}
