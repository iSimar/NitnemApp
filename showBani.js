import React, { Component } from 'react';
import { Switch, TouchableWithoutFeedback, TouchableOpacity, StyleSheet, StatusBar, FlatList, Text, View, Dimensions, ScrollView} from 'react-native';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Constants, Audio } from 'expo';

import themes from './assets/themes.json';

const THEME = 'night';

const { width, height } = Dimensions.get('window');
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

        this.backupBani = this.bani;

        this.state = {
            audioPaused: false,
            loadingAudio: false,
            audioPlaying: false,
            showOptions: false,
            showDisplaySettings: false,
            gurmukhiFontSize: 25,
            showEnglish: true,
            englishFontSize: 19,
            showPunjabi: false,
            punjabiFontSize: 19
        };
        this._rowRenderer = this._rowRenderer.bind(this);
    }
    groupStanzas(cb) {
        let rows = [];
        let tmp_section_id = -1;
        let obj = null;
        for (let i = 0; i < this.bani.length; i++){
            if (this.bani[i].section_id === tmp_section_id) {
                obj.gurmukhi = obj.gurmukhi + " " + this.bani[i].gurmukhi;
                obj.vishraam = obj.vishraam + " " + this.bani[i].vishraam;
                obj.translation_english = obj.translation_english + " " + this.bani[i].translation_english;
                obj.translation_punjabi = obj.translation_punjabi + " " + this.bani[i].translation_punjabi;
                obj.section_name_english = this.bani[i].section_name_english;
                obj.section_name_gurmukhi = this.bani[i].section_name_gurmukhi;

                if (i === this.bani.length-1) {
                    if (obj != null) {
                        rows.push(obj);
                        obj = null;
                    }
                    this.bani = rows;
                    cb();
                }
            } else {
                if (obj != null) {
                    rows.push(obj);
                    obj = null;
                }
                if (!this.bani[i].section_id) {
                    rows.push(this.bani[i]);
                } else {
                    if (obj == null){
                        obj = {};
                        tmp_section_id = this.bani[i].section_id;
                        obj.gurmukhi = this.bani[i].gurmukhi;
                        obj.vishraam = this.bani[i].vishraam;
                        obj.translation_english = this.bani[i].translation_english;
                        obj.translation_punjabi = this.bani[i].translation_punjabi;
                        obj.section_name_english = this.bani[i].section_name_english;
                        obj.section_name_gurmukhi = this.bani[i].section_name_gurmukhi;

                        if (i === this.bani.length-1) {
                            if (obj != null) {
                                rows.push(obj);
                                obj = null;
                            }
                            this.bani = rows;
                            cb();
                        }
                    }
                }
            }
            
        }
    }
    ungroupStanzas(cb){
        this.bani = this.backupBani;
        cb();
    }
    _rowRenderer(type, data, index) {
        return(
            <View>
            <View style={[styles.baniRow, { paddingBottom: this.bani.length-1 === index ? 60 : (!this.state.showEnglish && !this.state.showPunjabi ? 0 : 15) }]}>
                <Text style={[styles.baniText, { textAlign: this.state.centerAlignment ? 'center' : 'left', fontSize: this.state.gurmukhiFontSize }]}>{data['gurmukhi']}</Text>
                { 
                    this.state.showEnglish && data['translation_english'] !== "" ?
                    <Text style={[styles.baniTranslation, { textAlign: this.state.centerAlignment ? 'center' : 'left', fontSize: this.state.englishFontSize }]}>
                        {data['translation_english']}
                    </Text> : null
                }
                {
                    this.state.showPunjabi && data['translation_punjabi'] !== " " ?
                    <Text style={[styles.baniTranslation, { textAlign: this.state.centerAlignment ? 'center' : 'left', fontSize: this.state.punjabiFontSize }]}>
                        {data['translation_punjabi']}
                    </Text> : null
                }
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
    renderPlusMinusButton(field) {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => { 
                    const obj = {}; 
                    obj[field] = this.state[field] < 35 ? this.state[field] + 1 : 35; 
                    this.setState(obj); 
                }}>
                <Text style={styles.plusButton}> + </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { 
                    const obj = {}; 
                    if (field == 'englishFontSize' || field == 'punjabiFontSize') {
                        obj[field] = this.state[field] > 14 ? this.state[field] - 1 : 14; 
                    } else {
                        obj[field] = this.state[field] > 19 ? this.state[field] - 1 : 19; 
                    }
                    this.setState(obj); 
                }}>
                <Text style={styles.minusButton}> - </Text>
                </TouchableOpacity>
            </View>
        );
    }
    renderDisplaySettings(){
        return(
            <View style={styles.displaySettingsContainer}>
                <View style={styles.displaySettingsHeader}>
                    <View style={styles.resetButtonContainer}>
                        <TouchableOpacity style={styles.resetButton} onPress={() => {
                            this.ungroupStanzas( () => {
                                this.setState({gurmukhiFontSize: 25,
                                                showEnglish: true,
                                                englishFontSize: 19,
                                                showPunjabi: false,
                                                punjabiFontSize: 19,
                                                groupStanzas: false,
                                                centerAlignment: false});
                                }
                            );
                            }}>
                            <Text style={styles.resetButtonText} >Reset</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.closeButtonContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => {this.setState({showDisplaySettings: false})}}>
                            <Text style={styles.closeButtonText} >Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView>
                    <View style={{ flexDirection: 'row', paddingBottom: 50 }}>
                        <View style={{ flex: 1}}>
                            <View style={{ flexDirection: 'row'}}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.settingLabel}>Gurmukhi Font Size</Text>
                                </View>
                                <View style={{flex: 1}}>
                                    <View style={styles.settingsRow}>
                                        { this.renderPlusMinusButton('gurmukhiFontSize') }
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row'}}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.settingLabel}>English Translation</Text>
                                </View>
                                <View style={{flex: 1}}>
                                    <View style={styles.settingsRow}>
                                        <Switch style={styles.switch} 
                                                value={this.state.showEnglish}
                                                onValueChange={(val) => { this.setState({showEnglish: val}); }} />
                                        { this.state.showEnglish ? this.renderPlusMinusButton('englishFontSize') : null }
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row'}}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.settingLabel}>Punjabi Translation</Text>
                                </View>
                                <View style={{flex: 1}}>
                                    <View style={styles.settingsRow}>
                                        <Switch style={styles.switch}
                                                value={this.state.showPunjabi}
                                                onValueChange={(val) => { this.setState({showPunjabi: val}); }} />
                                        { this.state.showPunjabi ? this.renderPlusMinusButton('punjabiFontSize') : null }
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row'}}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.settingLabel}>Group Stanzas</Text>
                                </View>
                                <View style={{flex: 1}}>
                                    <View style={styles.settingsRow}>
                                        <Switch style={styles.switch}
                                                value={this.state.groupStanzas}
                                                onValueChange={(val) => { 
                                                    val ? 
                                                    this.groupStanzas(()=> {this.setState({groupStanzas: val});}) : 
                                                    this.ungroupStanzas(()=> {this.setState({groupStanzas: val});})
                                                }} />
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row'}}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.settingLabel}>Center Alignment</Text>
                                </View>
                                <View style={{flex: 1}}>
                                    <View style={styles.settingsRow}>
                                        <Switch style={styles.switch}
                                                value={this.state.centerAlignment}
                                                onValueChange={(val) => { this.setState({centerAlignment: val}); }} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
    async playAudio(){
        this.setState({
            loadingAudio: true
        }, async () => {
            await Audio.setIsEnabledAsync(true);
            this.sound = new Audio.Sound();
            await this.sound.loadAsync({
            uri: this.props.bani.audio
            });
            await this.sound.playAsync();
            await this.sound.setOnPlaybackStatusUpdate((obj) => {
                if (this.state.loadingAudio && obj.isLoaded && obj.isPlaying) {
                    this.setState({
                        loadingAudio: false,
                        audioPlaying: true
                    });
                }
            });
        });
    }
    async componentWillUnmount() {
        if  (this.sound) {
            await this.sound.unloadAsync();
            await this.sound.stopAsync();
        }
    }
    async resumeAudio() {
        if  (this.sound) {
            this.setState({
                audioPaused: false
            }, async () => {
                await this.sound.playAsync();
            });
        }
    }
    async pauseAudio() {
        if  (this.sound) {
            this.setState({
                audioPaused: true
            }, async () => {
                await this.sound.pauseAsync();
            });
        }
    }
    async stopAudio() {
        if  (this.sound) {
            this.setState({
                audioPaused: false,
                loadingAudio: false,
                audioPlaying: false
            }, async () => {
                await this.sound.stopAsync();
            });
        }
    }
    render() {
        return (
            <View style={styles.container}>
            <StatusBar barStyle="light-content"/>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerLeft} onPress={this.props.onBack}> 
                    <Ionicons name="md-arrow-back" size={38} color={themes[THEME].buttons} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerRight} onPress={()=>{this.setState({showOptions: !this.state.showOptions})}}>
                    <Entypo name="dots-three-vertical" size={30} color={themes[THEME].buttons} />
                </TouchableOpacity>
            </View>
            <TouchableWithoutFeedback onPressIn={()=>{this.setState({showOptions: false})}}>
            <FlatList style={styles.baniList}
                    data={this.bani}
                    extraData={this.state}
                    ref={(ref) => { this.baniList = ref; }}
                    keyExtractor={(item, index) => index}
                    removeClippedSubviews={true}
                    renderItem={({item, index}) => { return this._rowRenderer(null, item, index) }} />
            </TouchableWithoutFeedback>
            { this.state.showDisplaySettings ? this.renderDisplaySettings() : null }
            {
                this.state.showOptions ?
                <View style={styles.options}>
                    {
                        this.state.audioPlaying ? 
                        (
                            <View>
                                {
                                    this.state.audioPaused ? 
                                    <TouchableOpacity style={styles.optionButton} onPress={() => { this.resumeAudio(); }}> 
                                        <MaterialIcons name="play-arrow" size={30} color={themes[THEME].buttons} />
                                        <Text style={styles.optionButtonText}>Resume Audio</Text>
                                    </TouchableOpacity> : 
                                    <TouchableOpacity style={styles.optionButton} onPress={() => { this.pauseAudio(); }}> 
                                        <MaterialIcons name="pause" size={30} color={themes[THEME].buttons} />
                                        <Text style={styles.optionButtonText}>Pause Audio</Text>
                                    </TouchableOpacity> 
                                }
                                
                                <TouchableOpacity style={styles.optionButton} onPress={() => { this.stopAudio(); }}> 
                                    <MaterialIcons name="stop" size={30} color={themes[THEME].buttons} />
                                    <Text style={styles.optionButtonText}>Stop Audio</Text>
                                </TouchableOpacity>
                            </View>
                        ): null
                    }
                    { 
                        this.props.bani.audio && !this.state.audioPlaying ? 
                        (
                            this.state.loadingAudio ? 
                            <View style={styles.optionButton}>
                                <Text style={styles.optionButtonText}>Loading Audio...</Text>
                            </View>:
                            <TouchableOpacity style={styles.optionButton} onPress={() => { this.playAudio(); }}> 
                                <MaterialIcons name="play-arrow" size={30} color={themes[THEME].buttons} />
                                <Text style={styles.optionButtonText}>Play Audio</Text>
                            </TouchableOpacity> 
                        ): null
                    }
                    <TouchableOpacity style={styles.optionButton} onPress={()=>{this.setState({showOptions: false, showDisplaySettings: true})}}> 
                        <MaterialIcons name="settings" size={30} color={themes[THEME].buttons} />
                        <Text style={styles.optionButtonText}>Display Settings</Text>
                    </TouchableOpacity>
                </View> : null
            }
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
        paddingTop: 20,
    },
    options: {
        justifyContent: 'center',
        flexDirection: 'column',
        position: 'absolute',
        backgroundColor: themes[THEME].lighterBackground,
        top: 77,
        right: 0,
        width: width,
        paddingBottom: 10
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
      color: themes[THEME].bani
    },
    baniTranslation: {
      color: themes[THEME].translation
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
    },
    displaySettingsContainer: {
        backgroundColor: themes[THEME].lighterBackground,
        position: 'absolute',
        bottom: 0,
        width: width,
        height: 0.35*height
    },
    settingLabel: {
        fontSize: 20,
        paddingLeft: 10,
        paddingTop: 7,
        paddingBottom: 9,
        color: themes[THEME].translation
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 5,
        paddingTop: 5,
        paddingLeft: 10,
        paddingRight: 10
    },
    switch: {
        marginRight: 10,
        marginLeft: 4
    },
    displaySettingsHeader:{
        flexDirection: 'row',
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
        color: themes[THEME].settingButtons,
        fontWeight: 'bold'
    },
    closeButtonContainer: {
        alignItems: 'flex-end',
    },
    closeButton: {
        paddingTop: 10,
        paddingLeft: 50,
        paddingRight: 10,
        paddingBottom: 10
    },
    closeButtonText: {
        color: themes[THEME].settingButtons,
        fontWeight: 'bold'
    },
    minusButton: { 
        borderWidth: 1.5 , 
        paddingLeft: 5, 
        paddingRight: 5,
        paddingBottom: 3, 
        borderRadius: 5, 
        fontSize: 18,
        marginLeft: 10,
        borderColor: themes[THEME].settingButtons,
        color: themes[THEME].settingButtons
    },
    plusButton: { 
        borderWidth: 1.5 , 
        paddingLeft: 4, 
        paddingRight: 4,
        paddingBottom: 3,
        borderRadius: 5, 
        fontSize: 18,
        borderColor: themes[THEME].settingButtons,
        color: themes[THEME].settingButtons
    }
  });