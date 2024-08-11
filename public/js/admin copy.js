document.getElementById("startUpdate").addEventListener("click", () => {
    const progressDiv = document.getElementById("progress"); progressDiv.innerHTML = "Starting fetch..."; createBar("reaper"); createBar("flame"); createBar("mgdemon"); const reaper = document.getElementById('reaper'); const flame = document.getElementById('flame'); const mgdemon = document.getElementById('mgdemon'); const eventSource = new EventSource("/admin/api/manhwaUpdate"); eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data); if (data.progress.reaper <= 100) {
            reaper.innerHTML = `${Math.round(
                data.progress.reaper
            )}%`; reaper.style.width = data.progress.reaper + "%"
        }
        if (data.progress.flame <= 100) {
            flame.innerHTML = `${Math.round(
                data.progress.flame
            )}%`; flame.style.width = data.progress.flame + "%"
        }
        if (data.progress.mgdemon <= 100) {
            mgdemon.innerHTML = `${Math.round(
                data.progress.mgdemon
            )}%`; mgdemon.style.width = data.progress.mgdemon + "%"
        }
        if (data.done) {
            progressDiv.innerHTML += "<br>Fetch completed! Updated rows: " + data.updatedRows; eventSource.close(); if (data.updatedRows > 0)
                buildJson();
        }
    }; eventSource.onerror = () => { progressDiv.innerHTML += "<br>Error occurred"; eventSource.close() }
}); document.getElementById("startCreate").addEventListener("click", () => {
    const progressDiv = document.getElementById("progress"); progressDiv.innerHTML = "Starting fetch..."; createBar("reaper"); createBar("flame"); const reaper = document.getElementById('reaper'); const flame = document.getElementById('flame'); const eventSource = new EventSource("/admin/api/manhwa"); eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data); if (data.progress.reaper <= 100) {
            reaper.innerHTML = `${Math.round(
                data.progress.reaper
            )}%`; reaper.style.width = data.progress.reaper + "%"
        }
        if (data.progress.flame <= 100) {
            flame.innerHTML = `${Math.round(
                data.progress.flame
            )}%`; flame.style.width = data.progress.flame + "%"
        }
        if (data.done) {
            progressDiv.innerHTML += "<br>Fetch completed! Added rows: " + data.createdRows; eventSource.close(); if (data.updatedRows > 0)
                buildJson();
        }
    }; eventSource.onerror = () => { progressDiv.innerHTML += "<br>Error occurred"; eventSource.close() }
}); document.getElementById("startBuild").addEventListener("click", () => { const progressDiv = document.getElementById("progress"); progressDiv.innerHTML = "Starting fetch..."; buildJson() }); function buildJson() {
    const progressDiv = document.getElementById("progress"); createBar("json-build"); const asura = document.getElementById('json-build'); const eventSource = new EventSource("/api/jsonWrite"); eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data); if (data.progress <= 100) {
            asura.innerHTML = `${Math.round(
                data.progress
            )}%`; asura.style.width = data.progress + "%"
        }
        if (data.done) { progressDiv.innerHTML += "<br>Build completed!"; eventSource.close() }
    }; eventSource.onerror = () => { progressDiv.innerHTML += "<br>Error occurred"; eventSource.close() }
}
function createBar(name) { let container = document.getElementById('progress'); container.innerHTML += "<br>" + name; let bar = document.getElementById('progress-site').content.cloneNode(!0); container.appendChild(bar); let all = container.querySelectorAll('.progress-bar'); let last = all[all.length - 1]; last.setAttribute('id', name) }
document.getElementById("findSpecific").addEventListener("click", () => {
    let promptAnswer = prompt('what manhwa do you want to get?'); if (promptAnswer != '' && promptAnswer != !1 && promptAnswer != null) {
        promptAnswer = promptAnswer.split('manga')[1].split('/')[1]; const progressDiv = document.getElementById("progress"); progressDiv.innerHTML = "Starting fetch..."; createBar("get-single"); const asura = document.getElementById('get-single'); const eventSource = new EventSource("/admin/api/specific/" + encodeURI(promptAnswer)); eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data); if (data.progress <= 100) {
                asura.innerHTML = `${Math.round(
                    data.progress
                )}%`; asura.style.width = data.progress + "%"
            }
            if (data.done) {
                progressDiv.innerHTML += "<br>Build completed! Manhwa done: <br>"; for (let part in JSON.parse(data.manhwa)) { progressDiv.innerHTML += `<br> ${part}: ${JSON.parse(data.manhwa)[part]}` }
                eventSource.close(); if (data.updatedRows > 0)
                    buildJson();
            }
            if (data.error) { progressDiv.innerHTML += data.error; eventSource.close() }
        }; eventSource.onerror = () => { progressDiv.innerHTML += "<br>Error occurred"; eventSource.close() }
    }
}); document.getElementById("getImages").addEventListener("click", () => {
    const progressDiv = document.getElementById("progress"); progressDiv.innerHTML = "Starting fetch..."; createBar("get-images"); const asura = document.getElementById('get-images'); const eventSource = new EventSource("/admin/api/getimages"); eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data); if (data.progress <= 100) {
            asura.innerHTML = `${Math.round(
                data.progress
            )}%`; asura.style.width = data.progress + "%"
        }
        if (data.done) {
            progressDiv.innerHTML += "<br>Build completed! Images updated: " + data.updatedRows; eventSource.close(); if (data.updatedRows > 0)
                buildJson();
        }
        if (data.error) { progressDiv.innerHTML += data.error; eventSource.close() }
    }; eventSource.onerror = () => { progressDiv.innerHTML += "<br>Error occurred"; eventSource.close() }
})
document.getElementById("resizeImages").addEventListener("click", () => {
    let promptAnswer = prompt('what size image? ex. 100x100'); if (promptAnswer != '' && promptAnswer != !1 && promptAnswer != null) {
        const progressDiv = document.getElementById("progress"); progressDiv.innerHTML = "Starting fetch..."; createBar("resize-images"); const asura = document.getElementById('resize-images'); const eventSource = new EventSource("/admin/api/resizeImages/" + promptAnswer); eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data); if (data.progress <= 100) {
                asura.innerHTML = `${Math.round(
                    data.progress
                )}%`; asura.style.width = data.progress + "%"
            }
            if (data.done) { progressDiv.innerHTML += "<br>All images resized! "; eventSource.close() }
            if (data.error) { progressDiv.innerHTML += data.error; eventSource.close() }
        }; eventSource.onerror = () => { progressDiv.innerHTML += "<br>Error occurred"; eventSource.close() }
    }
})