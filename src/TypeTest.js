const typeCrop = typecrop.default
const $ = selector => document.querySelector(selector)

export default function TypeTest() {
    this.input = $('#input');
    this.enterButton = $('#enter');
    this.downloadButton = $('#download');

    this.inputFontSize = $('#font-size');
    this.inputFontSizeVal = $('#font-size-val');

    this.inputFontWidth = $('#font-width');
    this.inputFontWidthVal = $('#font-width-val');

    this.inputFontColor = $('#font-color');
    this.inputFontColorVal = $('#font-color-val');

    this.testMakerWidth = $('#test-marker-width');

    /* Render Target */
    this.targetClass = '.test-target';
    this.target = $(this.targetClass);

    this.init();

    /* Disable for Firefox */
    if (!ifWebKit()) {
        this.downloadButton.style.display = 'none';
    }
}

TypeTest.prototype = {
    init () {
        this.addEvents();
        this.renderSVG();
        this.resizeFont();
        this.resizeWidth();
        this.selectColor();
    },
    addEvents() {
        /* Initialize Events */
        this.enterButton.addEventListener('click', () => this.renderSVG());
        this.downloadButton.addEventListener('click', this.renderCanvas.bind(this));
        this.input.addEventListener('focus', this.resetInput.bind(this), false);
        this.input.addEventListener('click', this.resetInput.bind(this), false);

        /* Font Input Events */
        this.inputFontSize.addEventListener('input', this.onInput.bind(this));
        this.inputFontWidth.addEventListener('input', this.onInput.bind(this));
        this.inputFontColor.addEventListener('input', this.onInput.bind(this));

        this.inputFontWidth.addEventListener('mousedown', this.toggleSizeMarker.bind(this));
        this.inputFontWidth.addEventListener('mouseup', this.toggleSizeMarker.bind(this));

        this.inputFontSize.addEventListener('mousedown', this.toggleSizeMarker.bind(this));
        this.inputFontSize.addEventListener('mouseup', this.toggleSizeMarker.bind(this));

        this.bindInputEvents({ sharedClass: 'input-val', outputHTMLElement: 'h3' });
    },
    toggleSizeMarker(event) {
        if (event.target.id === 'font-width') {
            this.testMakerWidth.classList.toggle('active', event.type === 'mousedown')
        }

        const valueDisplay = event.target.nextElementSibling
        if(valueDisplay) valueDisplay.classList.toggle('active')
    },
    selectColor() {
        const color = this.getFontColor();
        /* Color change target */
        this.target.style.color = color;

        /* Color change SVG Elements */
        this.targetSVG().forEach(svg => svg.style.fill = color);
        // console.log('%c selecting color...', `color: ${color}`);
        this.inputFontColorVal.innerHTML = color
    },
    resizeWidth() {
        const width = this.getFontWidth();
        this.target.parentElement.style.width = width;
        this.inputFontWidthVal.innerHTML = width;
        this.moveLabel(width, this.inputFontWidth, this.inputFontWidthVal);
    },
    resizeFont() {
        const size = this.getFontSize();
        
        /* Resize the font */
        this.target.parentElement.style.fontSize = size;

        /* Update the UI counter and move with the slider */
        this.inputFontSizeVal.innerHTML = size;

        this.moveLabel(size, this.inputFontSize, this.inputFontSizeVal);
    },
    moveLabel(size, input, infoTip) {
        const value = parseFloat(size.replace(/px/g, ''));
        const p = (value / 100);
        const min = parseInt(input.min);
        const max = parseInt(input.max);
        const progress = invlerp(min, max, p * 100);

        /* Calc the transalte X position */
        const xPosition = () => {
            const w = input.clientWidth * progress;
            return w + 'px';
        };

        /* Calc the left position */
        const leftPosition = () => {
            const w = infoTip.clientWidth;            
            const total = lerp(0, -w, progress);
            return `${ total }px`;
        };

        /* Apply positions */
        infoTip.style.left = leftPosition();
        infoTip.style.transform = 'translate(' + xPosition() + ', -50%)';
    },
    onInput(event) {
        if (!event) return
        
        const { id } = event.target
        const isFontSize = id === 'font-size';
        const isFontWidth = id === 'font-width';
        const isFontColor = id === 'font-color';
        
        if (isFontSize) this.resizeFont(event);
        else if (isFontWidth) this.resizeWidth(event);
        else if (isFontColor) this.selectColor();
    },
    getFontSize() {
        return parseFloat(this.inputFontSize.value) + 'px';
    },
    getFontWidth() {
        return (parseFloat(this.inputFontWidth.value)) + '%';
    },
    getFontColor() {
        return this.inputFontColor.value;
    },
    bindInputEvents(options) {
        /* Convert Nodes to Arrays */
        const elements = (className) => Array.from(document.getElementsByClassName(className));

        /* Get the inputs  */
        const get = (type, element) => (element.nodeName.toLowerCase() === type) && element;

        /* Filter, get the input and output targets */
        const inputs = elements([options.sharedClass]).filter(get.bind(null, 'input'));
        const targets = elements([options.sharedClass]).filter(get.bind(null, options.outputHTMLElement));

        const updateTargets = (event) => {
            /* Update the target  */
            targets.forEach((target) => target.innerHTML = event.target.value);
            this.resetInput();
        };

        /* Event Handler  */
        inputs.forEach((input) => input.addEventListener('keyup', updateTargets));
    },
    disable(bool) {
        /* Disable the enter button */
        this.enterButton.disabled = bool;
        this.enterButton.classList.toggle('disabled', bool);
        return bool;
    },
    resetInput() {
        this.disable(false);
    },
    removeWhiteSpace() {
        /* Select white-space at the begining and end */
        var trailingWhiteSpace = /^[^\w]+|[^\w]+$/g;

        /* Remove white-space ends */
        this.target.innerHTML = this.input.value.replace(trailingWhiteSpace, '');
    },
    renderSVG(cb) {
        /* Disable more rendering, until text input is focused again */
        this.disable(true);
        this.removeWhiteSpace();
        typeCrop(this.targetClass);
        setTimeout(() => cb && cb(), 0);
    },
    targetSVG() {
        const words = Array.from(this.target.children);
        const [firstWord]  = words;
        const [lastWord] = words.reverse();
        
        if (!firstWord || !lastWord) return [];
        
        const firstSvg = firstWord.querySelector('svg');
        const lastSvg = lastWord.querySelector('svg');
        
        return [firstSvg, lastSvg];
    },
    /* Copy the the SVG alphabet <defs> paths as a 'String' */
    getDefs() {
        return document
            .querySelector('#typecrop-svg')
            .innerHTML
            /* Delete white-space */
            .replace(/[^\S]{2,}/gm, ' ');
    },
    /* Get dimesions of the DOM SVG to copy it-over to SVG CSS for the Canvas */
    getFontAttributes() {
        /*
            Get the SVG height from the HTML DOM,
            on only needs one of the two, since they
            should be the same
        */
        const charHeight = this.targetSVG().find(svg => svg).clientHeight;
        const attrs = {
            charHeight: charHeight,
            width: this.target.clientWidth + (this.target.clientWidth * 0.1),
            height: this.target.clientHeight,
        };

        /* Return the main object that will be passed along through the promise */
        attrs.styles = this.getCanvasStyles(charHeight);
        attrs.defs = this.getDefs();
        attrs.svg = this.svgForCanvas(attrs);
        return attrs;
    },
    getCanvasStyles (charHeight) {
        var css = {
            'h3.sample': {
                'font-size': this.getFontSize(),
                'font-weight': 'normal',
                'line-height': '0.8',
                'text-transform': 'uppercase',
                'color': this.getFontColor(),
                'position': 'relative',
                'display': 'inline-block',
                'margin': 0
            },
            'h3.sample span svg': {
                'top': '0',
                'left': '0',
                'position': 'absolute',
                'width': '100%',
                'height': charHeight + 'px !important',
                'fill': this.getFontColor(),
            }
        };

        var newCSS = Object.keys(css).map((selector) => {
            return Object.keys(css[selector]).reduce((all, item) => {
                all += selector + ' { ' + item + ': ' + css[selector][item] + '; } ';
                return all;
            }, '');
        }).join();

        let styles = '<style>';
            styles += typeCrop.fontFace();
            styles += newCSS.replace(/,/g, '');
            styles += '</style>';
        return styles;
    },
    /*
        Create the SVG with foreignObject tags
        that are required to render in a canvas element
    */
    svgForCanvas(attrs = {}) {

        const { defs, styles, width, height } = attrs

        const clone = this.target.cloneNode(true);

        const fragment = new DocumentFragment();
        fragment.appendChild(clone);

        const h3 = fragment.querySelector('h3');
        h3.classList.add('sample');

        const html = fragment.firstChild.outerHTML;

        let svgString = '';
        svgString = '<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">';
        svgString += defs;
        svgString += '<foreignObject width="' + width + '" height="' + height + '" x="0" y="0">';
        svgString += '<div xmlns="http://www.w3.org/1999/xhtml">';
        svgString += styles;
        svgString += html;
        svgString += '</div></foreignObject>';
        svgString += '</svg>';
        return svgString;
    },
    downloadPNG(attrs) {

        var canvasPNG = document.createElement('canvas');
        var context = canvasPNG.getContext('2d');

        canvasPNG.width = attrs.width;
        canvasPNG.height = attrs.height;

        var png = document.createElement('img');

        var imgSRC = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(attrs.svg)));

        png.setAttribute('src', imgSRC);

        png.onload = () => {
            context.drawImage(png, 0, 0);

            /* Get png url form the canvas element */
            var pngFile = canvasPNG.toDataURL('image/png');

            /* Create the Download Link */
            var a = document.createElement('a');

            /* Use the text value for the file name */
            a.download = 'DA-' + this.input.value.toLowerCase().replace(/[ ]/g, '-') + '.png';
            a.href = pngFile;

            a.click();
            this.disable(true);
        };
    },
    renderCanvas() {
        this.renderSVG(() => {
            const attributes = this.getFontAttributes();
            this.downloadPNG(attributes);
        })
    }
}

function ifWebKit() {
    return /Chrome/g.test(window.navigator.userAgent);
}

function lerp (previous, current, ease) {
    return (1 - ease) * previous + ease * current
}

function clamp (a, min = 0, max = 1) {
    return Math.min(max, Math.max(min, a));
}

function invlerp(x, y, a) {
    return clamp((a - x) / (y - x));
}