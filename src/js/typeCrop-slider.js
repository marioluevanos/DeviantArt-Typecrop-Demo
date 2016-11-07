/* globals typeCrop: true */

function gallerySlider(importedImages) {

	'use strict';

	importedImages = importedImages || [];

	/*
		Root target DIVs
		- - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	//var app  			= document.getElementById('app');
	var gallery 		= document.getElementById('gallery');
	var captions 		= document.getElementById('captions');
	var controls 		= document.getElementById('controls');
	var externalLink 	= document.getElementById('external');

	/*
		Gallery variables
		- - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	var currentIndex 	= 0;
	var externalURLs 	= [];
	var isAnimating 	= false;
	var formattedItems  = importedImages.slice(0);
	var autoPlay 		= null;

	/*
		Initialize and fire it up
		- - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	function init(opt) {
		/* Fire all functions needed */
		[
			buildFigures,
			buildCaptions,
			buildLinks,
			buildCounter
		].forEach(function(fn) {
			formattedItems.forEach(fn);
		});
		if (opt.typeCrop) {
			typeCrop('.title');
		}
		if (opt.autoPlay) {
			autoPlay = setInterval(function() {
				triggerMove();
			}, 5000);
		}
	}

	/*
		Utilities
		- - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	function initialClass(i) {
		return (i === 0) ? 'current' : 'next';
	}

	function transitionEnd() {
		var test = document.createElement('div');
		var transitions = {
			'transition' 		: 'transitionend',
			'OTransition' 		: 'oTransitionEnd',
			'MozTransition' 	: 'transitionend',
			'WebkitTransition' 	: 'webkitTransitionEnd'
		};
		for (var t in transitions) {
			if (test.style[ t ] !== undefined) {
				return transitions[ t ];
			}
		}
	}

	function classList(element) {
		var list = element.classList;
		return {
			toggle	: function(c) { list.toggle(c); return this; },
			add 	: function(c) { list.add   (c); return this; },
			remove 	: function(c) { list.remove(c); return this; }
		};
	}

	/*
		Loop each caption
		- - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	function buildCaptions(item, i) {
		/* Captions container */
		var figureCaption 	= document.createElement('figcaption');
		var title 			= document.createElement('h3');
		var text			= document.createElement('div');
		var artist 			= document.createElement('div');

		classList(figureCaption).add(initialClass(i));
        classList(title).add('title');
		classList(text).add('text');
		classList(artist).add('credit');


		title.innerHTML = item.title;
		artist.innerHTML += '<span>Artwork by</span><span>' + item.artist + '</span>';

		/* Append created image elements to the gallery */
		text.appendChild(title);
		text.innerHTML += '<p>' + item.text + '</p>';
		figureCaption.appendChild(text);
		figureCaption.appendChild(artist);
		captions.appendChild(figureCaption);

	}
	/*
		Loop each image
		- - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	function buildFigures(item, i) {

		/* Figure container and image container */
		var figure = document.createElement('figure');
		var image = document.createElement('div');

		classList(figure).add(initialClass(i));
		classList(image).add('image');

		image.style.backgroundImage = 'url(' + item.background + ')';

		figure.appendChild(image);
		gallery.appendChild(figure);
	}
	/*
		External links
		- - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	function buildLinks(image) {
		/* Add external URLs to the array to access later */
		externalURLs.push(image.link);
		/* Add external link for the first image */
		externalLink.setAttribute('href',  externalURLs[0]);
	}

	/*
		Slider counter for UX purposes
		- - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	function buildCounter(item, i) {

		item = null;

		if (i === 0) {
			/* Image counter */
			var counterE 	 = document.createElement('div');
			var counterTotal = document.createElement('span');
			var counterIndex = document.createElement('span');
			var currentSlide = currentIndex + 1;

			/* And total number of slides */
			counterTotal.innerHTML = (formattedItems.length);
			counterIndex.innerHTML = currentSlide;

			// Add image counter */
			classList(counterE)
				.add('counter');
			classList(counterIndex)
				.add('counter-index');

			counterE
				.appendChild(counterIndex);
			counterE
				.appendChild(counterTotal);
			controls
				.appendChild(counterE);
		}
		else {
			return false;
		}
	}

	/*
		Stylistic option for titles
		- - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	function trackCounterIndex() {
		controls.querySelector('.counter-index').innerHTML = currentIndex + 1;
	}

	/* Set external link for the current image */
	function setExternalLink() {
		externalLink.setAttribute('href', externalURLs[currentIndex]);
	}

	function triggerMove(event) {

		var dirNext, dirPrev, direction;

		if (event) {
			clearInterval(autoPlay);
			/* Use regex to test if clicked has class of next or prev */
			var testNext = /\b(next)\b/g;
			var testPrev = /\b(prev)\b/g;
			dirNext = testNext.test(event.target.className);
			dirPrev = testPrev.test(event.target.className);
		} else {
			dirNext = true;
		}

		if (isAnimating) { return; }

		isAnimating = true;

		if (dirNext) {
			/* If at the end of the array */
			if (currentIndex === formattedItems.length - 1) {
				/* Reset back to first */
				currentIndex = 0;
				direction = 'begin';
			} else {
				currentIndex++;
				direction = 'next';
			}
		}

		if (dirPrev) {
			/* If at the begining of the array going in reverse */
			if (currentIndex === 0) {
				/* Set back to last item in array */
				currentIndex = formattedItems.length - 1;
				direction = 'end';
			} else {
				currentIndex--;
				direction = 'prev';
			}
		}
		/*
			Pass in the gallery items and captions
			to the move() for animating with CSS control
		*/
		move([
			gallery.children,
			captions.children
		], direction);
	}

	function move(items, direction) {

		items.forEach(function(item) {

			var dir
				= (direction === 'next')  ? 'prev'
				: (direction === 'prev')  ? 'next'
				: 'current';

			var index
				= (direction === 'next')  ? (currentIndex - 1)
				: (direction === 'prev')  ? (currentIndex + 1)
				: (direction === 'begin') ? 0
				: (direction === 'end')   ? formattedItems.length - 1
				: 0;

			classList(item[currentIndex])
				.remove(direction)
				.add('current');

			classList(item[index])
				.remove('current')
				.add(dir);

			/* Make slider reset to cycle infinitely */
			if (direction === 'begin' || direction === 'end') {
				[].slice.call(item).forEach(function(val) {
					classList(val)
						.remove(direction === 'begin' ? 'prev' : 'next')
						.add(direction === 'begin' ? 'next' : 'prev')
						.remove('current');
				});
				classList(item[index])
					.remove('next')
					.remove('prev')
					.add('current');
			}

			animationGate(item);

		});

		trackCounterIndex();
		setExternalLink();
	}

	function animationGate(item) {
		var elapsedTime;
		/* Cycle through the elements to check if animation is complete */
		[].slice.call(item).forEach(function(elements) {
			elements.addEventListener(transitionEnd(), function(e) {
				elapsedTime = e.elapsedTime;
				setTimeout(function() {
					/* Change animating flag */
					if (e.elapsedTime < elapsedTime) {
						return;
					}
					else {
						isAnimating = false;
					}
				}, 0);
			});
		});
	}

	controls.addEventListener('click', triggerMove, false);

	return {
		init: init
	};

};
