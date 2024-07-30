import fs from 'fs';

export default async function writeToJson(manhwaAsura, manhwaReaper) {
    let manhwas = manhwaAsura.concat(manhwaReaper);
    await fs.readFile('public/json/manhwas.json', 'utf8', (err, data) => {
        if (err) console.log(err)

        const jsonData = JSON.parse(data);
        const manhwasData = jsonData.concat(manhwas);
        fs.writeFile('public/json/manhwas.json', JSON.stringify(manhwasData, null, 2), 'utf8', (err) => {
            if (err) throw err
        });
    });

}