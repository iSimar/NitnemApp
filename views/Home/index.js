
// Imports
import React, { Component } from 'react';

import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity
} from 'react-native';

import PropTypes from 'prop-types';

import Bani from '../Bani';

import banisMetadata from '../../assets/banis-metadata.json';

import themes from '../../assets/themes.json';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: this.props.config,
      selectedBani: null
    };
  }

  render() {
    if (this.state.selectedBani) {
      return (
        <Bani
          config={this.state.config}
          bani={this.state.selectedBani}
          onNewConfig={config => this.setState({ config })}
          onBack={() => this.setState({ selectedBani: null })}
          onNext={index =>
            // first clear the selectedBani state variable
            this.setState({
              selectedBani: null
            }, () => {
              // then set the new selectedBani state variable
              this.setState({
                selectedBani: banisMetadata[index]
              });
            })}
        />
      );
    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <FlatList
          style={[
            styles.banisList,
            {
              backgroundColor: themes[this.state.config.themeType].primaryBackgroundColor
            }
          ]}
          data={banisMetadata}
          keyExtractor={(item, index) => index}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => { this.setState({ selectedBani: item }); }}>
              <View style={[
                  styles.baniRow,
                  {
                    paddingBottom: index === banisMetadata.length - 1 ? 80 : 15
                  }
                ]}
              >
                <Text style={[
                    styles.baniNameText,
                    {
                      color: themes[this.state.config.themeType].primaryTextColor
                    }
                  ]}
                >
                  {item.name_gurmukhi}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  banisList: {
    flex: 1,
    paddingTop: 40
  },
  baniRow: {
    padding: 20,
    paddingTop: 15
  },
  baniNameText: {
    fontFamily: 'gurakhar',
    fontSize: 35
  }
});

Home.propTypes = {
  config: PropTypes.object.isRequired
};