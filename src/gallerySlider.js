import { EVENTS } from './events';
import State from './state';

var state = Object.assign({}, State);
state = Object.assign(state, build());

const duration = parseInt(getComputedStyle(state.timer).getPropertyValue('--inner-dur').replace(/s/, '')) * 1000;

EVENTS.on('timerEnd', onTimerEnd);
EVENTS.on('timerChange', onTimerChange);

export default function gallerySlider () {
    typecrop.default('.title');
    runTimer();
    addClickEvents();
}

function addClickEvents() {
    Array
        .from(document.querySelectorAll('.control-button'))
        .forEach(button => button.addEventListener('click', onButtonClick));
    
    function onButtonClick(event) {
        const {target} = event;
        const isNext = target.classList.contains('next');
        const isPrev = target.classList.contains('prev');
        
        if (isNext) onTimerEnd();
        if (isPrev) onTimerEnd(false);
    }
}

function onTimerEnd(isNext = true) {
    const prev = state.currentIndex;
    if (isNext) {
        const curr = prev === state.gallery.length - 1 ? 0 : prev + 1;
        const next = curr === state.gallery.length - 1 ? 0 : curr + 1;
        EVENTS.emit('timerChange', { prev, curr, next });
        console.log('isNext', { prev, curr, next });
    }
    else {
        const curr = prev === 0 ? state.gallery.length - 1 : prev - 1;
        const next = curr === 0 ? state.gallery.length - 1 : curr - 1;
        console.log('isPrev', { prev, curr, next });
        EVENTS.emit('timerChange', { prev, curr, next });
        
    }
}

function onTimerChange(event) {
    const { curr } = event;
    updateClassNames('figures', event);
    updateClassNames('credits', event);
    state.currentIndex = curr;
    state.counter.innerHTML = (curr + 1); // non-zero
}

function updateClassNames(elementName, event) {
    const { prev, curr, next } = event;
    state[elementName][prev].className = 'prev';
    state[elementName][curr].className = 'current';
    state[elementName][next].className = 'next';
}

function runTimer() {
    setTimeout(() => state.timer.classList.add('active'), duration);
}

function onTimerTransitionEnd(event) {
    const timer = event.target;
    if(event.propertyName === 'left') {
        EVENTS.emit('timerEnd');
    }
    if(timer.classList.contains('active') && timer.classList.contains('exit')) {
        timer.classList.remove('active');
        timer.classList.remove('exit');
    } else {
        timer.classList.add('exit');
    }
    // Restart the timer
    runTimer();
}

function onFigureTransitionEnd(event) {
    console.log(event);
}

// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------

function build () {
    const { gallery } = state;
    const elements = [buildFigures, buildCredits].map(fn => gallery.map(fn.bind(null, gallery)));
    const [figures, credits] = elements;
    const counter = buildCounter(gallery);
    const timer = buildTimer();
    return {
        timer,
        counter,
        figures,
        credits
    };
}

function buildTimer () {
    const slider = document.getElementById('slider');
    const timer = document.createElement('div');
    slider.appendChild(timer);
    timer.classList.add('timer');
    timer.addEventListener('transitionend', onTimerTransitionEnd);
    return timer;
}

function buildFigureCaption (item) {
    
    /* Captions container */
    const figureCaption = document.createElement('figcaption');
    const title = document.createElement('h3');

    title.classList.add('title');
    title.innerHTML = item.title;

    /* Append created image elements to the gallery */
    figureCaption.appendChild(title);
    figureCaption.innerHTML += '<p>' + item.text + '</p>';
    return figureCaption;
}

function buildCredits (items, item, idx) {
    const credits = document.getElementById('credits');
    const artist = document.createElement('div');
    artist.className = idx === 0 ? 'current' : 'next';
    artist.innerHTML += '<span>Artwork by</span><span>' + item.artist + '</span>';
    credits.appendChild(artist);
    return artist;
}

function buildFigures (images, item, i) {
    /* Figure container and image container */
    const gallery = document.getElementById('gallery');
    const figure = document.createElement('figure');
    const image = document.createElement('div');
    const caption = buildFigureCaption(item);

    image.classList.add('image');
    image.style.backgroundImage = `url(${ item.background })`;
    figure.className = i === 0 ? 'current' : 'next';
    figure.appendChild(image);
    figure.appendChild(caption);
    gallery.appendChild(figure);

    figure.addEventListener('transitionend', onFigureTransitionEnd);

    return figure;
}

function buildCounter (images) {
    const controls = document.getElementById('controls');
    
    /* Image counter */
    const counterE = document.createElement('div');
    const counterTotal = document.createElement('span');
    const counterIndex = document.createElement('span');

    /* And total number of slides */
    counterTotal.innerHTML = (images.length);
    counterIndex.innerHTML = state.currentIndex + 1;

    // Add image counter */
    counterE.classList.add('counter');
    counterIndex.classList.add('counter-index');

    counterE.appendChild(counterIndex);
    counterE.appendChild(counterTotal);
    controls.appendChild(counterE);
    return counterIndex;
}