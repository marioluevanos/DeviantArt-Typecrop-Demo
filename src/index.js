import typeCrop from 'deviantart-typecrop'
import gallerySlider from './gallerySlider'
import TypeTest from './TypeTest'

const slides = [
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
        background: require('/assets/images/img-3.jpg')
    },
    {
        title: 'Examples and Usage',
        text: 'Below you see how the full alphabet has been crafted, a demonstration and examples of usage.',
        artist: 'axcy',
        background: require('/assets/images/img-4.jpg')
    }
]

gallerySlider(slides)
    .init({
        autoPlay: true,
        done: () => typeCrop('.title')
    })

new TypeTest()

document.body.classList.add('loaded')
