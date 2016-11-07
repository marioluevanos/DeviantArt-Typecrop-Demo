/* globals httpRequest: true */
/* globals TypeTest: true */
/* globals gallerySlider: true */
/* globals parseXML: true */

(function() {

    'use strict';

    var slides = [{
        title: 'DeviantArt Typography',
        text: 'SVG replacement for the web.',
        artist: 'DanielaUhlig',
        background: 'src/img/img-1.jpg'
    },
    {
        title: 'Audacious and Inspired',
        text: 'We have a unique and ownable headline typography that highlights our audacious and inspired characters.',
        artist: 'Mark-Chadwick',
        background: 'src/img/img-2.jpg'
    },
    {
        title: 'Sixty Two Degree Angle',
        text: 'The first and last letter of the headline are customized at our 62 degree angle, helping each communication tell our story.',
        artist: 'Aymen-Ouertani',
        background: 'src/img/img-3.jpg'
    },
    {
        title: 'Examples and Usage',
        text: 'Below you see how the full alphabet has been crafted, a demonstration and examples of usage.',
        artist: 'axcy',
        background: 'src/img/img-4.jpg'
    }];

    /* Initialize */
    document.addEventListener('DOMContentLoaded', function() {

        gallerySlider(slides)
            .init({
                typeCrop: true,
                autoPlay: true
            });

        /* Test instance */
        return new TypeTest()
            .createAlphabet()
            .setAttr('class', 'da-title')
            .appendTo('#alphabet')
            .typeCrop('.da-title');
    });

    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

})();

