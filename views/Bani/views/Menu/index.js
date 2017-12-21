import React, { Component } from 'react';

import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import PropTypes from 'prop-types';

import themes from '../../../../assets/themes.json';

export default class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      isLoadingAudio: false,
      isPlayingAudio: false,
      isAudioPaused: false,
      buttons: [
        {
          name: 'play-audio',
          icon: 'play-arrow',
          text: 'Play Audio',
          dontShowStates: ['isPlayingAudio'],
          textChangeOnState: {
            isLoadingAudio: 'Loading...'
          }
        },
        {
          name: 'resume-audio',
          icon: 'play-arrow',
          text: 'Resume Audio',
          showStates: ['isPlayingAudio', 'isAudioPaused']
        },
        {
          name: 'pause-audio',
          icon: 'pause',
          text: 'Pause Audio',
          showStates: ['isPlayingAudio'],
          dontShowStates: ['isAudioPaused']
        },
        {
          name: 'stop-audio',
          icon: 'stop',
          text: 'Stop Audio',
          showStates: ['isPlayingAudio']
        },
        {
          name: 'settings',
          icon: 'settings',
          text: 'Display Settings'
        }
      ]
    };
  }
  onPress(name) {
    if (name === 'play-audio' && !this.state.isLoadingAudio) {
      this.setState({
        isLoadingAudio: true
      });
    } else if (name === 'resume-audio' && this.state.isAudioPaused) {
      this.setState({
        isAudioPaused: false
      });
    } else if (name === 'pause-audio' && !this.state.isAudioPaused) {
      this.setState({
        isAudioPaused: true
      });
    } else if (name === 'stop-audio' && this.state.isPlayingAudio) {
      this.setState({
        isLoadingAudio: false,
        isPlayingAudio: false,
        isAudioPaused: false
      });
    } else if (name === 'settings') {
      // do nothing
    }
    this.props.onPress(name);
  }
  toggleShow() {
    this.setState({ show: !this.state.show });
  }
  hide() {
    this.setState({ show: false });
  }
  renderMenuButton(obj, index) {
    if (obj.showStates && obj.showStates.length > 0) {
      for (let i = 0; i < obj.showStates.length; i++) {
        if (!this.state[obj.showStates[i]]) {
          return null;
        }
      }
    }
    if (obj.dontShowStates && obj.dontShowStates.length > 0) {
      for (let j = 0; j < obj.dontShowStates.length; j++) {
        if (this.state[obj.dontShowStates[j]]) {
          return null;
        }
      }
    }
    let { text } = obj;
    if (obj.textChangeOnState) {
      const states = Object.keys(obj.textChangeOnState);
      for (let k = 0; k < states.length; k++) {
        if (this.state[states[k]]) {
          text = obj.textChangeOnState[states[k]];
        }
      }
    }
    return (
      <TouchableOpacity
        key={index}
        style={styles.buttonContainer}
        onPress={() => { this.onPress(obj.name); }}
      >
        <MaterialIcons
          name={obj.icon}
          size={30}
          color={themes[this.props.config.themeType].primaryButtons}
        />
        <Text style={[styles.buttonText, {
            color: themes[this.props.config.themeType].primaryButtons
          }]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    );
  }
  render() {
    if (!this.state.show) {
      return null;
    }
    return (
      <View style={[styles.container, {
          backgroundColor: themes[this.props.config.themeType].secondaryBackgroundColor
        }]}
      >
        { this.state.buttons.map(this.renderMenuButton.bind(this)) }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  buttonText: {
    paddingLeft: 10,
    fontSize: 20
  }
});


Menu.propTypes = {
  config: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired
};
