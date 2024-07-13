import fs from 'fs';

export default async function readFromJson(req, res, next) {
    await fs.readFile('public/json/manhwas.json', 'utf8', (err, data) => {
        if (err) console.log(err)

        const jsonData = JSON.parse(data);

        res.send(jsonData);
    });
}