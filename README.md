# DeviantArt-Typecrop-Demo

DeviantArt Branded Typography with SVG Replacement

[Demo](https://deviantart-typecrop.web.app/)

[npm-CDN 1.0.7](https://npm-cdn.herokuapp.com/deviantart-typecrop@1.0.7/index.js)

[UNPKG 1.0.7](https://unpkg.com/deviantart-typecrop@1.0.7/index.js)

<img style='pointer-events: none' src='https://raw.githubusercontent.com/marioluevanos/DeviantArt-TypeCrop-Demo/master/preview.jpg'/>
When the style guide was developed, as a CSS designer, it was painful to manually crop the letters of the alphabet. This process was done by our design team over repeatedly. This is a tool I used at DeviantArt to automate that process.  It crops out the first and last letters of a headline and replaces them with the stylized SVG letter.  


This also loads the entire "Calibre-Bold" font-family via @font-face. So the end result of this script is 520kb :(. If the font-face is already being used globally, (like anywhere on deviantart.com's properties, then the script can around 16kb. But there's no plans to do that.

## Usage
### With NPM
```
npm install deviantart-typecrop
```
Then in some .js file
```
import typecrop from 'deviantart-typecrop'

/* Use a CSS selector to apply the stylized crop */
typecrop(".some-class")
```
### With Script Tag
```
<script src='https://unpkg.com/deviantart-typecrop@1.0.7/index.js'></script>
```
Then in a &lt;script/>  tag or .js file
```
/* With script tag, module gets exported as an object on the Window */
const typeCrop = typecrop.default

typeCrop(".some-class")
```
### CSS
Apply your own styles
```
.some-class {
	color: #05CC47;
}
```