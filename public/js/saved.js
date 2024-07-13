
document
    .querySelectorAll(".input-number")
    .forEach((x) => (x.autofocus = false));


document.querySelector('.manhwa-rows').addEventListener('click', async (event) => {
    if (event.target.id.includes('reaper') || event.target.id.includes('asura')) {
        if (confirm('Are you sure you want to delete the saved manhwa?')) {
            await fetch(`/auth/remove/${event.target.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/html" }
            }).then(() => { window.location.reload() })
        }
    }
});
