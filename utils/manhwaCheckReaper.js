import manhwaModel from '../models/Manhwa.js';
export default async function manhwaCheckReaper(req, res, next) {
    let i = 1;
    let response;
    let manhwas = [];
    let json;
    let totalManhwas;
    let nextManhwa = 0;
    do {
        try {
            response = await fetch(`https://reaper-scans.com/wp-json/wp/v2/categories?page=${i}`);
            if (i == 1)
                totalManhwas = response.headers.get('x-wp-total');
            json = await response.json();
            if (Array.isArray(json)) {
                for (let j of json)
                    await checkSingle(j);
            } else {
                await checkSingle(json);
            }
            i++;
        } catch (error) {
            res.write(`data: ${JSON.stringify({ error: error.message, json })}\n\n`);
            res.end();
        }
    } while (response.status == 200 && json.length > 0);
    return manhwas;

    async function checkSingle(manhwa) {
        try {
            let checkManhwa = ["fdsfdsdfs"];
            let checkIfSaved;
            nextManhwa++;
            let inter = (nextManhwa / totalManhwas) * 100;
            res.write(`data: ${JSON.stringify({ progress: { asura: 100, reaper: inter, flame: 0 } })}\n\n`);
            if (manhwa.count == 0 || manhwa.slug == "uncategorized")
                return false;
            if (manhwa.hasOwnProperty('id')) {
                checkManhwa = await manhwaModel.findManhwaById("reaper-" + manhwa.id);
                checkIfSaved = await manhwaModel.findSavedManhwa("reaper-" + manhwa.id, req.user.id)
            }
            if (checkManhwa.length > 0)
                return false;
            let responseSingle = await fetch(`https://reaper-scans.com/manga/${manhwa.slug}/`);
            if (responseSingle.status == 200) {
                let jsonSingle = await responseSingle.text();
                //Get genres
                let genreSlice = jsonSingle.slice(jsonSingle.search('class="seriestugenre"'), jsonSingle.search('<div class="entry-content entry-content-single" itemprop="description">'));
                genreSlice = genreSlice.split('">');
                let genres = [];
                genreSlice.forEach(genre => genres.push(genre.split('</')[0]));
                if (genres[genres.length - 1].startsWith('\n')) {
                    genres.splice(genres.length - 1, 1);
                }
                //Get description
                let descriptionSlice = jsonSingle.slice(jsonSingle.search('itemprop="description">') + 23, jsonSingle.search('<div class="lastend">'));
                let description = descriptionSlice.replace(/(<([^>]+)>)/gi, "");
                //Get image
                let imageSlice = jsonSingle.slice(jsonSingle.search('itemprop="image"'), jsonSingle.search('fetchpriority="high"'));
                let [image] = imageSlice.split('src="https://', 3)[1].split('"', 1);
                //Get status
                let statusSlice = jsonSingle.slice(jsonSingle.search('<div class="status-value">'), jsonSingle.search('<div class="status-value">') + 50);
                let status = statusSlice.split('>')[1].split('<')[0];
                //Get chapters links
                let chapterLinks = [];
                if (checkIfSaved.length > 0)
                    chapterLinks = await searchChapters(manhwa.id);

                manhwa.chapters = chapterLinks.length != 0 ? chapterLinks[0].number : manhwa.count;
                manhwa.genres = genres.slice(2);
                manhwa.image = "https://" + image;
                manhwa.description = description;
                manhwa.baseurl = "https://reaper-scans.com/";
                manhwa.status = status;

                let newObj = {
                    title: manhwa.name,
                    mid: "reaper-" + manhwa.id,
                    description: manhwa.description,
                    slug: manhwa.slug,
                    media: 404,
                    image: manhwa.image,
                    chapters: manhwa.chapters,
                    baseurl: manhwa.baseurl,
                    genres: manhwa.genres,
                    lastUpdate: manhwa.lastUpdate,
                    status: manhwa.status,
                    manhwaChapters: chapterLinks
                }
                manhwas.push(newObj);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function searchChapters(id) {
        //Get chapters links
        let chaptersFromManhwas;
        let chapterChunkOfManhwa;
        let page = 1;
        let chapterLinks = [];
        do {
            try {
                chaptersFromManhwas = await fetch(`https://reaper-scans.com/wp-json/wp/v2/posts?categories=${id}&page=${page}`)
                chapterChunkOfManhwa = await chaptersFromManhwas.json();
                if (chapterChunkOfManhwa.length > 0)
                    for (let chunk of chapterChunkOfManhwa) {
                        let number = chunk.title.rendered.split(' ').pop();
                        chapterLinks.push({ link: chunk.link, number })
                    }
            } catch (e) {
                console.log(e);
            }
            page++;
        } while (chaptersFromManhwas.status == 200 && chapterChunkOfManhwa.length > 0);
        return chapterLinks;
    }
}