import gallerySlider from './gallerySlider'
import TypeTest from './TypeTest'
import allAlphabet from './allAlphabet'
const typeCrop = typecrop.default

gallerySlider([
    {
        title: 'DeviantArt Typography',
        text: 'SVG replacement for the web.',
        artist: 'DanielaUhlig',
        background: require('/assets/images/img-1.jpg')
    },
    {
        title: 'Audacious and Inspired',
        text: 'We have a unique and ownable headline typography that highlights our audacious and inspired characters.',
        artist: 'Mark-Chadwick',
        background: require('/assets/images/img-2.jpg')
    },
    {
        title: 'Sixty Two Degree Angle',
        text: 'The first and last letter of the headline are customized at our 62 degree angle, helping each communication tell our story.',
        artist: 'Aymen-Ouertani',
        background: 'https://deviantart-typecrop.web.app/img-3.03373b95.jpg'
    },
    {
        title: 'Examples and Usage',
        text: 'Below you see how the full alphabet has been crafted, a demonstration and examples of usage.',
        artist: 'axcy',
        background: 'https://deviantart-typecrop.web.app/img-4.88f3eeb1.jpg'
    }
], {
    autoPlay: true,
    done: () => typeCrop('.title')
})

new TypeTest()

allAlphabet('#all-alphabet')

document.body.classList.add('loaded')
