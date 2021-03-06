import React, { Component } from 'react';

import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  AsyncStorage
} from 'react-native';

import PropTypes from 'prop-types';

import themes from '../../../../assets/themes.json';

import initalConfig from '../../../../assets/inital-config.json';

import { getTheme, reportGoogleAnalyticsEvent } from '../../../../utils';

export default class DisplaySettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: this.props.config,
      settings: [
        {
          name: 'gurmukhi-font-size',
          label: 'Gurmukhi Font Size',
          types: [{
            name: 'plus-minus',
            configName: 'gurmukhiFontSize',
            minVal: 19,
            maxVal: 35
          }]
        },
        {
          name: 'english-translation',
          label: 'English Translation',
          types: [{
            name: 'on-off',
            configName: 'showEnglish'
          },
          {
            name: 'plus-minus',
            configName: 'englishFontSize',
            minVal: 14,
            maxVal: 30
          }]
        },
        {
          name: 'punjabi-translation',
          label: 'Punjabi Translation',
          types: [{
            name: 'on-off',
            configName: 'showPunjabi'
          },
          {
            name: 'plus-minus',
            configName: 'punjabiFontSize',
            minVal: 14,
            maxVal: 30
          }]
        },
        {
          name: 'larivaar',
          label: 'Larivaar',
          types: [{
            name: 'on-off',
            configName: 'larivaar'
          }]
        },
        {
          name: 'group-stanzas',
          label: 'Group Stanzas',
          types: [{
            name: 'on-off',
            configName: 'groupStanzas'
          }]
        },
        {
          name: 'center-alignment',
          label: 'Center Alignment',
          types: [{
            name: 'on-off',
            configName: 'centerAlignment'
          }]
        },
        {
          name: 'themes',
          label: 'Theme',
          types: [{
            name: 'color-palette-selector',
            configName: 'themeType'
          }]
        }
      ]
    };
  }
  onClose() {
    this.props.onClose();
    reportGoogleAnalyticsEvent('Display Settings', 'Close Pressed');
  }
  onReset() {
    this.onSetNewConfig(initalConfig);
    reportGoogleAnalyticsEvent('Display Settings', 'Reset Pressed');
  }
  onSetNewConfig(configObj) {
    const stateObj = Object.assign({}, this.state);
    stateObj.config = configObj;
    this.setState(stateObj);
    this.props.onNewConfig(configObj);
    AsyncStorage.setItem('config', JSON.stringify(configObj));
  }
  renderColorPaletteSelector(typeObj) {
    return (
      <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10 }}>
        {
          [true, false].map(oddRow => (
            <View key={JSON.stringify(oddRow)} style={{ flex: 1, paddingLeft: 5, paddingRight: 5 }}>
              {
              Object.keys(themes).map((theme, themeIndex) => {
                if (oddRow ? themeIndex % 2 !== 0 : themeIndex % 2 === 0) {
                  return null;
                }
                return (
                  <TouchableOpacity
                    key={theme}
                    style={[styles.colorPaletteCellContainer, {
                      borderColor: this.state.config[typeObj.configName] === theme ?
                      getTheme(this.state.config.themeType).secondaryTextColor
                      :
                      getTheme(this.state.config.themeType).primaryButtons
                    }]}
                    onPress={() => {
                      const configObj = Object.assign({}, this.state.config);
                      configObj[typeObj.configName] = theme;
                      reportGoogleAnalyticsEvent('Display Settings', `Select Theme: ${theme}`);
                      this.onSetNewConfig(configObj);
                    }}
                  >
                    {
                      Object.keys(getTheme(theme)).map(colorKey => (
                        typeof (getTheme(theme)[colorKey]) === 'boolean' ? null :
                        <View
                          key={theme + colorKey}
                          style={{
                            backgroundColor: getTheme(theme)[colorKey],
                            flex: 1,
                            height: 30
                          }}
                        />
                      ))
                    }
                  </TouchableOpacity>
                );
                })
            }
            </View>))
        }
      </View>
    );
  }
  renderOnOff(typeObj) {
    return (
      <Switch
        style={styles.switch}
        value={this.state.config[typeObj.configName]}
        onValueChange={(val) => {
          const configObj = Object.assign({}, this.state.config);
          configObj[typeObj.configName] = val;
          reportGoogleAnalyticsEvent('Display Settings', `Toggle ${val} ${typeObj.configName} `);
          this.onSetNewConfig(configObj);
        }}
      />);
  }
  renderPlusMinus(typeObj) {
    return (
      <View style={styles.plusMinusContainer}>
        <TouchableOpacity onPress={() => {
            const configObj = Object.assign({}, this.state.config);
            configObj[typeObj.configName] = this.state.config[typeObj.configName] < typeObj.maxVal
              ? this.state.config[typeObj.configName] + 1 : typeObj.maxVal;
            reportGoogleAnalyticsEvent('Display Settings', `Increase ${typeObj.configName}`);
            this.onSetNewConfig(configObj);
          }}
        >
          <Text style={[styles.plusButton, {
              borderColor: getTheme(this.state.config.themeType).primaryButtons,
              color: getTheme(this.state.config.themeType).primaryButtons
            }]}
          >{' + '}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
            const configObj = Object.assign({}, this.state.config);
            const newVal = this.state.config[typeObj.configName] > typeObj.minVal
              ? this.state.config[typeObj.configName] - 1 : typeObj.minVal;
            configObj[typeObj.configName] = newVal;
            reportGoogleAnalyticsEvent('Display Settings', `Decrease ${typeObj.configName}`);
            this.onSetNewConfig(configObj);
        }}
        >
          <Text style={[styles.minusButton, {
              borderColor: getTheme(this.state.config.themeType).primaryButtons,
              color: getTheme(this.state.config.themeType).primaryButtons
            }]}
          >{' - '}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  renderSettingsRowType(typeObj) {
    if (typeObj.name === 'on-off') {
      return this.renderOnOff(typeObj);
    } else if (typeObj.name === 'plus-minus') {
      return this.renderPlusMinus(typeObj);
    } else if (typeObj.name === 'color-palette-selector') {
      return null;
    }
    return null;
  }
  renderSettingsRowTypes(obj) {
    return (
      <View style={styles.settingsRowTypes}>
        {
          obj.types.map(typeObj =>
            (
              <View key={typeObj.name} style={styles.settingsRowTypeContainer}>
                { this.renderSettingsRowType(typeObj) }
              </View>
            ))
        }
      </View>
    );
  }
  renderSettingsFormRow(obj, index) {
    return (
      <View
        key={index}
        style={styles.settingsFormRowContainer}
      >
        <View style={styles.settingsFormRowCell}>
          <Text style={[styles.settingFormRowLabel, {
              color: getTheme(this.state.config.themeType).secondaryTextColor
              }]}
          >
            {obj.label}
          </Text>
        </View>
        <View style={styles.settingsFormRowCell}>
          <View style={styles.settingsFormRowTypesContainer}>
            { this.renderSettingsRowTypes(obj) }
          </View>
        </View>
      </View>
    );
  }
  renderSettingsForm() {
    const themeTypeObj = this.state.settings[this.state.settings.length - 1].types[0];
    return (
      <ScrollView>
        <View style={styles.settingsFormInnerContainer}>
          { this.state.settings.map(this.renderSettingsFormRow.bind(this)) }
          { this.renderColorPaletteSelector(themeTypeObj) }
        </View>
      </ScrollView>
    );
  }
  renderHeader() {
    return (
      <View style={styles.displaySettingsHeader}>
        <View style={styles.resetButtonContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => { this.onReset(); }}
          >
            <Text style={[styles.resetButtonText, {
              color: getTheme(this.state.config.themeType).primaryButtons
              }]}
            >
              Reset
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.closeButtonContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => { this.onClose(); }}
          >
            <Text style={[styles.closeButtonText, {
                color: getTheme(this.state.config.themeType).primaryButtons
              }]}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  render() {
    return (
      <View>
        { this.renderHeader() }
        { this.renderSettingsForm() }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  displaySettingsHeader: {
    flexDirection: 'row'
  },
  resetButtonContainer: {
    alignItems: 'flex-start',
    flex: 1
  },
  resetButton: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 50,
    paddingBottom: 10
  },
  resetButtonText: {
    fontWeight: 'bold'
  },
  closeButtonContainer: {
    alignItems: 'flex-end'
  },
  closeButton: {
    paddingTop: 10,
    paddingLeft: 50,
    paddingRight: 10,
    paddingBottom: 10
  },
  closeButtonText: {
    fontWeight: 'bold'
  },
  settingsFormInnerContainer: {
    flexDirection: 'column',
    marginBottom: 100
  },
  settingsFormRowContainer: {
    flexDirection: 'row'
  },
  settingsFormRowCell: {
    flex: 1
  },
  settingFormRowLabel: {
    fontSize: 20,
    paddingLeft: 10,
    paddingTop: 7,
    paddingBottom: 9
  },
  settingsRowTypeContainer: {
    flexDirection: 'row'
  },
  settingsFormRowTypesContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 5,
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 10
  },
  settingsRowTypes: {
    flex: 1,
    flexDirection: 'row'
  },
  switch: {
    marginRight: 10,
    marginLeft: 4
  },
  plusMinusContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  minusButton: {
    borderWidth: 1.5,
    paddingLeft: Platform.OS === 'android' ? 7 : 4,
    paddingRight: Platform.OS === 'android' ? 5 : 4,
    paddingBottom: Platform.OS === 'android' ? 1 : 3,
    borderRadius: 5,
    fontSize: 18,
    marginLeft: 10
  },
  plusButton: {
    borderWidth: 1.5,
    paddingLeft: Platform.OS === 'android' ? 6 : 4,
    paddingRight: Platform.OS === 'android' ? 2 : 4,
    paddingBottom: Platform.OS === 'android' ? 1 : 3,
    borderRadius: 5,
    fontSize: 18
  },
  colorPaletteSelectorContainer: {
    paddingTop: 5,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'red'
  },
  colorPaletteCellContainer: {
    flex: 1,
    marginBottom: 15,
    borderWidth: 1.5,
    borderRadius: 5,
    flexDirection: 'row'
  },
  colorPaletteCellText: {
    fontSize: 10
  }
});

DisplaySettings.propTypes = {
  config: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewConfig: PropTypes.func.isRequired
};
