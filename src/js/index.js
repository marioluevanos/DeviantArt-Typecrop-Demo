/* globals typeCrop: true */

function TypeTest() {

    /* Event Buttons */
    this.input = document.querySelector('#input');
    this.enterButton = document.querySelector('#enter');
    this.saveButton = document.querySelector('#save');

    /* Render Target */
    this.target = document.querySelector('.test-target');
    this.targetClass = this.target.className;
    this.testArea = document.querySelector('.test-area');

    /* Canvas Element */
    this.canvas = document.querySelector('#canvas');
    this.context = this.canvas.getContext('2d');

    /* Events */
    this.enterButton.addEventListener('click', this.renderSVG.bind(this), false);
    this.saveButton.addEventListener('click', this.renderCanvas.bind(this), false);
    this.input.addEventListener('focus', this.clearInput.bind(this), false);
    // this.canvas.addEventListener('click', this.savePNG.bind(this), false);

    return this;
}

TypeTest.prototype = {
    createAlphabetClass: function(className) {
        var alphabet = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
            'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
            'w', 'x', 'y', 'z'
        ];
        /* Create test alphabet */
        var letter = alphabet.map(function(letter) {
            var box = document.createElement('div');
            var title = document.createElement('h2');
            title.classList.add(className.replace(/[.]/g, ''));
            title.innerHTML = letter.toUpperCase() + '' + letter;
            box.appendChild(title);
            return box;
        });
        return {
            /* Append test alphabet */
            to: function(id) {
                letter.forEach(function(box) {
                    var target = document.querySelector(id);
                    if (target) {
                        target.appendChild(box);
                    } else {
                        return;
                    }
                });
                typeCrop(className);
            }
        };
    },
    update: function() {
        this.target.innerHTML = this.input.value;
        this.target.style.opacity = 1;
    },
    moveButton: function() {
        this.saveButton.classList.add('show');
    },
    clearInput: function() {
        this.saveButton.classList.remove('show');
        this.canvas.style.display = 'none';
        this.input.value = '';
    },
    savePNG: function() {

    },
    renderSVG: function() {
        this.target.style.opacity = 1;
        this.record = this.target.outerHTML;
        this.update();
        this.moveButton();
        typeCrop('.' + this.targetClass);
    },
    renderCanvas: function() {

        /* Copy the the SVG alphabet paths as a 'String' */
        var alphabet = document.querySelector('#typeCropSVG').innerHTML.replace(/[^\S]{2,}/gm, ' ');

        /* Get dimesions of the originally rendered SVG to copy it's size for the Canvas */
        var canvasWidth = this.target.clientWidth;
        var canvasHeight = this.target.clientHeight;

        var styles, data;

        /* Render the SVG in order to copy the markup over to the Canvas element */
        this.renderSVG();

        this.canvas.style.display = 'block';
        this.target.classList.remove('show');

        this.canvas.setAttribute('width', canvasWidth);
        this.canvas.setAttribute('height', canvasHeight);
        this.testArea.style.width = canvasWidth + 'px';
        this.testArea.style.width = canvasWidth + 'px';

        styles = '<style>';
        styles += '<![CDATA[';

        /* TITLE CSS */
        styles += 'h3 {';
        styles += 'font-family: "Calibre-Bold", Calibre, Calibre, Sans-serif;';
        styles += 'font-size: 120px;';
        styles += 'font-weight: bold;';
        styles += 'line-height: 0.8; !important';
        styles += 'margin: 0;';
        styles += 'text-transform: uppercase;';
        styles += 'color: #05CC47;';
        styles += 'position: relative;';
        styles += 'top: 25px;';
        styles += '}';
        styles += 'h3 span {';
        styles += 'color: transparent;';
        styles += 'position: relative; }';

        /* SVG CSS */
        styles += 'h3 span svg {';
        styles += 'top: 0;';
        styles += 'transform: translate(0, -24%);';
        styles += 'left: 0;';
        styles += 'position: absolute;';
        styles += 'width: 100%;';
        styles += 'height: auto;';
        styles += 'fill: #05CC47 !important;}';
        styles += ']]>';
        styles += '</style>';

        /* SVG MARKUP CSS */
        data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + canvasWidth + '" height="' + canvasHeight + '">';
        data += styles;
        data += '<foreignObject width="' + canvasWidth + '" height="' + canvasHeight + '">';
        data += '<div style="line-height: 0;" xmlns="http://www.w3.org/1999/xhtml">';
        data += this.record;
        data += '</div></foreignObject>';
        data += alphabet + '</svg>';

        var DOMURL = window.URL || window.webkitURL || window;
        var img = new Image();
        var svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });

        var url = DOMURL.createObjectURL(svg);

        img.onload = function () {
          this.context.drawImage(img, 0, 0);
          DOMURL.revokeObjectURL(url);
        }.bind(this);

        img.src = url;
    }
};

/*
    Initialize
    -------------------------------------------------------------
*/

document.addEventListener('DOMContentLoaded', function() {
    /* Test instance */
    return new TypeTest()
        .createAlphabetClass('.da-title')
        .to('#alphabet');
});

window.addEventListener('load', function() {

    document.body.classList.add('loaded');

});