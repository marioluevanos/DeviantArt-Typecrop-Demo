import typeCrop from 'deviantart-typecrop'
import fontFace from './fontFace'

export default function TypeTest() {
    
    this.input = document.querySelector('#input');
    this.enterButton = document.querySelector('#enter');
    this.downloadButton = document.querySelector('#download');

    this.inputFontSize = document.querySelector('#font-size');
    this.inputFontSizeVal = document.querySelector('#font-size-val');

    this.inputFontWidth = document.querySelector('#font-width');
    this.inputFontWidthVal = document.querySelector('#font-width-val');

    this.inputFontColor = document.querySelector('#font-color');
    this.inputFontColorVal = document.querySelector('#font-color-val');

    /* Render Target */
    this.targetClass = '.test-target';
    this.target = document.querySelector(this.targetClass);
    this.testArea = document.querySelector('.test-area');

    /* Canvas Element */
    this.canvas = document.querySelector('#canvas');
    this.context = this.canvas.getContext('2d');

    /* Initialize Events */
    this.enterButton.addEventListener('click', this.renderSVG.bind(this), false);
    this.downloadButton.addEventListener('click', this.renderCanvas.bind(this), false);
    this.input.addEventListener('focus', this.resetInput.bind(this), false);
    this.input.addEventListener('click', this.resetInput.bind(this), false);

    /* Font Input Events */
    this.inputFontSize.addEventListener('input', this.resize.bind(this), false);
    this.inputFontWidth.addEventListener('input', this.resize.bind(this), false);

    this.inputFontColor.addEventListener('input', this.resize.bind(this), false);

    this.inputFontWidth.addEventListener('mousedown', this.toggleSizeMarker.bind(this), false);
    this.inputFontWidth.addEventListener('mouseup', this.toggleSizeMarker.bind(this), false);

    this.bindInput({ sharedClass: 'input-val', outputHTMLElement: 'h3' });
    this.reizeInit();

    /* Disable for Firefox */
    if (!this.ifWebKit()) {
        this.downloadButton.style.display = 'none';
    }

    this.createAlphabet()
    .setAttr('class', 'da-title')
    .appendAlphabetTo('#alphabet')
    .typeCrop('.da-title');

    return this;
}

