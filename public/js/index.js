const manhwasElement = document.getElementById('manhwas');
const template = document.getElementById('manhwa-card-template');

//Fill localStorage
await fetchManhwaFromJson();

//Populate
createCard(JSON.parse(localStorage.getItem('manhwasLatest')));

async function fetchManhwaFromJson() {
    let manhwas = await fetch('../json/manhwas.json');
    manhwas = await manhwas.json();
    let manhwasTen = manhwas.sort((a, b) => {
        return new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime();
    }).slice(manhwas.length - 10, manhwas.length)
    manhwasTen = manhwasTen.reverse();
    localStorage.setItem('manhwasLatest', JSON.stringify(manhwasTen));
}

function createCard(manhwas) {
    for (let manhwa of manhwas) {
        let clone = template.content.cloneNode(true);
        clone.querySelector('.card-link').href += manhwa.mid;
        clone.querySelector('.card-title').innerHTML = manhwa.title;
        clone.querySelector('.manhwa-row-content').innerHTML = manhwa.content;
        clone.querySelector('.manga-image').dataset.src = "manhwaImages/" + manhwa.image;
        clone.querySelector('.card-chapter').textContent += " " + manhwa.chapters;
        clone.querySelector('.card-status').innerHTML += " " + manhwa.status + ` <i class="bi bi-circle-fill ${manhwa.status.toLowerCase().replace(/\s/g, "")}"></i>`;
        clone.querySelector('.card-source').textContent += " " + manhwa.baseurl.split('/')[2].split('.')[0];
        clone.querySelector('.card-time').textContent += " " + new Date(manhwa.lastUpdate).toLocaleString('nl-NL', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).slice(0, -3);
        let genreContainer = clone.querySelector('.genres-manhwa');
        let genrePart = clone.querySelector('.me-2').cloneNode(true);
        genreContainer.innerHTML = "";
        for (let genre of manhwa.genres) {
            genrePart.querySelector('.me-1').textContent = genre;
            genreContainer.appendChild(genrePart)
            genrePart = clone.querySelector('.me-2').cloneNode(true);
        }
        manhwasElement.appendChild(clone);
    }
}
