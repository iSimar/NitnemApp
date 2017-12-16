import React from 'react';
import { AppLoading } from 'expo';
import { TouchableOpacity, FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';
import ShowBani from './showBani';

import themes from './assets/themes.json';
import banisMetadata from './assets/banis-metadata.json';

const THEME = 'night';
export default class App extends React.Component {
  state = {
    isReady: false,
    selectedBani: null
  };
  async componentDidMount() {
    // await Expo.Audio.Sound.create(
    //   require('./assets/japjisahib.mp3'),
    //   { shouldPlay: true },
    //   playbackStatus => {
    //     console.log(playbackStatus.positionMillis);
    //   }
    // );
  }
  async _loadAssetsAsync() {
    await Expo.Font.loadAsync({
      'gurakhar': require('./assets/fonts/gurakhar.ttf'),
    });
  }
  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._loadAssetsAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      );
    }
    if (this.state.selectedBani) {
    return <ShowBani bani={this.state.selectedBani}
                     onBack={()=> {this.setState({selectedBani: null})}}
                     onNext={(index) => {this.setState({selectedBani: null}, () => {
                      this.setState({selectedBani: banisMetadata[index]});
                     })}}/>;
    }
    return (
      <View style={styles.container}>
      <StatusBar barStyle="light-content"/>
      <FlatList style={styles.banisList}
                data={banisMetadata}
                keyExtractor={(item, index) => index}
                renderItem={({item, index}) => {
                  return(
                    <TouchableOpacity onPress={() => {this.setState({selectedBani: item})}}>
                      <View style={[styles.baniRow, {paddingBottom: index === banisMetadata.length-1 ? 80 : 15}]}>
                        <Text style={styles.baniNameText}>{item['name_gurmukhi']}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banisList: {
    flex: 1,
    backgroundColor: "#fff",
    backgroundColor: themes[THEME].background,
    paddingTop: 40,
  },
  baniRow: {
    padding: 20,
    paddingTop: 15,
  },
  baniNameText: {
    fontFamily: 'gurakhar',
    color: themes[THEME].bani,
    fontSize: 35
  }
});
