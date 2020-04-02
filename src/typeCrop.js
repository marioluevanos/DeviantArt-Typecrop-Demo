import { alphabetPaths } from './alphabetPaths'
import fontFace from './fontFace'

export default function typeCrop(titles) {
    'use strict';

    var fontFamily = 'Calibre-Bold';
    var svgID = 'typecrop-svg';

    /* Create a Array-like Node List of all the elements */
    var allTitles = document.querySelectorAll(titles);

    /* Convert from node list to array */
    var words = [].slice.call(allTitles);

    var createSVG = function () {

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        var attrs = {
            'id': svgID,
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            'xmlns': 'http://www.w3.org/2000/svg',
            'xml:space': 'preserve',
            'style': 'position: absolute',
            'width': 0,
            'height': 0
        };

        svg.appendChild(defs);

        /* Add the SVG Attrs */
        for(var attr in attrs) {
            svg.setAttribute(attr, attrs[attr]);
        }

        var ifNotViewBox = function (type) {
            if(type !== 'viewBox') {
                return type;
            }
        };

        var createGroups = function () {

            return Object.keys(alphabetPaths).map(function (val, i) {

                var group = '<g id="' + val + '" viewBox="' + alphabetPaths[val].viewBox + '">';

                var pathType = Object
                    .keys(alphabetPaths[val])
                    .filter(ifNotViewBox)
                    .join();

                var vectorData = function () {
                    /* For different attr type */
                    var attrType = pathType === 'path' ? 'd' : 'points';
                    return '<' + pathType + ' ' + attrType + '="' + alphabetPaths[val][pathType] + '" />';
                };

                group += vectorData();
                group += '</g>';

                return group;

            });
        };

        createGroups().forEach(function (val, i) {
            svg.children[0].innerHTML += val;
        });

        return svg;
    };

    /* Use a Promise for better control of aysnc methods */
    var typeCrop = function () {
        return new Promise(function (resolve, reject) {
            resolve(createSVG());
        });
    };

    /* Append the SVG to the DOM */
    var appendSVG = function (svg) {

        /* If typeCropSVG is already in the document */
        if(document.querySelector('#' + svgID) === null) {

            /* Append SVG */
            document.body.appendChild(svg);
        }

        return svg;
    };

    /*
        normalizeFirstLast(): All Callback that returns first & letter capitalized, the rest is lower-case
        @param {String} all - all original match string
        @param {String} g1 - capturing group 1
        @param {String} g2 - capturing group 2
        @param {Number} matchIndex - index where match is found
    */
    var normalizeFirstLast = function (all, g1, g2, matchIndex, original) {

        var firstLetter, lastLetter;
        var lastChar = original.length - 1;

        if(matchIndex === 0) {
            firstLetter = g1.toUpperCase();
        }
        if(matchIndex === lastChar) {
            lastLetter = g2.toLowerCase();
        }
        return [firstLetter, lastLetter].join('');
    };

    var sentenceCase = function (all, g1, matchIndex) {
        var capitalize = ' ' + g1.toUpperCase();
        return capitalize;
    };

    /* Set up RegEx pattern to match first and last letters */
    var captureFirstLast = /\b^([a-zA-Z])|([a-zA-Z])$\b/gm;

    /* Clean out any comments */
    var removeComments = /<!--[\s\S]+?-->/gmi;

    /* Trailing white-space at the begin and end of string */
    var removeTrailingWhiteSpace = /^[^\w]+|[^\w.]*$/gm;

    /* Any double spaces into single space */
    var removeDoubleSpaces = /\s{2,}/g;

    /* For senetence case  */
    var captureEveryFirstLetter = /\s{1,}(\w{0,1})/g;

    var cleanString = function (string) {
        return string
            .toLowerCase()
            .replace(removeComments, '')
            .replace(removeTrailingWhiteSpace, '')
            .replace(removeDoubleSpaces, ' ')
            .replace(captureFirstLast, normalizeFirstLast)
            .replace(captureEveryFirstLetter, sentenceCase);
    };

    /*
        getAttributes():
        @param {Object} svgs - The returned SVG Document Node
    */
    var getAttributes = function (svgs) {

        /* Get first && last letter */
        var firstLast = words.map(function (word) {
            return cleanString(word.innerHTML).match(captureFirstLast);
        });

        /* Flatten nested arrays utils */
        var flatten = function (arr) {
            return [].concat.apply([], arr);
        };

        /* Flatten the letters array and return the group attributes */
        return flatten(firstLast).map(function (el) {

            // Check if el is not a number in order to select from the group ID
            var group = isNaN(el) ? svgs.querySelector('g#' + el) : null;
            return group !== null ? group.attributes : undefined;
        });
    };

    var makeLetterSet = function (attributes) {
        return attributes.map(function (vb) {
            for(var v in vb) {
                if(vb[v].nodeName === 'viewBox') {
                    return {
                        letter: vb.id.value,
                        viewBox: vb[v].value
                    };
                }
            }
        });
    };

    var createCatalog = function (letterSet) {

        return letterSet
            .map(function (attr) {
                var log = {};
                if(attr !== undefined) {
                    var styles = 'position: absolute; top: 0; left: 0; bottom: 0; width: 100%; height: 100%';
                    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + attr.viewBox + '" style="' + styles + '">';
                    svg += '<use xlink:href="#' + attr.letter + '"></use>';
                    svg += '</svg>';
                    log[attr.letter] = svg;
                }
                return log;
            })
            .reduce(function (svgCatalog, letter) {
                if(letter) {
                    for(var paths in letter) {
                        svgCatalog[paths] = letter[paths];
                    }
                    return svgCatalog;
                }
            }, []);
    };

    /* wrapLetters() - Wrap letters with span elements */
    var wrapLetters = function (svgCatalog) {

        var title = words.map(function (word) {

            var letters = cleanString(word.innerHTML)
                .split(' ')
                .map(function (word) {
                    return word

                        /* Clean out the encoded ampersands */
                        .replace(/&amp;/g, '&')
                        .split('');
                });

            var eachLetter = letters
                .map(function (word) {
                    return word.reduce(function (all, letter) {
                        var span = document.createElement('span');
                        span.style.display = 'inline-block';
                        span.setAttribute('data-char', letter);
                        span.innerHTML = letter;
                        all.push(span);
                        return all;
                    }, []);
                });

            var eachWord = eachLetter.map(function (spans) {
                var div = document.createElement('div');
                div.style.display = 'inline-block';
                div.style.whiteSpace = 'nowrap';
                div.classList.add('word');
                spans.map(function (span) {
                    return div.innerHTML += span.outerHTML;
                });
                return div;
            });
            return {
                eachWord: eachWord,
                original: word
            };
        })
            .map(function (title) {

                var htmlString = title.eachWord
                    .map(function (word) {
                        return word.outerHTML;
                    });
                [title.original].forEach(function (p) {
                    p.innerHTML = '';
                    htmlString.forEach(function (v) {
                        p.innerHTML += v + ' ';
                    })
                });
                return title;
            })
            .map(function (val) {
                var original = val.original;

                /* Set the text to BOLD typeface and uppercase */
                original.style.fontFamily = fontFamily;
                original.style.textTransform = 'uppercase';
                original.style.fontWeight = 'normal';
                return original;
            });
        /*
            Return the original element, and the
            SVG that will be appended in it's place
        */
        return {
            title: title,
            catalog: svgCatalog
        };
    };

    /* Finally add the SVG elements */
    var replaceWithSVG = function (svg) {

        /* Loop the original HTML Elements that will get replaced */
        svg.title.forEach(function (title) {

            var spans = [].slice.call(title.querySelectorAll('span'));
            var spanTargets = spans.filter(function (span, index) {

                /* Get the first and last letters to replace */
                return (index === 0 || index === spans.length - 1) && span;
            });

            spanTargets.forEach(function (span) {

                /* Get the color of the text to copy over to the SVG */
                var parent = span.parentNode;
                var color = getComputedStyle(parent, null).getPropertyValue('color');
                var svgElement = svg.catalog[span.innerHTML];
                var transparentLetter = span.textContent;
                var isNotANumber = svgElement !== undefined;


                /* Replace the span placeholder with SVG elements */
                span.innerHTML = isNotANumber ? (svgElement + transparentLetter) : transparentLetter;

                /* Set the placeholder transparent */
                span.style.cssText = isNotANumber ? 'position: relative; color: transparent; background: none;' : '';

                /* Apply the copied color to the SVG element */
                [].slice.call(span.children).map(function (val) {
                    val.style.fill = color;
                });

            });
        });
    };

    var typeCropCss = function () {

        /* Kerning between the letters */
        var kerningMap = {
            a: {
                c: { kern: -0.035 },
                g: { kern: -0.035 },
                s: { kern: -0.010 },
                t: { kern: -0.065 },
                y: { kern: -0.080 },
                u: { kern: -0.025 },
                v: { kern: -0.075 },
                w: { kern: -0.045 }
            },
            b: {
                a: { kern: -0.015 }
            },
            c: {
                a: { kern: -0.025 },
                y: { kern: -0.035 }
            },
            d: {
                a: { kern: -0.035 },
                o: { kern: 0.005 },
                v: { kern: -0.035 },
                y: { kern: -0.050 }
            },
            f: {
                a: { kern: -0.045 }
            },
            g: {
                a: { kern: -0.025 },
                g: { kern: 0.005 },
                o: { kern: 0.005 },
                ',': { kern: -0.015 }
            },
            i: {
                o: { kern: -0.001 }
            },
            j: {
                a: { kern: -0.020 }
            },
            k: {
                o: { kern: -0.035 },
                s: { kern: -0.035 }
            },
            l: {
                y: { kern: -0.085 }
            },
            p: {
                a: { kern: -0.060 },
                t: { kern: -0.010 }
            },
            r: {
                t: { kern: -0.005 },
                v: { kern: -0.015 },
                y: { kern: -0.025 }
            },
            s: {
                a: { kern: -0.015 },
                t: { kern: -0.010 }
            },
            t: {
                a: { kern: -0.065 },
                o: { kern: -0.025 },
                w: { kern: 0.010 },
                y: { kern: 0.010 }
            },
            o: {
                t: { kern: -0.015 },
                v: { kern: -0.035 },
                w: { kern: -0.020 },
                y: { kern: -0.050 }
            },
            v: {
                a: { kern: -0.075 },
                o: { kern: -0.035 }
            },
            w: {
                a: { kern: -0.045 },
                o: { kern: -0.035 }
            },
            y: {
                '-': { kern: -0.075 },
                '—': { kern: -0.075 },
                '–': { kern: -0.075 },
                a: { kern: -0.080 },
                o: { kern: -0.050 },
                s: { kern: -0.035 },
                t: { kern: 0.010 }
            },
            '9': {
                '.': { kern: -0.025 }
            },
            '’': {
                a: { kern: -0.085 }
            },
            '-': {
                t: { kern: -0.075 }
            },
            '–': {
                t: { kern: -0.075 }
            },
            '—': {
                t: { kern: -0.075 }
            }
        };

        var kernRules = function (KM, i, parent) {
            return Object.keys(parent).map(function (letter) {
                var selector = Object.keys(KM)[i];

                /* Kerning with margins */
                var value = '{ margin-left: ' + parent[letter].kern + 'em }';

                /* Data attr selector */
                var data = function (s) {

                    return '[data-char="' + s + '"]';
                };

                return data(selector.toUpperCase()) + '+' + data(letter) + value + data(selector) + '+' + data(letter) + value;
            });
        };

        var kernList = Object.keys(kerningMap)
            .map(function (parent, i) {
                return kernRules(kerningMap, i, kerningMap[parent]);
            })
            .reduce(function (a, b) {
                return a.concat(b);
            });

        var createStyleSheet = function (styles) {
            var style = document.createElement('style');
            style.setAttribute('id', 'typecrop-css');
            style.innerHTML += styles.join().replace(/\,/g, '');

            /*
                loadWebFont();
                Add webfont CSS, if it's not loaded
                via webfont, then the alignment will break
                with desktop version of Calibre
            */
            style.innerHTML += fontFace();
            return style;
        };

        var styleElement = createStyleSheet(kernList);

        document.head.appendChild(styleElement);
    };

    var typeCropErr = function (err) {
        console.warn('Opps! Something wrong with typeCrop(): ' + err);
    };

    if(!document.getElementById('typecrop-css')) {
        typeCropCss();
    }

    /* Make request and get the SVG files */
    return typeCrop()
        .then(appendSVG)
        .then(getAttributes)
        .then(makeLetterSet)
        .then(createCatalog)
        .then(wrapLetters)
        .then(replaceWithSVG)
        .catch(typeCropErr);
    
}