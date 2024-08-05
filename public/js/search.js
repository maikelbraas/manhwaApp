const search = document.getElementById('search');
const manhwasElement = document.getElementById('manhwas-search');
const template = document.getElementById('manhwa-card-template');
const containerManhwa = document.querySelector('.manhwa-search-container');
let page;
let active = 0;
let searchValInter;
const spinner = document.querySelector('.loading-spinner');

searchManhwa();

let manhwas = JSON.parse(localStorage.getItem('manhwas'));

search.addEventListener('input', searchManhwa)

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
        if (manhwas[i].title.toUpperCase().indexOf(searchv) > -1) {
            let clone = template.content.cloneNode(true);
            clone.querySelector('.card-link').href += manhwas[i].mid;
            clone.querySelector('.card-title').innerHTML = manhwas[i].title;
            clone.querySelector('.manga-image').dataset.src = "/manhwaImages/" + manhwas[i].mid + ".webp";
            clone.querySelector('.card-status').innerHTML += " " + manhwas[i].status + ` <i class="${manhwas[i].status.toLowerCase().replace(/\s/g, "")}" >&#9679;</i> `;
            let chapters = manhwas[i].chapters % 1 !== 0 ? manhwas[i].chapters.toFixed(1) : manhwas[i].chapters;
            clone.querySelector('.card-chapter').textContent += " " + chapters;
            let genreContainers = clone.querySelectorAll('.genres-manhwa');
            let genrePart = clone.querySelector('.me-1').cloneNode(true);
            for (let genreContainer of genreContainers)
                genreContainer.innerHTML = "";
            if (manhwas[i].genres != null)
                for (let genre of manhwas[i].genres.split(',')) {
                    for (let genreContainer of genreContainers) {
                        genrePart.querySelector('.fa-fist-raised').textContent = genre;
                        genreContainer.appendChild(genrePart)
                        genrePart = clone.querySelector('.me-1').cloneNode(true);
                    }
                }
            manhwasElement.appendChild(clone);
        }

        if (i == manhwas.length - 1) {
            spinner.style.display = "none";
        }
    }
}
