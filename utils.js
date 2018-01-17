import { Analytics, Event, PageHit } from 'expo-analytics';
import themes from './assets/themes.json';
import initalConfig from './assets/inital-config.json';

function getTheme(themeName) {
  const themeObj = themes[themeName];
  if (themeObj) {
    return themeObj;
  }
  return themes[initalConfig.themeType];
}

let analytics = null;

function setGoogleAnalyticsId(id) {
  analytics = new Analytics(id);
}

function setGoogleAnalyticsScreen(screenName = null) {
  // console.log(screenName);
  analytics.hit(new PageHit(screenName));
}

function reportGoogleAnalyticsEvent(eventCategory, eventName, label = null, value = null) {
  if (label && value) {
    // console.log(`${eventCategory}, ${eventName}, ${label}, ${value}`);
    analytics.event(new Event(eventCategory, eventName, label, value));
  } else {
    // console.log(`${eventCategory}, ${eventName}`);
    analytics.event(new Event(eventCategory, eventName));
  }
}

module.exports.getTheme = getTheme;
module.exports.setGoogleAnalyticsId = setGoogleAnalyticsId;
module.exports.setGoogleAnalyticsScreen = setGoogleAnalyticsScreen;
module.exports.reportGoogleAnalyticsEvent = reportGoogleAnalyticsEvent;
