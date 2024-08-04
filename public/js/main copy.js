const search = document.getElementById('search');
const manhwasElement = document.getElementById('manhwas');
const template = document.getElementById('manhwa-card-template');
const foundManhwas = document.querySelector('.found');
let page;
let active = 0;
let searchValInter;
const goto = document.querySelector('#goto');
const spinner = document.querySelector('.loading-spinner');
goto.addEventListener('keypress', (event) => {
    if (event.key == "Enter")
        window.location.href = '/manhwa?page=' + event.target.value;
})
//Fill localStorage
await fetchManhwaFromJson();
//Populate with manhwas
searchManhwa();

search.addEventListener('input', searchManhwa)

function searchManhwa() {
    let manhwas = JSON.parse(localStorage.getItem('manhwas'));
    manhwasElement.innerHTML = "";
    if (search.value != "") {
        foundManhwas.style.display = 'block';
        createCard(manhwas);
    } else {
        foundManhwas.style.display = 'none';
        fetchManhwaLimit();
    }
}

function fetchManhwaLimit() {
    page = parseInt(new URLSearchParams(window.location.search).get('page'));
    let manhwasLimit = JSON.parse(localStorage.getItem('manhwas'));
    if (!page) {
        foundManhwas.style.display = 'flex';
        createCard(manhwasLimit);
    } else {
        page = page > manhwasLimit / 6 ? manhwasLimit / 6 : page;
        page = page < 1 ? 1 : page;
        page -= 1;
        page *= 6;
        manhwasLimit = manhwasLimit.slice(page, page + 6);
        createCard(manhwasLimit);
    }
}

async function fetchManhwaFromJson() {
    try {
        spinner.style.display = "flex";
        let manhwas = await fetch('../json/manhwas.json');
        manhwas = await manhwas.json();
        localStorage.setItem('manhwas', JSON.stringify(manhwas));
        spinner.style.display = "none";
        return;
    } catch (e) {
        console.log(e);
    }
}

function clearIntervalSet(name) {
    clearInterval(name);
}

function createCard(manhwas) {
    let searchv = search.value.toUpperCase();
    let i = 0;
    let found = 0;
    clearInterval(searchValInter)
    searchValInter = setInterval(() => {
        spinner.style.display = "flex";
        if (manhwas[i].title.toUpperCase().includes(searchv)) {
            found++;
            let clone = template.content.cloneNode(true);
            clone.querySelector('.card-link').href += manhwas[i].mid;
            clone.querySelector('.card-title').innerHTML = manhwas[i].title;
            clone.querySelector('.manhwa-row-content').innerHTML = manhwas[i].content;
            clone.querySelector('.manga-image').dataset.src = "manhwaImages/" + manhwas[i].image;
            let chapters = manhwas[i].chapters % 1 !== 0 ? manhwas[i].chapters.toFixed(1) : manhwas[i].chapters;
            clone.querySelector('.card-chapter').textContent += " " + chapters;
            clone.querySelector('.card-status').innerHTML += " " + manhwas[i].status + ` <i class="${manhwas[i].status.toLowerCase().replace(/\s/g, "")}">&#9679;</i>`;
            clone.querySelector('.card-source').textContent += " " + manhwas[i].baseurl.split('/')[2].split('.')[0];
            clone.querySelector('.card-time').textContent += " " + new Date(manhwas[i].lastUpdate).toLocaleString('nl-NL', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).slice(0, -3);
            let genreContainers = clone.querySelectorAll('.genres-manhwa');
            let genrePart = clone.querySelector('.me-1').cloneNode(true);
            for (let genreContainer of genreContainers)
                genreContainer.innerHTML = "";
            for (let genre of manhwas[i].genres) {
                for (let genreContainer of genreContainers) {
                    genrePart.querySelector('.fa-fist-raised').textContent = genre;
                    genreContainer.appendChild(genrePart)
                    genrePart = clone.querySelector('.me-1').cloneNode(true);
                }
            }
            manhwasElement.appendChild(clone);
            foundManhwas.querySelector('.found-number').innerHTML = found;
        }
        i++;
        if (i == manhwas.length) {
            clearInterval(searchValInter)
            spinner.style.display = "none";
        }
    }, 1);
    foundManhwas.querySelector('.found-number').innerHTML = found;
}
