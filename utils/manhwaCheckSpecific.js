import manhwaModel from '../models/Manhwa.js';
export default async function manhwaCheck(req, res, next) {
    let i = 0;
    let response;
    let text;
    let manga = req.params.id;
    console.log(manga);
    let manhwa = false;
    try {
        response = await fetch(`https://mgdemon.org/manga/${manga}`);

        text = await response.text();
        if (text.length > 1)
            await checkSingle(text);
        else
            res.write(`data: ${JSON.stringify({ error: 'could not find manhwa' })}\n\n`);
        i++;
    } catch (error) {
        console.log(error);
        res.write(`data: ${JSON.stringify({ error: error.message, json })}\n\n`);
        res.end();
    }
    return manhwa;

    async function checkSingle(checkSingleManhwa) {
        try {
            let checkManhwa = ["fdsfdsdfs"];

            let name = manga.slice(0, -5).replaceAll('-', ' ');
            name = name.replace("25", '').replaceAll("%28", "(").replaceAll("%29", ")").replaceAll("%27", "'").replaceAll("%2C", ",").replaceAll("%21", "!").replaceAll("%3F", "?").replaceAll("%2D", '-').replaceAll("%3A", ':');
            let slug = manga;
            let mid = encodeURIComponent(name.replaceAll(' ', '-').replaceAll("'", ""));
            checkManhwa = await manhwaModel.findManhwaById("mgdemon-" + mid);
            if (checkManhwa.length > 0)
                return false;


            let single = checkSingleManhwa;

            let genreSlice = single.slice(single.search('class="categories"'), single.search('class="author"'));
            genreSlice = genreSlice.replace(/<[^>]*>?/gm, '').split('\n');
            let genres = [];
            genreSlice.forEach(genre => genre.length > 2 ? genres.push(genre) : false);
            genres.splice(0, 2)
            let chapterSlice = single.slice(single.search('<strong class="chapter-title">'), single.search('<strong class="chapter-title">') + 80);
            let chapter = chapterSlice.replace(/[^0-9]/g, '');
            let statusSlice = single.slice(single.search('<small>Status</small>'), single.search('<small>Status</small>') + 80);
            let status = statusSlice.replace(/<[^>]*>?/gm, '').split('\n')[1];
            let imageSlice = single.slice(single.search('src="https://readermc.org/images/thumbnails/'), single.search('src="https://readermc.org/images/thumbnails/') + 200);
            let image = imageSlice.replace(/<[^>]*>?/gm, '').split('"')[1];
            let baseurl = "https://mgdemon.org/";
            let descriptionSlice = single.slice(single.search('<p class="description">'), single.search('<section id="chapters" class="on">'));
            let description = descriptionSlice.replace(/<[^>]*>?/gm, '').replace(/(\r\n|\n|\r)/gm, "");

            let newObj = {
                title: name,
                mid: "mgdemon-" + mid,
                description: description,
                slug: slug,
                media: 404,
                image: image,
                chapters: chapter,
                baseurl: baseurl,
                genres: genres,
                status: status,
                manhwaChapters: []
            }
            manhwa = newObj;

        } catch (e) {
            console.log(e);
        }
    }
}