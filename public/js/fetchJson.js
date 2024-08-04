export default async function fetchManhwaFromJson() {
    try {
        let manhwas = await fetch('/json/manhwas.json');
        manhwas = await manhwas.json();
        localStorage.setItem('manhwas', JSON.stringify(manhwas));
        return;
    } catch (e) {
        console.log(e);
    }
}