export default function gallerySlider (importedImages = [], opt = {}) {
    /*
        Root target DIVs
        - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
    const gallery = document.getElementById('gallery');
    const controls = document.getElementById('controls');
    const credits = document.getElementById('credits');

    if (!gallery || !controls || !credits) return;

    /*
        Gallery variables
        - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
    var currentIndex = 0;
    var isAnimating = false;
    var autoPlay = null;
    var duration = 5000;
    
    /* Fire all functions needed */
    [
        buildFigures,
        buildCredits,
        buildCounter
    ].forEach(fn => importedImages.forEach(fn));

    if(opt.done) opt.done();
    if(opt.autoPlay) autoPlay = setInterval(() => triggerMove(), duration);

    /*
        Utilities
        - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
    function initialClass (i) {
        return (i === 0) ? 'current' : 'next';
    }

    function classList (element) {
        var list = element.classList;
        return {
            toggle: function (c) { list.toggle(c); return this; },
            add: function (c) { list.add(c); return this; },
            remove: function (c) { list.remove(c); return this; }
        };
    }

    /*
        Loop each caption
        - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
    function buildFigureCaption (item, i) {
        /* Captions container */
        const figureCaption = document.createElement('figcaption');
        const title = document.createElement('h3');

        classList(title).add('title');

        title.innerHTML = item.title;

        /* Append created image elements to the gallery */
        figureCaption.appendChild(title);
        figureCaption.innerHTML += '<p>' + item.text + '</p>';
        return figureCaption
    }
    /*
        Loop each caption
        - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
    function buildCredits (item, i) {
        var artist = document.createElement('div');
        artist.classList.add('credit');
        artist.classList.add(initialClass(i));
        artist.innerHTML += '<span>Artwork by</span><span>' + item.artist + '</span>';
        credits.appendChild(artist);
    }
    /*
        Loop each image
        - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
    function buildFigures (item, i) {

        /* Figure container and image container */
        const figure = document.createElement('figure');
        const image = document.createElement('div');
        const caption = buildFigureCaption(item, i);

        figure.classList.add(initialClass(i));
        
        image.classList.add('image');
        image.style.backgroundImage = `url(${ item.background })`;

        figure.appendChild(image);
        figure.appendChild(caption);
        gallery.appendChild(figure);
    }
    /*
        Slider counter for UX purposes
        - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
    function buildCounter (item, i) {

        item = null;

        if(i === 0) {
            /* Image counter */
            var counterE = document.createElement('div');
            var counterTotal = document.createElement('span');
            var counterIndex = document.createElement('span');
            var currentSlide = currentIndex + 1;

            /* And total number of slides */
            counterTotal.innerHTML = (importedImages.length);
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
    function updateCounterIndex () {
        controls.querySelector('.counter-index').innerHTML = currentIndex + 1;
    }

    function triggerMove (event) {

        var dirNext, dirPrev, direction;

        if(event) {
            clearInterval(autoPlay);
            /* Use regex to test if clicked has class of next or prev */
            var testNext = /\b(next)\b/g;
            var testPrev = /\b(prev)\b/g;
            dirNext = testNext.test(event.target.className);
            dirPrev = testPrev.test(event.target.className);
        } else {
            dirNext = true;
        }

        if(isAnimating) { return; }

        isAnimating = true;

        if(dirNext) {
            /* If at the end of the array */
            if(currentIndex === importedImages.length - 1) {
                /* Reset back to first */
                currentIndex = 0;
                direction = 'begin';
            } else {
                currentIndex++;
                direction = 'next';
            }
        }

        if(dirPrev) {
            /* If at the begining of the array going in reverse */
            if(currentIndex === 0) {
                /* Set back to last item in array */
                currentIndex = importedImages.length - 1;
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
            credits.children
        ], direction);
    }

    function move (items, direction) {

        items.forEach(function (item) {
            var dir
                = (direction === 'next') ? 'prev'
                    : (direction === 'prev') ? 'next'
                        : 'current';

            var index
                = (direction === 'next') ? (currentIndex - 1)
                    : (direction === 'prev') ? (currentIndex + 1)
                        : (direction === 'begin') ? 0
                            : (direction === 'end') ? importedImages.length - 1
                                : 0;

            classList(item[currentIndex])
                .remove(direction)
                .add('current');

            classList(item[index])
                .remove('current')
                .add(dir);

            /* Make slider reset to cycle infinitely */
            if(direction === 'begin' || direction === 'end') {
                [].slice.call(item).forEach(function (val) {
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

        updateCounterIndex();
    }

    function animationGate (item) {
        var elapsedTime;
        /* Cycle through the elements to check if animation is complete */
        [].slice.call(item).forEach(function (elements) {
            elements.addEventListener('transitionend', (e) => {
                elapsedTime = e.elapsedTime;
                setTimeout(() => {
                    /* Change animating flag */
                    if(e.elapsedTime < elapsedTime) {
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
}
