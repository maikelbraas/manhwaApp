
document
    .querySelectorAll(".input-number")
    .forEach((x) => (x.autofocus = false));


document.querySelector('.manhwa-rows').addEventListener('click', async (event) => {
    if (event.target.id.includes('reaper') || event.target.id.includes('asura') || event.target.id.includes('flame')) {
        if (event.target.value == "remove") {
            if (confirm('Are you sure you want to delete the saved manhwa?')) {
                await fetch(`/auth/remove/${event.target.id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/html" }
                }).then(() => { window.location.reload() })
            }
        }
        if (event.target.value == 'later') {
            if (confirm('Are you sure you want to move the saved manhwa to try?')) {
                await fetch(`/auth/patch/${event.target.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/html" }
                }).then(() => { window.location.reload() })
            }
        }
    }
    if (event.target.classList == "devider-label") {
        console.log(getComputedStyle(event.target.nextElementSibling).display);
        getComputedStyle(event.target.nextElementSibling).display == 'grid' ? event.target.nextElementSibling.style.display = "none" : event.target.nextElementSibling.style.display = "grid";
    }
});
