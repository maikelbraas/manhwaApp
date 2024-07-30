import fs from 'fs';

export default async function writeToJson(manhwaAsura, manhwaReaper) {
    let manhwas = manhwaAsura.concat(manhwaReaper);
    await fs.readFile('public/json/manhwas.json', 'utf8', (err, data) => {
        if (err) console.log(err)

        const jsonData = JSON.parse(data);
        for (let manhwa of manhwas) {
            for (let data of jsonData) {
                if (manhwa.mid == data.mid) {
                    data.chapters = manhwa.chapters;
                    data.lastUpdate = manhwa.lastUpdate;
                }
            }
        }
        fs.writeFile('public/json/manhwas.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) throw err
        });
    });

}