TypeTest.prototype = {
    createAlphabet: function() {
        var alphabet = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
            'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
            'w', 'x', 'y', 'z'
        ];
        /* Create test alphabet */
        var letter = alphabet.map(function(letter) {
            var box = document.createElement('div');
            var title = document.createElement('h2');
            title.innerHTML = letter.toUpperCase() + '' + letter;
            box.appendChild(title);
            return box;
        });

        return {
            setAttr: function(name, prop) {
                letter.forEach(function(div) {
                    [].slice.call(div.children).map(function(title) {
                        title.setAttribute(name, prop);
                    });
                });
                return this;
            },
            /* Append test alphabet */
            appendAlphabetTo: function(id) {
                letter.forEach(function(box) {
                    var target = document.querySelector(id);
                    if (target) {
                        target.appendChild(box);
                    } else {
                        return;
                    }
                });
                return this;
            },
            typeCrop: function(className) {
                typeCrop(className);
                return this;
            }
        };
    },
    ifWebKit: function() {
        return /Chrome/g.test(window.navigator.userAgent);
    },
    toggleSizeMarker: function() {
        this.testArea.children[0].classList.toggle('active');
    },
    reizeInit: function() {
            this.renderSVG();
        var init = this.resize();
            init.resizeFont();
            init.resizeWidth();
            init.selectColor();
    },
    resize: function(event) {

        var get = this.getFont();
        var target = this.target;

        var selectColor = () => {
            var color = get.color();
            var svgs = this.targetSVG();

            /* Color change target */
            target.style.color = color;

            /* Color change SVG Elements */
            svgs.forEach(function(svg) {
                svg.style.fill = color;
            });
        };

        var resizeFont = () => {
            var size = get.size();
            var retinaDownSize = Math.trunc(parseInt(size.replace(/px/g, '')) / 2) + 'px'

            /* Resize the font */
            target.parentElement.style.fontSize = size;

            /* Update the UI counter and move with the slider */
            this.inputFontSizeVal.innerHTML = retinaDownSize;

            moveLabel(size, this.inputFontSize, this.inputFontSizeVal);
        };

        var moveLabel = (size, input, label) => {
            var min = input.min;
            var max = input.max;
            var value = parseFloat( size.replace(/px/g, '') ) /2;
            var difference = max - min;
            var valDiff = max - value;

            /* Calc the transalte X position */
            var xPosition = function() {
                var x = (valDiff/difference * 100) - 100;
                return (x - -50) + '%';
            };

            /* Calc the left position */
            var leftPosition = function() {
                var inPercent = ( ( (valDiff/difference) * 100) - 100) / -100;
                var total = inPercent * 100 + '%';
                return  'calc(' + total + ' - 30px)';
            };

            /* Apply positions */
            label.style.left = leftPosition();
            label.style.transform = 'translate(' + xPosition() + ', -50%)';
        };

        var resizeWidth = () => {
            var width = get.width();
            
            var retinaDownSize = (parseInt(width.replace(/%/g, '')) / 2) + '%'

            target.parentElement.style.width = width;
            this.inputFontWidthVal.innerHTML = retinaDownSize;
            moveLabel(width, this.inputFontWidth, this.inputFontWidthVal);
        };

        if (event !== undefined) {
            var     isFontSize      = event.target.id === 'font-size';
            var     isFontWidth     = event.target.id === 'font-width';
            var     isFontColor     = event.target.id === 'font-color';
            if      (isFontSize)    { resizeFont(); }
            else if (isFontWidth)   { resizeWidth(); }
            else if (isFontColor)   { selectColor(); }
            else                    { return; }
        }
        else {
            return {
                resizeFont: resizeFont,
                resizeWidth: resizeWidth,
                selectColor: selectColor
            };
        }
        this.resetInput();
    },
    getFont: function() {
        var size = this.inputFontSize;
        var width = this.inputFontWidth;
        var color = this.inputFontColor;
        return {
            size: function() {
                return parseFloat(size.value) + 'px';
            },
            width: function() {
                return (parseFloat(width.value) * 2) + '%';
            },
            color: function() {
                return color.value;
            }
        };
    },
    bindInput: function(options) {

        var self = this;

        /* Convert Nodes to Arrays */
        var elements = function(className) {
            return [].slice.call(
                document.getElementsByClassName(className)
            );
        };

        /* Get the inputs  */
        var get = function(type, element) {
            return (element.nodeName.toLowerCase() === type) && element;
        };

        /* Filter, get the input and output targets */
        var inputs = elements([options.sharedClass]).filter(get.bind(null, 'input'));
        var targets = elements([options.sharedClass]).filter(get.bind(null, options.outputHTMLElement));

        var updateTargets = function() {
            /* Update the target  */
            targets.forEach(function(target) {
                target.innerHTML = this.value;
            }.bind(this));
            self.resetInput();
        };

        /* Event Handler  */
        inputs.forEach(function(input) {
            input.onkeyup = updateTargets;
        });

    },
    disable: function(bool) {
        /* Disable the enter button */
        this.enterButton.disabled = bool;
        this.enterButton.classList.toggle('disabled', bool);
        return bool;
    },
    resetInput: function() {
        this.disable(false);
    },
    renderSVG: function() {

        /* Disable more rendering, until text input is focused again */
        this.disable(true);

        /* Select white-space at the begining and end */
        var trailingWhiteSpace = /^[^\w]+|[^\w]+$/g;

        /* Remove white-space ends */
        
        this.target.innerHTML = this.input.value.replace(trailingWhiteSpace, '');
        
        return typeCrop(this.targetClass);
    },
    targetSVG: function() {

        var get = function(element) {
            return [].slice.call(element);
        };
        /*
            Get the SVG children from the spans,
            and reduce the two arrays into one
        */
        var wordDIV = get(this.target.children);

        /* Get first and last DIVs */
        var targetDIVs = wordDIV.filter(function(div, index) {
            return (index === 0 || index === wordDIV.length - 1) && div;
        });

        var spans = targetDIVs.map(function(div, divI) {
            return get(div.children).filter(function(span, spanI) {
                var first = divI === 0 && spanI === 0;
                var last = divI === targetDIVs.length - 1 && spanI === div.children.length - 1;
                if (first || last) {
                    return span;
                }
            });
        })
        .filter(function(span) {
            return (span.length !== 0) && span;
        })
        .reduce(function(a, b) {
            return a.concat(b);
        }, []);

        var svgs = spans.map(function(span) {
            return get(span.children);
        })
        .reduce(function(a, b) {
            return a.concat(b);
        }, []);

        return svgs;

    },
    renderCanvas: function() {

        /* Copy the the SVG alphabet paths as a 'String' */
        var getDefs = (svgDocId) => {
            return document
                .querySelector(svgDocId)
                .innerHTML

                /* Delete white-space */
                .replace(/[^\S]{2,}/gm, ' ');
        };

        /* Get dimesions of the DOM SVG to copy it-over to SVG CSS for the Canvas */
        var canvasAttr = (defs) => {
            /*
                Get the SVG height from the HTML DOM,
                on only needs one of the two, since they
                should be the same
            */
            var svgs = this.targetSVG();
            
            var charHeight = svgs.map(function(svg) {
                return svg.clientHeight;
            })[0];

            /* Return the main object that will be passed along through the promise */
            return {
                charHeight: charHeight,
                width: this.target.clientWidth + (this.target.clientWidth * 0.1),
                height: this.target.clientHeight,
                defs
            };
        };

        var setCanvasSize = (attrs) => {
            this.canvas.setAttribute('width', attrs.width);
            this.canvas.setAttribute('height', attrs.height);
            return attrs;
        };

        var canvasStyles = (attrs) => {
            var css = {
                'h3.sample': {
                    'font-size': this.getFont().size(),
                    'font-weight': 'normal',
                    'line-height': '0.8',
                    'text-transform': 'uppercase',
                    'color': this.getFont().color(),
                    'position': 'relative',
                    'display': 'inline-block',
                    'margin': 0
                },
                'h3.sample span svg': {
                    'top': '0',
                    'left': '0',
                    'position': 'absolute',
                    'width': '100%',
                    'height': attrs.charHeight + 'px !important',
                    'fill': this.getFont().color(),
                }
            };

            var newCSS = Object.keys(css).map((selector) => {
                return Object.keys(css[selector]).reduce((all, item) => {
                    all += selector + ' { ' + item + ': ' + css[selector][item] + '; } ';
                    return all;
                }, '');
            }).join();

            attrs.styles = '<style>';
            attrs.styles += fontFace();
            attrs.styles += newCSS.replace(/,/g, '');
            attrs.styles += '</style>';

            return attrs;
        };
        /*
            Create the SVG with foreignObject tags
            that are required to render in a canvas element
        */
        var svgForCanvas = (attrs) => {
            
            var {defs, styles, width, height} = attrs

            var clone = this.target.cloneNode(true)
            var fragment = new DocumentFragment()
                fragment.appendChild(clone)
            var h3 = fragment.querySelector('h3')
                h3.classList.add('sample')

            var html = fragment.firstChild.outerHTML;

            var data = '';
                data = '<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">';
                data += defs;
                data += '<foreignObject width="' + width + '" height="' + height + '" x="0" y="0">';
                data += '<div xmlns="http://www.w3.org/1999/xhtml">';
                data += styles;
                data += html;
                data += '</div></foreignObject>';
                data += '</svg>';

            /* Add 'data' prop-SVG data to be passed */
            attrs.data = data;
            return attrs;
        };

        var downloadPNG = (attrs) => {

            var canvasPNG = document.createElement('canvas');
            var context = canvasPNG.getContext('2d');

            canvasPNG.width = attrs.width;
            canvasPNG.height = attrs.height;

            var png = document.createElement('img');

            var imgSRC = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(attrs.data)));

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
            };
        };

        return this.renderSVG()
            .then(getDefs.bind(this, '#typecrop-svg'))
            .then(canvasAttr)
            .then(setCanvasSize)
            .then(canvasStyles)
            .then(svgForCanvas)
            .then(downloadPNG)
            .then(this.disable.bind(this, true));
    }
}