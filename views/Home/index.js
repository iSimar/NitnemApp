
// Imports
import React, { Component } from 'react';

import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  BackHandler
} from 'react-native';

import PropTypes from 'prop-types';

import Bani from '../Bani';

import banisMetadata from '../../assets/banis-metadata.json';

import { getTheme, setGoogleAnalyticsScreen, reportGoogleAnalyticsEvent } from '../../utils';

import NativeTalk from "nativetalk";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: this.props.config,
      selectedBani: null
    };
  }

  async componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });
  }

  componentDidMount() {
    setGoogleAnalyticsScreen('Home');
  }

  async componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return false;
    });
  }

  render() {
    if (this.state.selectedBani) {
      return (
        <Bani
          config={this.state.config}
          bani={this.state.selectedBani}
          onNewConfig={config => this.setState({ config })}
          onBack={() => {
            this.setState({ selectedBani: null });
            reportGoogleAnalyticsEvent('Bani', 'Back Pressed');
          }}
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
	  <NativeTalk greeting={'ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ॥\nਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਹ॥\n\nFeedback is much welcome. If you find a mistake please report it here.\n\nThank you for using NitnemApp.'}>
		<View style={styles.container}>
			<StatusBar barStyle={getTheme(this.state.config.themeType).isLight ? 'dark-content' : 'light-content'} />
			<FlatList
			style={[
				styles.banisList,
				{
				backgroundColor: getTheme(this.state.config.themeType).primaryBackgroundColor
				}
			]}
			data={banisMetadata}
			keyExtractor={(item, index) => index}
			renderItem={({ item, index }) => (
				<TouchableOpacity onPress={() => {
					this.setState({ selectedBani: item });
					reportGoogleAnalyticsEvent('Home', 'Bani Pressed');
				}}
				>
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
						color: getTheme(this.state.config.themeType).primaryTextColor
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
	  </NativeTalk>
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
