import { eot, woff } from './base64Fonts'
const fontFamily = 'Calibre-Bold'

export default function fontFace() {
    var fontFace = '';
    fontFace += '@font-face {';
    fontFace += 'font-family: ' + fontFamily + ';';
    fontFace += `src: url("data:font/opentype; base64, ${ eot }") format("embedded-opentype");`;
    fontFace += `src: url("data:application/x-font-woff; base64, ${ woff }") format("woff");`;
    fontFace += '}';
    return fontFace;
};