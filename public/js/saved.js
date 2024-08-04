let timer = null;
const progressDiv = document.getElementById("progress");
waitTimer();
checkIfHiddenOrShow();
document
    .querySelectorAll(".input-number")
    .forEach((x) => (x.autofocus = false));


document.querySelector('.manhwa-buttons-action').addEventListener('click', async (event) => {
    if (event.target.dataset.button != undefined) {
        const setButtonType = document.querySelector('#' + event.target.dataset.id).dataset;
        const modalWindow = document.querySelector('#modal-' + event.target.dataset.id)
        if (event.target.dataset.button.includes('later')) {
            setButtonType.type = 'later'
            modalWindow.querySelector('.modal-title').innerHTML = 'Read Later / Start Reading'
            modalWindow.querySelector('.modal-body').innerHTML = event.target.classList.contains('btn-warning') ? "Are you sure you want to read manhwa later?"
                : "Are you sure you want to start reading manhwa?";
        }
        else if (event.target.dataset.button.includes('remove')) {
            setButtonType.type = 'remove'
            modalWindow.querySelector('.modal-title').innerHTML = 'Remove'
            modalWindow.querySelector('.modal-body').innerHTML = "Are you sure you want to remove manhwa?";
        }
    }
    if (event.target.dataset.type != undefined) {
        if (event.target.dataset.type == "remove") {
            await fetch(`/auth/remove/${event.target.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/html" }
            }).then(() => { window.location.reload() })
        }
        if (event.target.dataset.type == 'later') {
            await fetch(`/auth/patch/${event.target.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/html" }
            }).then(() => { window.location.reload() })
        }
    }
});

function checkIfHiddenOrShow() {
    if (isUserUsingMobile()) {
        const labels = document.querySelectorAll('.accordion');
        for (let i = 1; i < labels.length; i++) {
            labels[i].querySelector('.accordion-button').classList.add('collapsed');
            labels[i].querySelector('.accordion-collapse').classList.remove('show');
        }
    }
}

document.getElementById("updateSaved").addEventListener("click", () => {
    if ((new Date() - new Date(localStorage.getItem('timer'))) / 1000 > 600) {
        localStorage.setItem('timer', new Date());
        progressDiv.innerHTML = "Starting update, <strong>you don't have to be on the page to get the updates.</strong>";
        createBar("savedManhwas");
        const reaper = document.getElementById('savedManhwas');

        const eventSource = new EventSource("/auth/updatesavedmanhwa");

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.progress <= 100) {
                reaper.innerHTML = `${Math.round(
                    data.progress
                )}%`;
                reaper.style.width = data.progress + "%";
            }
            if (data.done) {
                progressDiv.innerHTML +=
                    `<br>Fetch completed! Updated rows: ${data.updatedRows} ${data.updatedRows > 0 ? " Refresh required, reloading in 2 seconds." : " No refresh required."}`;
                eventSource.close();
                buildJson(data.updatedRows);
            }
        };

        eventSource.onerror = () => {
            progressDiv.innerHTML += "<br>Error occurred";
            eventSource.close();
        };
    }
});

function waitTimer() {
    if (timer == null && (new Date() - new Date(localStorage.getItem('timer'))) / 1000 < 600) {
        let timeSeconds = Math.floor(600 - ((new Date() - new Date(localStorage.getItem('timer'))) / 1000));
        let timeMinutes = Math.floor((600 - ((new Date() - new Date(localStorage.getItem('timer'))) / 1000)) / 60);
        progressDiv.innerHTML = `Time left until update available: 0${timeMinutes}:${(timeSeconds - timeMinutes * 60) < 10 ? "0" + (timeSeconds - timeMinutes * 60) : timeSeconds - timeMinutes * 60}`;
        timer = setInterval(() => {
            let timeSeconds = Math.floor(600 - ((new Date() - new Date(localStorage.getItem('timer'))) / 1000));
            let timeMinutes = Math.floor((600 - ((new Date() - new Date(localStorage.getItem('timer'))) / 1000)) / 60);
            progressDiv.innerHTML = `Time left until update available: 0${timeMinutes}:${(timeSeconds - timeMinutes * 60) < 10 ? "0" + (timeSeconds - timeMinutes * 60) : timeSeconds - timeMinutes * 60}`;
            if (timeSeconds <= 0) {
                clearInterval(timer);
                progressDiv.innerHTML = `Ready to update!`
                timer = null;
            }
        }, 1000);
    } else {
        progressDiv.innerHTML = `Ready to update!`
    }
}


function createBar(name) {
    let container = document.getElementById('progress');
    container.innerHTML += "<br>" + name;
    let bar = document.getElementById('progress-site').content.cloneNode(true);
    container.appendChild(bar);
    let all = container.querySelectorAll('.progress-bar');
    let last = all[all.length - 1];
    last.setAttribute('id', name)
}

function buildJson(refresh) {
    const progressDiv = document.getElementById("progress");
    createBar("json-build");
    const asura = document.getElementById('json-build');
    const eventSource = new EventSource("/api/jsonWrite/");

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.progress <= 100) {
            asura.innerHTML = `${Math.round(
                data.progress
            )}%`;
            asura.style.width = data.progress + "%";
        }
        if (data.done) {
            progressDiv.innerHTML +=
                "<br>Build completed!";
            setTimeout(() => {
                progressDiv.innerHTML = "";
                waitTimer();
                if (refresh > 0)
                    location.reload();
            }, 2000)
            eventSource.close();
        }
    };

    eventSource.onerror = () => {
        progressDiv.innerHTML += "<br>Error occurred";
        eventSource.close();
    };
}

function isUserUsingMobile() {

    // User agent string method
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Screen resolution method
    if (!isMobile) {
        let screenWidth = window.screen.width;
        let screenHeight = window.screen.height;
        isMobile = (screenWidth < 768 || screenHeight < 768);
    }

    // Touch events method
    if (!isMobile) {
        isMobile = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    }

    // CSS media queries method
    if (!isMobile) {
        let bodyElement = document.getElementsByTagName('body')[0];
        isMobile = window.getComputedStyle(bodyElement).getPropertyValue('content').indexOf('mobile') !== -1;
    }

    return isMobile
}
