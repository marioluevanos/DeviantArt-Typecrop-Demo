/* globals typeCrop: true */

function TypeTest() {

	/* Event Buttons */
	this.input = document.querySelector('#input');
	this.enterButton = document.querySelector('#enter');
	this.downloadButton = document.querySelector('#download');

	/* Render Target */
	this.targetClass = '.test-target';
	this.target = document.querySelector(this.targetClass);
	this.testArea = document.querySelector('.test-area');

	/* Canvas Element */
	this.canvas = document.querySelector('#canvas');
	this.context = this.canvas.getContext('2d');

	/* Events */
	this.enterButton.addEventListener('click', this.renderSVG.bind(this), false);
	this.downloadButton.addEventListener('click', this.renderCanvas.bind(this), false);
	this.input.addEventListener('focus', this.resetInput.bind(this), false);
	this.input.addEventListener('click', this.resetInput.bind(this), false);

	this.bindTextInputs();

	if (!this.ifWebKit()) {
		this.downloadButton.style.display = 'none';
	}

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
	ifWebKit: function() {
		return /Chrome|Safari/g.test(window.navigator.userAgent);
	},
	bindTextInputs: function() {

		var bindClasses = ['input-val'];
		var self = this;

		var bindEvents = function(classNames) {

			classNames.forEach(function(className) {

				var elements = [].slice.call(
					document.getElementsByClassName(className)
				);

				var get = function(type, element, i) {
					return (element.nodeName.toLowerCase() === type) && element;
				};

				var inputs = elements.filter(get.bind(null, 'input'));
				var targets = elements.filter(get.bind(null, 'h3'));

				inputs.forEach(function(input) {
					input.onkeyup = function(e) {
						self.resetInput();
						targets.forEach(function(target) {
							target.innerHTML = this.value;
						}.bind(this));
					}
				});
			});
		};

		bindEvents(bindClasses);
	},
	resetInput: function() {
		this.canvas.style.display = 'none';
		this.testArea.style.minHeight = '';
		this.disable(this.enterButton, false);
	},
	renderSVG: function() {
		this.target.innerHTML = this.input.value;
		return typeCrop(this.targetClass);
	},
	renderCanvas: function() {

		var self = this;
		var renderSVG = self.renderSVG();

		/* Copy the the SVG alphabet paths as a 'String' */
		var getPaths = function() {
			return document
				.querySelector('#typeCropSVG')
				.innerHTML
				/* Delete white-space */
				.replace(/[^\S]{2,}/gm, ' ');
		};

		/* Get dimesions of the originally rendered SVG to copy it's size for the Canvas */
		var canvasAttr = function(paths) {
			return {
				width: self.target.clientWidth,
				height: self.target.clientHeight,
				paths: paths
			};
		};

		var setCanvasSize = function(attrs) {

			self.canvas.style.display = 'block';
			self.canvas.setAttribute('width', attrs.width);
			self.canvas.setAttribute('height', attrs.height);
			self.testArea.style.minHeight = attrs.height + 'px';
			return attrs;
		};

		var canvasStyles = function(attrs) {

			var css = {
				'h3': {
					'font-family': 'Calibre-Bold, Sans-serif',
					'font-size': '120px',
					'font-weight': 'normal',
					'line-height': '0.8',
					'text-transform': 'uppercase',
					'color': '#05CC47',
					'position': 'relative',
					'top': '25px'
				},
				'h3 span': {
					'color': 'transparent',
					'position': 'relative'
				},
				'h3 span svg': {
					'top': '0',
					'left': '0',
					'transform': 'translate(0, -24%)',
					'position': 'absolute',
					'width': '100%',
					'height': '140px !important',
					'fill': '#05CC47 !important'
				}
			};

			var newCSS = Object.keys(css).map(function(selector) {
				return Object.keys(css[selector]).reduce(function(all, item, i) {
					all += selector + ' { ' + item + ': ' + css[selector][item] + '; } '
					return all;
				}, '');
			}).join();

			attrs.styles = '<style> <![CDATA[' + newCSS + ']]> </style>';

			return attrs;
		};

		/* SVG MARKUP CSS */
		var canvasMarkup = function(attrs) {
			var data = '';
			data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + attrs.width + '" height="' + attrs.height + '">';
			data += attrs.styles;
			data += '<foreignObject width="' + attrs.width + '" height="' + attrs.height + '">';
			data += '<div xmlns="http://www.w3.org/1999/xhtml">';
			data += self.target.outerHTML;
			data += '</div></foreignObject>';
			data += attrs.paths;
			data += '</svg>';
			attrs.data = data;
			return attrs;
		};

		var drawCanvas = function(attrs) {

			var domUrl = window.URL || window.webkitURL || window;
			var canvasImage = new Image();

			var SVG = new Blob([attrs.data], {
				type: 'image/svg+xml;charset=utf-8'
			});

			var url = domUrl.createObjectURL(SVG);

			canvasImage.onload = function() {
				self.context.drawImage(canvasImage, 0, 0);
				this.setAttribute('crossOrigin', 'anonymous');
				domUrl.revokeObjectURL(url);
			};

			canvasImage.src = url;

			self.blob = SVG;
		};

		var downloadPNG = function() {

			var tempCanvas = document.createElement('canvas');
			var tempContext = tempCanvas.getContext('2d');

			var blobToDataURL = function(blob, callback) {
				var fr = new FileReader();
				fr.onload = function(e) {
					callback(e.target.result);
				};
				fr.readAsDataURL(blob);
			};

			blobToDataURL(self.blob, function(dataURL) {
    			self.downloadButton.href = dataURL;
    			self.downloadButton.download = this.input.value.toLowerCase().replace(/[ ]/g,'-') + '.svg';
			});

			function drawInlineSVG(ctx, rawSVG, callback) {

				var svg = new Blob([rawSVG], {
						type: "image/svg+xml;charset=utf-8"
					}),
					domURL = self.URL || self.webkitURL || self,
					url = domURL.createObjectURL(svg),
					img = new Image;

				img.onload = function() {
					ctx.drawImage(this, 0, 0);
					domURL.revokeObjectURL(url);
					callback(this);
				};

				img.src = url;
			}

			// usage:
			drawInlineSVG(tempContext, svgText, function() {
				console.log(canvas.toDataURL()); // -> PNG data-uri
			});

		};

		renderSVG
			.then(getPaths)
			.then(canvasAttr)
			.then(setCanvasSize)
			.then(canvasStyles)
			.then(canvasMarkup)
			.then(drawCanvas)
			.then(downloadPNG);

		/* Disable the crop button */
		this.disable(this.enterButton, true);

	},
	disable: function(element, bool) {
		element.disabled = bool;
		if (bool) {
			element.style.backgroundColor = '#181A1B';
			element.style.borderColor = '#242626';
			element.style.color = '#4F5254';
			element.style.cursor = 'not-allowed';
		} else {
			element.style.backgroundColor = '#05CC47';
			element.style.borderColor = '#05CC47';
			element.style.color = 'black';
			element.style.cursor = 'pointer';
		}
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