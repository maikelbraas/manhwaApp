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
        let checkManhwa = ["fdsfdsdfs"];
        let checkIfSaved;
        nextManhwa++;
        let inter = (nextManhwa / totalManhwas) * 100;
        res.write(`data: ${JSON.stringify({ progress: { asura: 100, reaper: inter } })}\n\n`);
        if (manhwa.count == 0 || manhwa.slug == "uncategorized")
            return false;
        if (manhwa.hasOwnProperty('id')) {
            checkManhwa = await manhwaModel.findManhwaById("reaper-" + manhwa.id);
            checkIfSaved = await manhwaModel.findSavedManhwa("reaper-" + manhwa.id, req.user.id)
            // if (checkManhwa.length == 0)
            //     checkManhwa = await manhwaModel.findManhwaBySlug(manhwa.slug);
            // if (checkManhwa.length == 0)
            //     checkManhwa = await manhwaModel.findManhwaByTitle(manhwa.name);
        }
        if (checkManhwa.length > 0)
            return false;
        let responseSingle = await fetch(`https://reaper-scans.com/manga/${manhwa.slug}/`);
        if (responseSingle.status == 200) {
            let jsonSingle = await responseSingle.text();
            //Get chapters
            // let chapterSlice = jsonSingle.slice(jsonSingle.search(' epcurlast"'), jsonSingle.search(' epcurlast"') + 30);
            // let chapter = chapterSlice.split(' ', 3)[2].split('<', 1);
            //Get genres
            let genreSlice = jsonSingle.slice(jsonSingle.search('class="seriestugenre"'), jsonSingle.search('<div class="adall">'));
            genreSlice = genreSlice.split('">')
            let genres = [];
            genreSlice.forEach(genre => genres.push(genre.split('</')[0]));
            //Get description
            let descriptionSlice = jsonSingle.slice(jsonSingle.search('itemprop="description">') + 23, jsonSingle.search('<div class="lastend">'));
            let description = descriptionSlice.replace(/(<([^>]+)>)/gi, "");
            //Get image
            let imageSlice = jsonSingle.slice(jsonSingle.search('itemprop="image"'), jsonSingle.search('fetchpriority="high"'));
            let [image] = imageSlice.split('src="https://', 3)[1].split('"', 1);
            //Get status
            let statusSlice = jsonSingle.slice(jsonSingle.search('<td>Status</td>'), jsonSingle.search('<td>Status</td>') + 35);
            let status = statusSlice.split('>')[3].split('<')[0];
            //Get chapters links
            let chapterLinks = [];
            let chaptersAmound = 0;
            if (checkIfSaved.length > 0) {
                let chapterLinkSlice;
                chapterLinkSlice = jsonSingle.slice(jsonSingle.search('<div class="eplister" id="chapterlist">'), jsonSingle.search('var chapterSearchNotFound'));
                let splitted = chapterLinkSlice.split('<li data-num="');

                splitted.shift();
                for (let splits of splitted) {
                    chaptersAmound++;
                    try {
                        let link = splits.split('href=')[1].split('"')[1];
                        let number = parseFloat(splits.split(' ')[0].split('"')[0]);
                        let findChapter = await manhwaModel.findChapterByMidAndLink("reaper-" + manhwa.id, link);
                        if (findChapter.length == 0)
                            chapterLinks.push({ link, number })
                    } catch (e) {
                        console.log(e);
                    }
                }
            }

            console.log(chaptersAmound);
            manhwa.chapters = chaptersAmound != 0 ? chaptersAmound : manhwa.count;
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
    }
}