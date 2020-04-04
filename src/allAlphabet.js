const typeCrop = typecrop.default

/* Create test alphabet */
export default function allAlphabet (parentElementSelector) {
    const alphabet = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
        'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
        'w', 'x', 'y', 'z'
    ];
    const className = 'da-title';
    alphabet.forEach((letter) => {
        const title = document.createElement('h2');
        title.innerHTML = letter.toUpperCase() + '' + letter;
        title.setAttribute('class', className);

        const box = document.createElement('div');
        box.appendChild(title);
        
        const target = document.querySelector(parentElementSelector);
        if(target) {
            target.appendChild(box);
        }
    })
    typeCrop('.' + className);
}