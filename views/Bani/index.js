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
  FlatList,
  BackHandler,
  Clipboard
} from 'react-native';

import PropTypes from 'prop-types';

import { Audio, KeepAwake } from 'expo';

import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';

import Menu from './views/Menu';

import DisplaySettings from './views/DisplaySettings';

import { getTheme } from '../../utils';

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
      config: this.props.config,
      selectMode: false,
      selectedIndexes: []
    };
  }
  async componentWillMount() {
    if (this.props.config.groupStanzas) {
      await this.groupStanzas();
    }
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.onBack();
      return true;
    });
  }
  async componentWillUnmount() {
    if (this.sound) {
      await this.sound.unloadAsync();
      await this.sound.stopAsync();
    }
    // passing up the new config to home
    this.props.onNewConfig(this.state.config);
    BackHandler.removeEventListener('hardwareBackPress', () => {
      this.props.onBack();
      return false;
    });
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
        showDisplaySettings: true,
        selectMode: false,
        selectedIndexes: []
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
  onBaniRowPress(data, index) {
    const indexOfSelectedIndexes = this.state.selectedIndexes.indexOf(index);
    if (indexOfSelectedIndexes === -1) {
      // added to selected indexes
      this.setState({
        selectedIndexes: this.state.selectedIndexes.concat([index])
      });
    } else {
      // unselect, remove from selected indexes
      const newSelectedIndexes =
      this.state.selectedIndexes.filter((_, i) => i !== indexOfSelectedIndexes);
      if (this.state.selectedIndexes.length === 1) {
        this.setState({
          selectMode: false,
          selectedIndexes: newSelectedIndexes
        });
      } else {
        this.setState({
          selectedIndexes: newSelectedIndexes
        });
      }
    }
  }
  onBaniRowLongPress(data, index) {
    this.setState({
      selectMode: true,
      selectedIndexes: [index],
      showDisplaySettings: false
    });
  }
  onPressMenuDots() {
    this.menu.toggleShow(() => {
      if (this.state.selectMode) {
        this.setState({
          selectMode: false,
          selectedIndexes: []
        });
      }
    });
  }
  onPressCopy() {
    if (this.state.selectMode) {
      const selectedIndexes = this.state.selectedIndexes.sort();
      this.setState({
        selectMode: false,
        selectedIndexes: []
      }, () => {
        if (selectedIndexes.length > 0) {
          let str = '';
          for (let i = 0; i < selectedIndexes.length; i++) {
            const obj = this.state.bani[selectedIndexes[i]];
            str += `${this.state.config.larivaar ? obj.gurmukhi_unicode.replace(/\s/g, '') : obj.gurmukhi_unicode}\n\n`;
            if (this.state.config.showEnglish) {
              str += `${obj.translation_english}\n\n`;
            }
            if (this.state.config.showPunjabi) {
              str += `${obj.translation_punjabi}\n\n`;
            }
            if (i === selectedIndexes.length - 1) {
              Clipboard.setString(str.substring(0, str.length - 1));
            }
          }
        }
      });
    }
  }
  async onPressPlaySelection() {
    if (this.state.selectMode && this.state.selectedIndexes.length > 0) {
      let startingPos;
      let endingPos;
      const selectedIndexes = await this.state.selectedIndexes.sort();
      if (selectedIndexes.length > 1) {
        // todo
      } else {
        startingPos = await this.state.bani[selectedIndexes[0]].audio_position;
        if (selectedIndexes[0] < this.state.bani.length - 1) {
          endingPos = await this.state.bani[selectedIndexes[0] + 1].audio_position;
        }
      }

      this.setState({
        selectMode: false,
        selectedIndexes: [],
        showDisplaySettings: false
      }, async () => {
        if (startingPos) {
          await Audio.setIsEnabledAsync(true);
          const sound = new Audio.Sound();
          await sound.loadAsync({
            uri: this.props.bani.audio
          }, {
            shouldPlay: true,
            positionMillis: startingPos
          });
          await sound.playAsync();
          await sound.setOnPlaybackStatusUpdate((obj) => {
            if (endingPos && obj.positionMillis && obj.positionMillis >= endingPos) {
              sound.stopAsync();
            }
          });
        }
      });
    }
  }
  getTextAlignment(data) {
    if (this.state.config.centerAlignment) {
      return 'center';
    }
    if (this.state.config.groupStanzas) {
      if (data.header) {
        return 'center';
      }
      return 'justify';
    }
    return 'left';
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
        obj.gurmukhi_unicode = `${obj.gurmukhi_unicode} ${bani[i].gurmukhi_unicode}`;
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
          obj.gurmukhi_unicode = bani[i].gurmukhi_unicode;
          obj.translation_english = bani[i].translation_english;
          obj.translation_punjabi = bani[i].translation_punjabi;
          obj.section_name_english = bani[i].section_name_english;
          obj.section_name_gurmukhi = bani[i].section_name_gurmukhi;
          obj.audio_position = bani[i].audio_position;
          obj.header = bani[i].header;

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
          <Ionicons name="md-arrow-back" size={38} color={getTheme(this.state.config.themeType).primaryButtons} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {
            this.state.selectMode ?
              <View style={styles.headerSelectionButtons}>
                <TouchableOpacity
                  style={styles.headerRightButton}
                  onPress={() => this.onPressCopy()}
                >
                  <MaterialIcons name="content-copy" size={30} color={getTheme(this.state.config.themeType).primaryButtons} />
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.headerRightButton}
                  onPress={() => this.onPressPlaySelection()}
                >
                  <MaterialIcons name="play-arrow" size={35} color={getTheme(this.state.config.themeType).primaryButtons} />
                </TouchableOpacity> */}
              </View> : null
          }
          <TouchableOpacity
            style={styles.headerRightLastButton}
            onPress={() => this.onPressMenuDots()}
          >
            <Entypo name="dots-three-vertical" size={30} color={getTheme(this.state.config.themeType).primaryButtons} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  renderBaniRow(data, index) {
    const textAlignment = this.getTextAlignment(data);
    return (
      <TouchableWithoutFeedback
        onPress={() => this.state.selectMode && this.onBaniRowPress(data, index)}
        onLongPress={() => !this.state.selectMode && this.onBaniRowLongPress(data, index)}
      >
        <View>
          <View style={[styles.baniRow, {
              paddingTop:
              !this.state.config.showEnglish && !this.state.config.showPunjabi ? 7.5 : 15,
              paddingBottom:
              this.state.bani.length - 1 === index ? 60 :
              (!this.state.config.showEnglish && !this.state.config.showPunjabi ? 7.5 : 15),
              backgroundColor: this.state.selectMode ?
              (
                this.state.selectedIndexes.indexOf(index) !== -1 ?
                getTheme(this.state.config.themeType).secondaryBackgroundColor :
                getTheme(this.state.config.themeType).primaryBackgroundColor
              )
              : getTheme(this.state.config.themeType).primaryBackgroundColor
            }]}
          >
            <Text style={[styles.baniText, {
                fontFamily: this.state.config.groupStanzas && data.header ? 'gurakhar_heavy' : 'gurakhar',
                color: data.header &&
                !this.state.config.showEnglish && !this.state.config.showPunjabi
                ? getTheme(this.state.config.themeType).secondaryTextColor
                : getTheme(this.state.config.themeType).primaryTextColor,
                textAlign: textAlignment,
                fontSize: this.state.config.groupStanzas && data.header ?
                  (this.state.config.gurmukhiFontSize + 4)
                  : this.state.config.gurmukhiFontSize
              }]}
            >
              {this.state.config.larivaar ? data.gurmukhi.replace(/\s/g, '') : data.gurmukhi}
            </Text>
            {
                  this.state.config.showEnglish && data.translation_english !== '' ?
                    <Text style={[styles.baniTranslation, {
                        color: getTheme(this.state.config.themeType).secondaryTextColor,
                        textAlign: textAlignment,
                        fontSize: this.state.config.groupStanzas && data.header ?
                        (this.state.config.englishFontSize + 3)
                        : this.state.config.englishFontSize,
                        fontWeight: this.state.config.groupStanzas && data.header ? 'bold' : 'normal'
                      }]}
                    >
                      {data.translation_english}
                    </Text> : null
              }
            {
                  this.state.config.showPunjabi && data.translation_punjabi !== ' ' ?
                    <Text style={[styles.baniTranslation, {
                        color: getTheme(this.state.config.themeType).secondaryTextColor,
                        textAlign: textAlignment,
                        fontSize: this.state.config.groupStanzas && data.header ?
                        (this.state.config.punjabiFontSize + 1)
                        : this.state.config.punjabiFontSize,
                        fontWeight: this.state.config.groupStanzas && data.header ? 'bold' : 'normal'
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
                        color: getTheme(this.state.config.themeType).primaryButtons,
                        paddingRight: 10,
                        fontSize: 33
                        }]}
                    >
                      {this.state.baniMetadata.next_name_gurmukhi}
                    </Text>
                    <Ionicons name="md-arrow-forward" size={38} color={getTheme(this.state.config.themeType).primaryButtons} />
                  </TouchableOpacity>
                </View> : null
          }
        </View>
      </TouchableWithoutFeedback>
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
          backgroundColor: getTheme(this.state.config.themeType).secondaryBackgroundColor
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
            backgroundColor: getTheme(this.state.config.themeType).primaryBackgroundColor
        }]}
      >
        <StatusBar barStyle={getTheme(this.state.config.themeType).isLight ? 'dark-content' : 'light-content'} />
        <KeepAwake />
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
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingTop: 20
  },
  headerRightLastButton: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 20
  },
  headerRightButton: {
    flex: 1,
    alignItems: 'flex-end'
  },
  headerSelectionButtons: {
    flexDirection: 'row',
    flex: 2,
    alignItems: 'center'
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
