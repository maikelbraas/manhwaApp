import manhwaModel from '../models/Manhwa.js';
export default async function manhwaCheckReaperUpdate(req, res, next) {
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
                    await createSingle(j);
            } else {
                await createSingle(json);
            }
            i++;

        } catch (error) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    } while (response.status == 200 && json.length > 0);
    return manhwas;

    async function createSingle(manhwa) {
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
            if (checkManhwa.length == 0)
                return false;
            let responseSingle = await fetch(`https://reaper-scans.com/series/${manhwa.slug}/`);
            if (responseSingle.status === 200) {
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
                //Get status
                let statusSlice = jsonSingle.slice(jsonSingle.search('<div class="status-value">'), jsonSingle.search('<div class="status-value">') + 50);
                let status = statusSlice.split('>')[1].split('<')[0];
                //Get chapters links
                let chapterLinks = [];
                let chapter;
                let chapterSlice = jsonSingle.slice(jsonSingle.search('<span class="epcur epcurlast">'), jsonSingle.search('<span class="epcur epcurlast">') + 80);
                chapter = chapterSlice.split(' ')[3].split('<')[0];
                if (checkIfSaved.length > 0 && chapter != checkManhwa[0].chapters) {
                    chapterLinks = await searchChapters(manhwa.id);
                }
                if (status == 'Dropped')
                    return false;
                if ((chapterLinks.length < 1 && isNaN(chapter)))
                    chapter = 0;
                if (chapter % 1 !== 0 || (chapterLinks.length > 0 && chapterLinks[0].number % 1 !== 0))
                    status = 'Hiatus'
                if (chapter == 0)
                    status = 'Comming Soon'

                manhwa.chapters = chapterLinks.length != 0 ? chapterLinks[0].number : chapter;
                manhwa.genres = genres.slice(2);
                manhwa.description = description;
                manhwa.baseurl = "https://reaper-scans.com/";
                manhwa.status = status;

                let newObj = {
                    title: manhwa.name,
                    mid: "reaper-" + manhwa.id,
                    description: manhwa.description,
                    slug: manhwa.slug,
                    media: 404,
                    image: checkManhwa[0].image,
                    chapters: manhwa.chapters,
                    baseurl: manhwa.baseurl,
                    genres: manhwa.genres,
                    lastUpdate: manhwa.lastUpdate,
                    status: manhwa.status,
                    manhwaChapters: chapterLinks
                }
                let update = await checkUpdate(newObj, checkManhwa);
                if (update != false)
                    manhwas.push(update);

            }
        } catch (e) {
            console.log(e);
        }
    }
    async function checkUpdate(fetchManhwa, existManhwa) {
        // console.log(fetchManhwa.title, fetchManhwa.chapters, existManhwa[0].chapters);
        if (fetchManhwa.chapters == existManhwa[0].chapters && fetchManhwa.status == existManhwa[0].status)
            return false;
        return fetchManhwa;
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