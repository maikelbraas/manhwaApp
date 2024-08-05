document.getElementById("startUpdate").addEventListener("click", () => {
    const progressDiv = document.getElementById("progress");
    progressDiv.innerHTML = "Starting fetch...";
    // createBar("asura");
    createBar("reaper");
    createBar("flame");
    createBar("demon");
    // const asura = document.getElementById('asura');
    const reaper = document.getElementById('reaper');
    const flame = document.getElementById('flame');
    const demon = document.getElementById('demon');

    const eventSource = new EventSource("/admin/api/manhwaUpdate");

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // if (data.progress.asura <= 100) {
        //     asura.innerHTML = `${Math.round(
        //         data.progress.asura
        //     )}%`;
        //     asura.style.width = data.progress.asura + "%";
        // }
        if (data.progress.reaper <= 100) {
            reaper.innerHTML = `${Math.round(
                data.progress.reaper
            )}%`;
            reaper.style.width = data.progress.reaper + "%";
        }
        if (data.progress.flame <= 100) {
            flame.innerHTML = `${Math.round(
                data.progress.flame
            )}%`;
            flame.style.width = data.progress.flame + "%";
        }
        if (data.progress.demon <= 100) {
            demon.innerHTML = `${Math.round(
                data.progress.demon
            )}%`;
            demon.style.width = data.progress.demon + "%";
        }
        if (data.done) {
            progressDiv.innerHTML +=
                "<br>Fetch completed! Updated rows: " + data.updatedRows;
            eventSource.close();
            if (data.updatedRows > 0)
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
    // createBar("asura");
    createBar("reaper");
    createBar("flame");
    // const asura = document.getElementById('asura');
    const reaper = document.getElementById('reaper');
    const flame = document.getElementById('flame');

    const eventSource = new EventSource("/admin/api/manhwa");

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // if (data.progress.asura <= 100) {
        //     asura.innerHTML = `${Math.round(
        //         data.progress.asura
        //     )}%`;
        //     asura.style.width = data.progress.asura + "%";
        // }
        if (data.progress.reaper <= 100) {
            reaper.innerHTML = `${Math.round(
                data.progress.reaper
            )}%`;
            reaper.style.width = data.progress.reaper + "%";
        }
        if (data.progress.flame <= 100) {
            flame.innerHTML = `${Math.round(
                data.progress.flame
            )}%`;
            flame.style.width = data.progress.flame + "%";
        }
        if (data.done) {
            progressDiv.innerHTML +=
                "<br>Fetch completed! Added rows: " + data.createdRows;
            eventSource.close();

            if (data.updatedRows > 0)
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

document.getElementById("findSpecific").addEventListener("click", () => {
    let promptAnswer = prompt('what manhwa do you want to get?');
    if (promptAnswer != '' && promptAnswer != false && promptAnswer != null) {
        const progressDiv = document.getElementById("progress");
        progressDiv.innerHTML = "Starting fetch...";
        createBar("get-single");
        const asura = document.getElementById('get-single');
        const eventSource = new EventSource("/admin/api/specific/" + promptAnswer);

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
                    "<br>Build completed! Manhwa done: <br>";
                for (let part in JSON.parse(data.manhwa)) {
                    progressDiv.innerHTML += `<br> ${part}: ${JSON.parse(data.manhwa)[part]}`;
                }
                eventSource.close();

                if (data.updatedRows > 0)
                    buildJson();
            }
            if (data.error) {
                progressDiv.innerHTML +=
                    data.error;
                eventSource.close();
            }
        };

        eventSource.onerror = () => {
            progressDiv.innerHTML += "<br>Error occurred";
            eventSource.close();
        };
    }
});