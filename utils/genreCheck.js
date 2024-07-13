import genreModel from '../models/Genre.js'
export default async function genreCheck(req, res, next, manhwa) {
    if (manhwa.genres.length == 0)
        return false;
    await checkIfExistsOrCreate(manhwa.genres);
    await createGenreManhwa(manhwa);
    return;
    async function checkIfExistsOrCreate(genres) {
        for (let genre of genres) {
            let check = await genreModel.findGenreByName(genre);
            if (check.length === 0) {
                await genreModel.create(genre);
            }
        }
    }

    async function createGenreManhwa(manhwa) {
        for (let genre of manhwa.genres) {
            let [genreid] = await genreModel.findGenreByName(genre);
            await genreModel.createGenreManhwa(manhwa.mid, genreid.id);
        }
    }
}