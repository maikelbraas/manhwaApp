import manhwaModel from '../models/Manhwa.js';
import { ZenRows } from 'zenrows';
export default async function manhwaCheckAsuraUpdate(req, res, next) {
    let i = 1;
    let nextManhwa = 0;
    let response;
    let json;
    let manhwas = [];
    let totalManhwas;

    do {
        try {
            response = await fetch(`https://asura-scans.com/wp-json/wp/v2/categories?page=${i}`);

            // const client = new ZenRows("74a4f2fec85a4b8ed0ce4fd0db65b7fd0aa008d5");
            // const url = `https://asuratoon.com/wp-json/wp/v2/manga?page=${i}`;

            // response = await client.get(url, { "premium_proxy": "true" });
            // const json = await response.json();
            // console.log(response);
            if (i == 1)
                totalManhwas = response.headers.get('x-wp-total');
            json = await response.json();
            if (Array.isArray(json)) {
                for (let j of json)
                    if (typeof j.id != 'undefined')
                        await createSingle(j);
            } else {
                if (typeof json.id != 'undefined')
                    await createSingle(json);
            }
            i++;

        } catch (error) {
            console.log(error);
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
            res.write(`data: ${JSON.stringify({ progress: { asura: inter, reaper: 0, flame: 0 } })}\n\n`);
            if (manhwa.hasOwnProperty('id')) {
                checkManhwa = await manhwaModel.findManhwaById("asura-" + manhwa.id);
                checkIfSaved = await manhwaModel.findSavedManhwa("asura-" + manhwa.id, req.user.id)
            }
            if (checkManhwa.length == 0)
                return false;
            let responseSingle = await fetch(`https://asura-scans.com/manga/${manhwa.slug}`);
            let jsonSingle = await responseSingle.text();
            //Get genres
            let genreSlice = jsonSingle.slice(jsonSingle.search('class="seriestugenre"'), jsonSingle.search('class="sharethis-inline-share-buttons"'));
            genreSlice = genreSlice.split('">')
            let genres = [];
            genreSlice.forEach(genre => genres.push(genre.split('</')[0]));
            genres.splice(0, 2)
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
            if (checkIfSaved.length > 0 && manhwa.count != checkManhwa[0].chapters)
                chapterLinks = await searchChapters(manhwa.id);

            manhwa.chapters = chapterLinks.length != 0 ? chapterLinks[0].number : manhwa.count;
            manhwa.description = description;
            manhwa.genres = genres.slice(2);
            manhwa.image = "https://" + image;
            manhwa.baseurl = "https://asura-scans.com/";
            manhwa.status = status;
            let newObj = {
                title: manhwa.name,
                mid: "asura-" + manhwa.id,
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
            let update = await checkUpdate(newObj, checkManhwa);
            if (update != false)
                manhwas.push(update);
        } catch (e) {
            console.log(e);
        }
    }

    async function checkUpdate(fetchManhwa, existManhwa) {
        // console.log(fetchManhwa.chapters, existManhwa[0].chapters);
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
                chaptersFromManhwas = await fetch(`https://asura-scans.com/wp-json/wp/v2/posts?categories=${id}&page=${page}`)
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