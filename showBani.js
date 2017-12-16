import React, { Component } from 'react';
import { TouchableWithoutFeedback, TouchableOpacity, StyleSheet, StatusBar, FlatList, Text, View, Dimensions} from 'react-native';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";

import themes from './assets/themes.json';

const THEME = 'night';

const ViewTypes = {
    LARGE: 0,
    MEDIUM: 1,
    SMALL: 2
};
export default class ShowBani extends Component {

    constructor(props) {
        super(props);

        if(this.props.bani.name === "japji sahib"){
            this.bani = require('./assets/banis/japjisahib.json');
        } else if(this.props.bani.name === "jaap sahib"){
            this.bani = require('./assets/banis/jaapsahib.json');
        } else if(this.props.bani.name === "tav parsaad savaye"){
            this.bani = require('./assets/banis/tavparsaadsavaye.json');
        } else if(this.props.bani.name === "chaupai sahib"){
            this.bani = require('./assets/banis/chaupaisahib.json');
        } else if(this.props.bani.name === "anand sahib"){
            this.bani = require('./assets/banis/anandsahib.json');
        } else if(this.props.bani.name === "ardaas"){
            this.bani = require('./assets/banis/ardaas.json');
        } else if(this.props.bani.name === "rehras sahib"){
            this.bani = require('./assets/banis/rehrassahib.json');
        } else if(this.props.bani.name === "kirtan sohila"){
            this.bani = require('./assets/banis/kirtansohila.json');
        }

        let { width } = Dimensions.get("window");


        let dataProvider = new DataProvider((r1, r2) => {
            return r1 !== r2;
        });
        this.state = {
            showOptions: false,
            autoScrolling: false,
            autoScrollSpeed: 1,
            dataProvider: dataProvider.cloneWithRows(this.bani)
        };
        this._layoutProvider = new LayoutProvider(
            index => {
                if(this.bani[index]['gurmukhi'].length >= 72 || this.bani[index]['translation'].length >= 157) {
                    return ViewTypes.LARGE;
                } else if(this.bani[index]['gurmukhi'].length >= 34 || this.bani[index]['translation'].length >= 83) {
                    return ViewTypes.MEDIUM;
                } else {
                    return ViewTypes.SMALL;
                }
                
            },
            (type, dim) => {
                switch (type) {
                    case ViewTypes.SMALL:
                        dim.width = width;
                        dim.height = 120;
                        break;
                    case ViewTypes.MEDIUM:
                        dim.width = width;
                        dim.height = 180;
                        break;
                    case ViewTypes.LARGE:
                        dim.width = width;
                        dim.height = 250;
                        break;
                    default:
                        dim.width = 0;
                        dim.height = 0;
                }
        });
        this._rowRenderer = this._rowRenderer.bind(this);
    }
    _rowRenderer(type, data, index) {
        return(
            <View>
            <View style={[styles.baniRow, { paddingBottom: this.bani.length-1 === index ? 60 : 15 }]}>
                <Text style={styles.baniText}>{data['gurmukhi']}</Text>
                <Text style={styles.baniTranslation}>{data['translation_english']}</Text>
            </View>
            {
                this.props.bani.next_index &&  this.props.bani.next_name_gurmukhi && this.bani.length-1 === index ? 
                <View style={styles.nextBaniContainer}>
                    <TouchableOpacity  style={styles.nextBaniTouchable} onPress={() => { this.props.onNext(this.props.bani.next_index) }}>
                        <Text style={[styles.baniText, {color: themes[THEME].buttons, paddingRight: 10, fontSize: 33}]}>
                            {this.props.bani.next_name_gurmukhi}
                        </Text>
                        <Ionicons name="md-arrow-forward" size={38} color={themes[THEME].buttons} />
                    </TouchableOpacity>
                </View> : null
            }
            </View>
        );
    }
    componentDidMount(){
    }
    startScrolling(startingAt = 0){
        function scrollTo(offset = 0) {
            if (this.refs.list && this.state.autoScrolling) {
                console.log(this.state.autoScrollSpeed);
                console.log(offset);
                this.refs.list.scrollToOffset(0, offset, true);
                setTimeout(() => {scrollTo.bind(this)(offset+7+this.state.autoScrollSpeed)}, 150-((this.state.autoScrollSpeed-1)*10));
            }
        }
        this.setState({
            autoScrolling: true
        }, () => { scrollTo.bind(this)(startingAt); });
    }
    render() {
        return (
            <View style={styles.container}>
            <StatusBar barStyle="light-content"/>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerLeft} onPress={this.props.onBack}> 
                    <Ionicons name="md-arrow-back" size={38} color={themes[THEME].buttons} />
                </TouchableOpacity>
                {
                    !this.state.autoScrolling ?
                    <TouchableOpacity style={styles.headerRight} onPress={()=>{this.setState({showOptions: !this.state.showOptions})}}>
                        <Entypo name="dots-three-vertical" size={30} color={themes[THEME].buttons} />
                    </TouchableOpacity> : <View style={styles.headerRight} ></View>
                }
                {
                    this.state.autoScrolling ?
                    <View style={styles.inActionRow}>
                        <TouchableOpacity style={styles.inActionButton} 
                                          disabled={this.state.autoScrolling >= 2}
                                          onPress={()=>{this.setState({autoScrollSpeed: this.state.autoScrollSpeed-0.5})}}>
                            <MaterialIcons name="fast-rewind" size={30} color={themes[THEME].buttons} />
                            <Text style={styles.inActionButtonText}>Slower</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.inActionButton} 
                                          disabled={this.state.autoScrolling <= 0}
                                          onPress={()=>{this.setState({autoScrollSpeed: this.state.autoScrollSpeed+0.5})}}>
                            <Text style={styles.inActionButtonText}>Faster</Text>
                            <MaterialIcons name="fast-forward" size={30} color={themes[THEME].buttons} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.inActionButton} onPress={()=>{this.setState({autoScrolling: false, showOptions: false})}}>
                            <MaterialIcons name="stop" size={30} color={themes[THEME].buttons} />
                            <Text style={styles.inActionButtonText}>Stop</Text>
                        </TouchableOpacity>
                    </View>
                    : null
                }
            </View>
            {
                this.state.showOptions &&
                !this.state.autoScrolling ?
                <View style={styles.options}>
                    {/* <TouchableOpacity style={styles.optionButton} onPress={() => {this.startScrolling();}}> 
                        <MaterialIcons name="playlist-play" size={30} color={themes[THEME].buttons} />
                        <Text style={styles.optionButtonText}>Auto Scroll</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity style={styles.optionButton}> 
                        <MaterialIcons name="settings" size={30} color={themes[THEME].buttons} />
                        <Text style={styles.optionButtonText}>Display Settings</Text>
                    </TouchableOpacity>
                </View> : null
            }
            <TouchableWithoutFeedback onPressIn={()=>{this.setState({showOptions: false})}}>
            {/* <RecyclerListView ref="list" 
                              layoutProvider={this._layoutProvider} 
                              dataProvider={this.state.dataProvider} 
                              rowRenderer={this._rowRenderer} /> */}
            <FlatList style={styles.baniList}
                    data={this.bani}
                    ref={(ref) => { this.baniList = ref; }}
                    keyExtractor={(item, index) => index}
                    removeClippedSubviews={true}
                    renderItem={({item, index}) => { return this._rowRenderer(null, item, index) }} />
            </TouchableWithoutFeedback>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themes[THEME].background,
      paddingTop: 15
    },
    header: {
        flexDirection: 'row',
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
        paddingTop: 20,
    },
    options: {
        justifyContent: 'center',
        flexDirection: 'column'
    },
    optionButton: {
        flexDirection: 'row',
        paddingRight: 20,
        paddingTop: 10,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    optionButtonText: {
        paddingLeft: 10,
        color: themes[THEME].buttons,
        fontSize: 20
    },
    baniList: {
      flex: 1,
      backgroundColor: themes[THEME].background,
      paddingTop: 5,
      marginTop: 10
    },
    baniRow: {
      padding: 15,
      justifyContent: 'center',
      flex: 1
    },
    baniText: {
      fontFamily: 'gurakhar',
      color: themes[THEME].bani,
      fontSize: 25
    },
    baniTranslation: {
      color: themes[THEME].translation,
      fontSize: 20
    },
    inActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        justifyContent: 'center'
    },
    inActionButtonText: { 
        paddingLeft: 2,
        paddingRight: 2,
        color: themes[THEME].buttons,
        fontSize: 20,
    },
    inActionRow: {
        flexDirection: 'row',
        paddingTop: 20,
        paddingRight: 20,
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