document.getElementById('delete').addEventListener('click', async (event) => {
    if (confirm('Are you sure you want to delete your account?'))
        if (event.target.id == "delete") {
            await fetch(`/auth/deleteAccount`, {
                method: "DELETE",
                headers: { "Content-Type": "application/html" }
            }).then(() => { window.location.reload() })
        }
})