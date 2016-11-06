function typeCrop(titles, svgSource) {
    /*
        TODO:
        1. Load the font for Calibre type. Needs to be the webfont.
    */
    'use strict';

    /* Create a Array-like Node List of all the elements */
    var allTitles = document.querySelectorAll(titles);

    /* A reference to the SVG document containing the alphabet, first invocation === 'null' */
    var typeCropSVG = document.getElementById('typeCropSVG');

    /* Convert from node list to array */
    var words = [].slice.call(allTitles);

    /* Set up RegEx pattern to match first and last letters */
    var regEx = /\b^([a-zA-Z])|([a-zA-Z])$\b/gm;

    /* Set default for SVG filepath */
    svgSource = (svgSource === undefined) ? 'src/js/typeCrop.svg' : svgSource;

    /* Use a Promise for better control of aysnc methods */
    function httpRequest(method, url) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({ status: this.status, statusText: xhr.statusText });
                }
            };
            xhr.onerror = function() {
                reject({ status: this.status, statusText: xhr.statusText });
            };
            xhr.send();
        });
    }

    /*
        normalized(): All Callback that returns first & letter capitalized, the rest is lower-case
        @param {String} all - all original match string
        @param {String} g1 - capturing group 1
        @param {String} g2 - capturing group 2
        @param {Number} matchIndex - index where match is found
    */
    function normalized(all, g1, g2, matchIndex) {
        var firstLetter, lastLetter;
        if (matchIndex === 0) {
            firstLetter = g1.toUpperCase();
        }
        lastLetter = g2;
        return [firstLetter, lastLetter].join('');
    }

    /*
        loadSVG():
        SVG file is loaded and returned as a type 'String.'
        Therefore, we are creating a DOMParser instance to
        parse the SVG string into the DOM as nodes.
        @param {Object} data - The data returned from a Promise
    */
    var loadSVG = function(data) {
        return new DOMParser().parseFromString(data, 'image/svg+xml');
    };

    /*
        getAttributes():
        @param {Object} svgs - The returned SVG Document Node
    */
    var getAttributes = function(svgs) {

        /* Creates a copy of SVG to add to document */
        var importedSVG = document.importNode(svgs.documentElement, true);

        /* If typeCropSVG is already in the document */
        if (typeCropSVG === null) {
            /* Append SVG */
            document.body.appendChild(importedSVG);
        }

        /* Get first && last letter */
        var firstLast = words.map(function(word) {
            var caseConvert = word.innerHTML
                .toLowerCase()
                .replace(regEx, normalized);

            return caseConvert.match(regEx);
        });

        /* Flatten nested arrays utils */
        var flatten = function(arr) {
            return [].concat.apply([], arr);
        };

        /* Flatten the letters array */
        var letters = flatten(firstLast);

        return letters.map(function(el) {

            // Check if el is not a number in order to select from the group ID
            var group = isNaN(el) ? svgs.querySelector('g#' + el) : null;
            return (group !== null) ? group.attributes : undefined;
        });
    };

    var makeLetterSet = function(attributes) {

        return attributes.map(function(vb) {
            for (var v in vb) {
                if (vb[v].nodeName === 'viewBox') {
                    return {
                        letter: vb.id.value,
                        viewBox: vb[v].value
                    };
                }
            }
        });
    };

    var createCatalog = function(letterSet) {

        return letterSet
            .map(function(attr, i) {
                var log = {};
                if (attr !== undefined) {
                    var styles = 'position: absolute; top: 0; left: 0; bottom: 0; width: 100%; height: 100%';
                    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + attr.viewBox + '" style="' + styles + '">';
                    svg += '<use xlink:href="#' + attr.letter + '"></use>';
                    svg += '</svg>';
                    log[attr.letter] = svg;
                }
                return log;
            })
            .reduce(function(svgCatalog, letter) {
                for (var paths in letter) {
                    svgCatalog[paths] = letter[paths];
                }

                return svgCatalog;
            }, []);
    };

    /* addSVGRoot() - Wrapps the first and last letter with span elements */

    var addSVGRoot = function(svgCatalog) {

        var title = words.map(function(word) {

            var spanElement = '<span data-char="$1$2">$1$2</span>';
            var replaceWith = word.innerHTML
                .toLowerCase()
                .replace(regEx, normalized)
                .replace(regEx, spanElement);

            return {
                replaceWith: replaceWith,
                original: word
            };
        })
        .map(function(title) {
            title.original.innerHTML = title.replaceWith;
            return title;
        })
        .map(function(val) {

            var original = val.original;

            /* Set the text to BOLD typeface and uppercase */
            original.style.fontFamily = 'Calibre-Bold';
            original.style.textTransform = 'uppercase';
            original.style.fontWeight = 'normal';
            return original;
        });
        /*
            Return the original element, and the
            SVG that will be appended in it's place
        */
        return {
            original: title,
            catalog: svgCatalog
        };
    };

    /* Finally add the SVG elements */
    var replaceWithSVG = function(svg) {

        /* Loop the original HTML Elements that will get replaced */
        svg.original.forEach(function(title) {

            var spans = [].slice.call(title.querySelectorAll('span'));

            spans.forEach(function(span) {

                /* Get the color of the text to copy over to the SVG */
                var parent = span.parentNode;
                var color = getComputedStyle(parent, null).getPropertyValue('color');

                /* Replace the span placeholder with SVG elements */
                span.innerHTML = svg.catalog[span.innerHTML] + span.textContent;

                /* Set the placeholder transparent */
                span.style.cssText = 'position: relative; color: transparent; background: none;';

                /* Apply the copied color to the SVG element */
                [].slice.call(span.children).map(function(val) {
                    val.style.fill = color;
                });

            });
        });

        window.catalog = svg;
    };

    /* Make request and get the SVG files */

    return httpRequest('GET', svgSource)
        .then(loadSVG)
        .then(getAttributes)
        .then(makeLetterSet)
        .then(createCatalog)
        .then(addSVGRoot)
        .then(replaceWithSVG);

}
function letra(element) {

    let letra = [].slice.call(document.querySelectorAll(element));

    const words = letra
        .map(val => val.innerHTML)
        .join(' ')
        .split(' ');

    console.log(words)

    const letters = words.map(word => word.split(''));

    const eachLetter = letters
        .map(word => {
            return word.reduce((all, letter, i) => {
                let span = document.createElement('span');
                span.style.display = 'inline-block';
                span.setAttribute('data-char', letter);
                span.innerHTML = letter;
                all.push(span);
                return all;
            }, []);
        });

    const eachWord = eachLetter.map((spans, i) => {
        let div = document.createElement('div');
        div.style.display = 'inline-block';
        div.classList.add('word');
        spans.map(span => div.innerHTML += span.outerHTML);
        return div;
    });

    const appendWords = function() {
        letra.forEach(function(p, i) {
            p.innerHTML = '';
            eachWord.forEach(function(v, i) {
                p.innerHTML += v.outerHTML + ' ';
            })
        });
    }();
}

letra('.assmaster')