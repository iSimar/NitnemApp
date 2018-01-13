import themes from './assets/themes.json';
import initalConfig from './assets/inital-config.json';

function getTheme(themeName) {
  const themeObj = themes[themeName];
  if (themeObj) {
    return themeObj;
  }
  return themes[initalConfig.themeType];
}

module.exports.getTheme = getTheme;
