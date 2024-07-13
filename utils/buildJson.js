import fs from 'fs';

export default async function buildJson(manhwas) {
    await fs.writeFile('public/json/manhwas.json', JSON.stringify(manhwas, null, 2), 'utf8', (err) => {
        if (err) throw err
        console.log('complete');
    });

}