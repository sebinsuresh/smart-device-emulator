/* 
  Some helper objects or functions useful for illustrations.
*/

/**
 * TAU: 2*Pi, This constant is used in Zdog's illustrations.
 * @type {number}
 * */
export const TAU = Zdog.TAU;

/**
 * Convert a given hex color string to rgba colors. Optionally pass in an alpha
 * value to the resultant color.
 * @param {string} hex The hex string representing the color to convert to rgba
 * @param {string|number} alpha The alpha value between 0 and 1
 * @returns {string}
 */
export const hexToRgba = function (hex, alpha = "1.0") {
  hex = hex.trim().replace("#", "");
  const red = parseInt(hex.substr(0, 2), 16);
  const green = parseInt(hex.substr(2, 2), 16);
  const blue = parseInt(hex.substr(4, 2), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

/** Various colors used by the illustrations. */
export const colors = {
  blue0: "#0C1220",
  blue1: "#273348",
  blue2: "#405566",
  blue3: "#81B3B9",
  yellow: "#DFCF82",
  strongRed: "#CD2F10",
  bulbYellow: "#E0CB23",
  offWhite: "#F8F9E8",
  darkBlue: "#082B5C",
  lightBlue: "#8BA6BB",
  green: "#1B998B",
  greenDark: "#157A6E",
  dark: "#333745",
  dark2: "#454B5E",
  yellowPi: "#ECC05B",
  grayDark: "#ABB4C4",
  gray: "#CED3DC",
  grayLight: "#FBFFFE",
  red: "#E94F37",
  redLight: "#F99D8A",
  redLight2: "#F7A1BB",
  bulbBaseColor: "#868D87",
  baseBottomColor: "#333232",
  bulbColor: hexToRgba("#8BA6BB", 0.4),
  bulbOnColor: hexToRgba("#8BA6BB", 0.4),
  bulbHighlightColor: "#F8F9E8",
  filamentOffColor: "#A87356",
  filamentOnColor: "#F8F9E8",
  innerGlowColor: hexToRgba("#F8F9E8", 0.3),
  outerGlowColor: hexToRgba("#E0CB23", 0.3),
  rayColor: hexToRgba("#E0CB23", 0.3),
};
