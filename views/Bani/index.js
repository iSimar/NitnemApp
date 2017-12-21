/* eslint-disable global-require */

// Imports

import React, { Component } from 'react';

import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';

import PropTypes from 'prop-types';

import { Audio } from 'expo';

import { Entypo, Ionicons } from '@expo/vector-icons';

import Menu from './views/Menu';

import DisplaySettings from './views/DisplaySettings';

import themes from '../../assets/themes.json';

const { width, height } = Dimensions.get('window');


export default class Bani extends Component {
  constructor(props) {
    super(props);

    let bani = null;

    if (this.props.bani.name === 'japji sahib') {
      bani = require('../../assets/banis/japjisahib.json');
    } else if (this.props.bani.name === 'jaap sahib') {
      bani = require('../../assets/banis/jaapsahib.json');
    } else if (this.props.bani.name === 'tav parsaad savaye') {
      bani = require('../../assets/banis/tavparsaadsavaye.json');
    } else if (this.props.bani.name === 'chaupai sahib') {
      bani = require('../../assets/banis/chaupaisahib.json');
    } else if (this.props.bani.name === 'anand sahib') {
      bani = require('../../assets/banis/anandsahib.json');
    } else if (this.props.bani.name === 'ardaas') {
      bani = require('../../assets/banis/ardaas.json');
    } else if (this.props.bani.name === 'rehras sahib') {
      bani = require('../../assets/banis/rehrassahib.json');
    } else if (this.props.bani.name === 'kirtan sohila') {
      bani = require('../../assets/banis/kirtansohila.json');
    }

    this.state = {
      baniMetadata: this.props.bani,
      bani,
      baniUngrouped: bani,
      showDisplaySettings: false,
      config: this.props.config
    };
  }
  async componentWillMount() {
    if (this.props.config.groupStanzas) {
      await this.groupStanzas();
    }
  }
  async componentWillUnmount() {
    if (this.sound) {
      await this.sound.unloadAsync();
      await this.sound.stopAsync();
    }
    // passing up the new config to home
    this.props.onNewConfig(this.state.config);
  }
  async onPressMenuOption(name) {
    if (name === 'play-audio') {
      await Audio.setIsEnabledAsync(true);
      this.sound = new Audio.Sound();
      await this.sound.loadAsync({
        uri: this.props.bani.audio
      });
      await this.sound.playAsync();
      await this.sound.setOnPlaybackStatusUpdate((obj) => {
        if (obj.isLoaded && obj.isPlaying && this.menu) {
          this.menu.setState({
            isLoadingAudio: true,
            isPlayingAudio: true
          });
        }
      });
    } else if (name === 'resume-audio' && this.sound) {
      await this.sound.playAsync();
    } else if (name === 'pause-audio' && this.sound) {
      await this.sound.pauseAsync();
    } else if (name === 'stop-audio' && this.sound) {
      await this.sound.stopAsync();
    } else if (name === 'settings') {
      this.menu.hide();
      this.setState({
        showDisplaySettings: true
      });
    }
  }
  onNewConfig(config) {
    if (!this.state.config.groupStanzas && config.groupStanzas) {
      this.groupStanzas(() => {
        this.setState({ config });
      });
    } else if (this.state.config.groupStanzas && !config.groupStanzas) {
      this.ungroupStanzas(() => {
        this.setState({ config });
      });
    } else {
      this.setState({ config });
    }
  }
  groupStanzas(cb) {
    const { bani } = this.state;
    const rows = [];
    let tmpSectionId = -1;
    let obj = null;
    for (let i = 0; i < bani.length; i++) {
      if (bani[i].section_id === tmpSectionId) {
        obj.gurmukhi = `${obj.gurmukhi} ${bani[i].gurmukhi}`;
        obj.vishraam = `${obj.vishraam} ${bani[i].vishraam}`;
        obj.translation_english = `${obj.translation_english} ${bani[i].translation_english}`;
        obj.translation_punjabi = `${obj.translation_punjabi} ${bani[i].translation_punjabi}`;
        obj.section_name_english = bani[i].section_name_english;
        obj.section_name_gurmukhi = bani[i].section_name_gurmukhi;

        if (i === bani.length - 1) {
          if (obj != null) {
            rows.push(obj);
            obj = null;
          }
          this.setState({ bani: rows }, cb);
        }
      } else {
        if (obj != null) {
          rows.push(obj);
          obj = null;
        }
        if (!bani[i].section_id) {
          rows.push(bani[i]);
        } else if (obj == null) {
          obj = {};
          tmpSectionId = bani[i].section_id;
          obj.gurmukhi = bani[i].gurmukhi;
          obj.vishraam = bani[i].vishraam;
          obj.translation_english = bani[i].translation_english;
          obj.translation_punjabi = bani[i].translation_punjabi;
          obj.section_name_english = bani[i].section_name_english;
          obj.section_name_gurmukhi = bani[i].section_name_gurmukhi;

          if (i === bani.length - 1) {
            if (obj != null) {
              rows.push(obj);
              obj = null;
            }
            this.setState({ bani: rows }, cb);
          }
        }
      }
    }
  }
  ungroupStanzas(cb) {
    this.setState({ bani: this.state.baniUngrouped }, cb);
  }
  renderHeader() {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={this.props.onBack}
        >
          <Ionicons name="md-arrow-back" size={38} color={themes[this.state.config.themeType].primaryButtons} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerRight}
          onPress={() => this.menu.toggleShow()}
        >
          <Entypo name="dots-three-vertical" size={30} color={themes[this.state.config.themeType].primaryButtons} />
        </TouchableOpacity>
      </View>
    );
  }
  renderBaniRow(data, index) {
    return (
      <View>
        <View style={[styles.baniRow, {
            paddingBottom:
            this.state.bani.length - 1 === index ? 60 :
            (!this.state.config.showEnglish && !this.state.config.showPunjabi ? 0 : 15)
          }]}
        >
          <Text style={[styles.baniText, {
              color: themes[this.state.config.themeType].primaryTextColor,
              textAlign: this.state.config.centerAlignment ? 'center' : 'left',
              fontSize: this.state.config.gurmukhiFontSize
            }]}
          >
            {data.gurmukhi}
          </Text>
          {
                this.state.config.showEnglish && data.translation_english !== '' ?
                  <Text style={[styles.baniTranslation, {
                      color: themes[this.state.config.themeType].secondaryTextColor,
                      textAlign: this.state.config.centerAlignment ? 'center' : 'left',
                      fontSize: this.state.config.englishFontSize
                    }]}
                  >
                    {data.translation_english}
                  </Text> : null
            }
          {
                this.state.config.showPunjabi && data.translation_punjabi !== ' ' ?
                  <Text style={[styles.baniTranslation, {
                      color: themes[this.state.config.themeType].secondaryTextColor,
                      textAlign: this.state.config.centerAlignment ? 'center' : 'left',
                      fontSize: this.state.config.punjabiFontSize
                    }]}
                  >
                    {data.translation_punjabi}
                  </Text> : null
            }
        </View>
        {
            this.state.baniMetadata.next_index &&
            this.state.baniMetadata.next_name_gurmukhi &&
            this.state.bani.length - 1 === index ?
              <View style={styles.nextBaniContainer}>
                <TouchableOpacity
                  style={styles.nextBaniTouchable}
                  onPress={() => this.props.onNext(this.state.baniMetadata.next_index)}
                >
                  <Text style={[styles.baniText, {
                      color: themes[this.state.config.themeType].primaryButtons,
                      paddingRight: 10,
                      fontSize: 33
                      }]}
                  >
                    {this.state.baniMetadata.next_name_gurmukhi}
                  </Text>
                  <Ionicons name="md-arrow-forward" size={38} color={themes[this.state.config.themeType].primaryButtons} />
                </TouchableOpacity>
              </View> : null
        }
      </View>
    );
  }
  renderContent() {
    return (
      <TouchableWithoutFeedback onPressIn={() => this.menu.hide()}>
        <FlatList
          style={styles.baniList}
          data={this.state.bani}
          extraData={this.state}
          keyExtractor={(item, index) => index}
          renderItem={({ item, index }) => this.renderBaniRow(item, index)}
        />
      </TouchableWithoutFeedback>
    );
  }
  renderMenu() {
    return (
      <View style={styles.menuContainer}>
        <Menu
          ref={(c) => { this.menu = c; }}
          config={this.state.config}
          onPress={(name, menuRef) => this.onPressMenuOption(name, menuRef)}
        />
      </View>
    );
  }
  renderDisplaySettings() {
    if (!this.state.showDisplaySettings) {
      return null;
    }
    return (
      <View style={[styles.displaySettingsContainer, {
          backgroundColor: themes[this.state.config.themeType].secondaryBackgroundColor
        }]}
      >
        <DisplaySettings
          ref={(c) => { this.displaySettings = c; }}
          config={this.state.config}
          onClose={() => this.setState({ showDisplaySettings: false })}
          onNewConfig={config => this.onNewConfig(config)}
        />
      </View>
    );
  }
  render() {
    return (
      <View style={[styles.container, {
            backgroundColor: themes[this.state.config.themeType].primaryBackgroundColor
        }]}
      >
        <StatusBar barStyle="light-content" />
        { this.renderHeader() }
        { this.renderContent() }
        { this.renderMenu() }
        { this.renderDisplaySettings() }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15
  },
  header: {
    flexDirection: 'row'
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingTop: 20
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 20,
    paddingTop: 20
  },
  menuContainer: {
    justifyContent: 'center',
    flexDirection: 'column',
    position: 'absolute',
    top: 77,
    right: 0,
    width
  },
  optionButton: {
    flexDirection: 'row',
    paddingRight: 20,
    paddingTop: 10,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  optionButtonText: {
    paddingLeft: 10,
    fontSize: 20
  },
  baniList: {
    flex: 1,
    paddingTop: 5,
    marginTop: 10
  },
  baniRow: {
    padding: 15,
    justifyContent: 'center',
    flex: 1
  },
  baniText: {
    fontFamily: 'gurakhar'
  },
  baniTranslation: {
  },
  displaySettingsContainer: {
    position: 'absolute',
    bottom: 0,
    width,
    height: 0.40 * height
  },
  nextBaniContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 40,
    marginBottom: 30
  },
  nextBaniTouchable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

Bani.propTypes = {
  config: PropTypes.object.isRequired,
  bani: PropTypes.object.isRequired,
  onNewConfig: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
};
