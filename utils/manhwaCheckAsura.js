import manhwaModel from '../models/Manhwa.js';
export default async function manhwaCheck(req, res, next) {
    let i = 1;
    let response;
    let manhwas = [];
    let totalManhwas;
    let nextManhwa = 0;
    do {
        try {
            response = await fetch(`https://asuratoon.com/wp-json/wp/v2/manga?page=${i}`);
            if (i == 1)
                totalManhwas = response.headers.get('x-wp-total');
            let json = await response.json();
            if (Array.isArray(json)) {
                for (let j of json)
                    await checkSingle(j);
            } else {
                await checkSingle(json);
            }
            i++;

        } catch (error) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    } while (response.status == 200);
    return manhwas;

    async function checkSingle(manhwa) {
        let checkManhwa = ["fdsfdsdfs"];
        let checkIfSaved;
        nextManhwa++;
        let inter = (nextManhwa / totalManhwas) * 100;
        res.write(`data: ${JSON.stringify({ progress: { asura: inter, reaper: 0 } })}\n\n`);
        if (manhwa.hasOwnProperty('id')) {
            checkManhwa = await manhwaModel.findManhwaById("asura-" + manhwa.id);
            checkIfSaved = await manhwaModel.findSavedManhwa("asura-" + manhwa.id, req.user.id)
        }
        if (checkManhwa.length > 0)
            return false;
        let responseSingle = await fetch(`https://asuratoon.com/${manhwa.slug}`);
        let jsonSingle = await responseSingle.text();
        //get chapters
        let chapterSlice = jsonSingle.slice(jsonSingle.search('epcurlast'), jsonSingle.search('epcurlast') + 30);
        let chapter = chapterSlice.split('<', 2)[0].split(' ', 2);
        let genreSlice = jsonSingle.slice(jsonSingle.search('Genres'), jsonSingle.search('<div class="bottom">'));
        genreSlice = genreSlice.split('">')
        let genres = [];
        genreSlice.forEach(genre => genres.push(genre.split('</')[0]));
        //Get status
        let statusSlice = jsonSingle.slice(jsonSingle.search('Status <i>'), jsonSingle.search('Status <i>') + 30);
        let status = statusSlice.split('>')[1].split('<')[0];
        //Get chapters links
        let chapterLinks = [];
        if (checkIfSaved.length > 0) {
            let chapterLinkSlice;
            chapterLinkSlice = jsonSingle.slice(jsonSingle.search('<div class="eplister" id="chapterlist">'), jsonSingle.search('var chapterSearchNotFound'));
            let splitted = chapterLinkSlice.split('<li data-num="');
            splitted.shift();
            for (let splits of splitted) {
                try {
                    let link = splits.split('href=')[1].split('"')[1];
                    let number = parseFloat(splits.split(' ')[0].split('"')[0])
                    let findChapter = await manhwaModel.findChapterByMidAndLink("reaper-" + manhwa.id, link);
                    if (findChapter.length == 0)
                        chapterLinks.push({ link, number })
                } catch (e) {
                    console.log(e);
                }
            }
        }


        manhwa.chapters = parseInt(chapter[1]);
        manhwa.content.rendered = manhwa.content.rendered.replace(/(<([^>]+)>)/gi, "");
        manhwa.genres = genres.slice(2);
        manhwa.baseurl = "https://asuratoon.com/";
        manhwa.status = status;
        let newObj = {
            title: manhwa.title.rendered,
            mid: "asura-" + manhwa.id,
            description: manhwa.content.rendered,
            slug: manhwa.slug,
            media: manhwa.featured_media,
            image: manhwa.images.large,
            chapters: manhwa.chapters,
            baseurl: manhwa.baseurl,
            genres: manhwa.genres,
            lastUpdate: manhwa.lastUpdate,
            status: manhwa.status,
            manhwaChapters: chapterLinks
        }
        manhwas.push(newObj);
    }
}