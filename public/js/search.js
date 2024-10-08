const search = document.getElementById('search');
const manhwasElement = document.getElementById('manhwas-search');
const template = document.getElementById('manhwa-card-template');
const containerManhwa = document.querySelector('.manhwa-search-container');
const checkGenre = document.getElementById('genre-check');
const searchContainer = document.getElementById('search-container');
let page;
let active = 0;
let searchValInter;
const spinner = document.querySelector('.loading-spinner');

searchManhwa();

let manhwas = JSON.parse(localStorage.getItem('manhwas'));

checkGenre.addEventListener('click', () => {
    if (checkGenre.checked) {
        search.setAttribute('placeholder', 'Ex. action adventure sci...')
    } else {
        search.setAttribute('placeholder', 'Ex. Solo Leveling')
    }
})
search.addEventListener('input', searchManhwa);
search.addEventListener('focus', () => {
    searchContainer.style.width = '100%';
    searchContainer.style.backgroundColor = '#212529'
    searchContainer.classList.remove('active');
})
search.addEventListener('blur', (event) => {
    searchContainer.style.width = '240px';
    searchContainer.style.right = '50%';
    searchContainer.classList.add('active');
    // search.value = "";
    searchManhwa()
})

function searchManhwa() {
    manhwasElement.innerHTML = "";
    if (search.value.length > 0) {
        manhwasElement.style.display = 'flex';
        containerManhwa.style.display = 'flex';
        createCard();
    } else {
        manhwasElement.style.display = 'none';
        containerManhwa.style.display = 'none';
    }
}

function createCard() {
    let searchv = search.value.toUpperCase();
    spinner.style.display = "flex";
    for (let i = 0; i < manhwas.length; i++) {
        if (checkGenre.checked) {
            let genres = searchv.toLowerCase().replace('genre', '').split(' ');
            if (genres.length > 0 && manhwas[i].genres != null && genres.every((genre) =>
                manhwas[i].genres.toLowerCase().includes(genre))) {
                card(manhwas[i]);
            }
        } else if (manhwas[i].title.toUpperCase().indexOf(searchv) > -1) {
            card(manhwas[i]);
        }

        if (i == manhwas.length - 1) {
            spinner.style.display = "none";
        }
    }
}

function card(manhwa) {
    let clone = template.content.cloneNode(true);
    clone.querySelector('.card-link').href += manhwa.mid;
    clone.querySelector('.card-title').innerHTML = manhwa.title;
    clone.querySelector('.manga-image').dataset.src = "/manhwaImages/" + manhwa.mid + ".webp";
    clone.querySelector('.card-status').innerHTML += " " + manhwa.status + ` <i class="${manhwa.status.toLowerCase().replace(/\s/g, "")}" >&#9679;</i> `;
    let chapters = manhwa.chapters % 1 !== 0 ? manhwa.chapters.toFixed(1) : manhwa.chapters;
    clone.querySelector('.card-chapter').textContent += " " + chapters;
    let genreContainers = clone.querySelectorAll('.genres-manhwa');
    let genrePart = clone.querySelector('.me-1').cloneNode(true);
    for (let genreContainer of genreContainers)
        genreContainer.innerHTML = "";
    if (manhwa.genres != null) {
        for (let genre of manhwa.genres.split(',')) {
            for (let genreContainer of genreContainers) {
                genrePart.querySelector('.fa-fist-raised').textContent = genre;
                genreContainer.appendChild(genrePart)
                genrePart = clone.querySelector('.me-1').cloneNode(true);
            }
        }
    }
    manhwasElement.appendChild(clone);
}
