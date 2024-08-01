let timer = null;
const progressDiv = document.getElementById("progress");
waitTimer();
document
    .querySelectorAll(".input-number")
    .forEach((x) => (x.autofocus = false));


document.querySelector('.manhwa-rows').addEventListener('click', async (event) => {
    if (event.target.id.includes('reaper') || event.target.id.includes('asura') || event.target.id.includes('flame') || event.target.id.includes('mgdemon')) {
        if (event.target.value == "remove") {
            if (confirm('Are you sure you want to delete the saved manhwa?')) {
                await fetch(`/auth/remove/${event.target.id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/html" }
                }).then(() => { window.location.reload() })
            }
        }
        if (event.target.value == 'later') {
            if (confirm(event.target.classList.contains('btn-warning') ? 'Are you sure you want to move the saved manhwa to try?' : 'Are you sure you want to move the saved manhwa to ongoing?')) {
                await fetch(`/auth/patch/${event.target.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/html" }
                }).then(() => { window.location.reload() })
            }
        }
    }
    if (event.target.classList == "devider-label") {
        getComputedStyle(event.target.nextElementSibling).display == 'grid' ? event.target.nextElementSibling.style.display = "none" : event.target.nextElementSibling.style.display = "grid";
    }
});

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