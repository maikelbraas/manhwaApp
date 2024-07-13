document.getElementById("startUpdate").addEventListener("click", () => {
    const progressDiv = document.getElementById("progress");
    progressDiv.innerHTML = "Starting fetch...";
    createBar("asura");
    createBar("reaper");
    const asura = document.getElementById('asura');
    const reaper = document.getElementById('reaper');

    const eventSource = new EventSource("/api/manhwaUpdate");

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.progress.asura <= 100) {
            asura.innerHTML = `${Math.round(
                data.progress.asura
            )}%`;
            asura.style.width = data.progress.asura + "%";
        }
        if (data.progress.reaper <= 100) {
            reaper.innerHTML = `${Math.round(
                data.progress.reaper
            )}%`;
            reaper.style.width = data.progress.reaper + "%";
        }
        if (data.done) {
            progressDiv.innerHTML +=
                "<br>Fetch completed! Updated rows: " + data.updatedRows;
            eventSource.close();
            buildJson();
        }
    };

    eventSource.onerror = () => {
        progressDiv.innerHTML += "<br>Error occurred";
        eventSource.close();
    };
});

document.getElementById("startCreate").addEventListener("click", () => {
    const progressDiv = document.getElementById("progress");
    progressDiv.innerHTML = "Starting fetch...";
    createBar("asura");
    createBar("reaper");
    const asura = document.getElementById('asura');
    const reaper = document.getElementById('reaper');

    const eventSource = new EventSource("/api/manhwa");

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.progress.asura <= 100) {
            asura.innerHTML = `${Math.round(
                data.progress.asura
            )}%`;
            asura.style.width = data.progress.asura + "%";
        }
        if (data.progress.reaper <= 100) {
            reaper.innerHTML = `${Math.round(
                data.progress.reaper
            )}%`;
            reaper.style.width = data.progress.reaper + "%";
        }
        if (data.done) {
            progressDiv.innerHTML +=
                "<br>Fetch completed! Added rows: " + data.createdRows;
            eventSource.close();
            buildJson();
        }
    };

    eventSource.onerror = () => {
        progressDiv.innerHTML += "<br>Error occurred";
        eventSource.close();
    };
});
document.getElementById("startBuild").addEventListener("click", () => {
    const progressDiv = document.getElementById("progress");
    progressDiv.innerHTML = "Starting fetch...";
    buildJson();
});

function buildJson() {
    const progressDiv = document.getElementById("progress");
    createBar("json-build");
    const asura = document.getElementById('json-build');

    const eventSource = new EventSource("/api/jsonWrite");

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
            eventSource.close();
        }
    };

    eventSource.onerror = () => {
        progressDiv.innerHTML += "<br>Error occurred";
        eventSource.close();
    };
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