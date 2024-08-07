import manhwaModel from '../models/Manhwa.js';
import getAllChapterLinks from './getAllChapterLinks.js';
import getAllChapterLinksDemon from './getAllChapterLinksDemon.js';
export default async function manhwaCheckUpdate(req, res, next, source) {
    let i = 0;
    let manhwasUpdate = [];
    let checkManhwas = await manhwaModel.getAllManhwasByOrigin(source + '%');
    let totalManhwas = checkManhwas.length;

    for (let checkManhwa of checkManhwas) {
        try {
            i++;
            await createSingle(checkManhwa, i);
        } catch (error) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }
    return manhwasUpdate;

    async function createSingle(manhwa, nextManhwa) {
        try {
            let inter = (nextManhwa / totalManhwas) * 100;
            let progress = {};
            progress[source] = inter;
            if (res != null)
                res.write(`data: ${JSON.stringify({ progress })}\n\n`);
            let checkIfSaved = await manhwaModel.findSavedManhwa(manhwa.mid);

            let chapterLinks = [];
            let data;
            if (source == 'reaper')
                data = await checkReaperContents(manhwa);
            else if (source == 'flame')
                data = await checkFlameContents(manhwa);
            else if (source == 'mgdemon')
                data = await checkMgdemonContents(manhwa);

            if (data == undefined)
                return false

            if (parseFloat(data.chapter).toFixed(1) == 'NaN')
                return false;

            if (checkIfSaved.length > 0 && data.chapter != manhwa.chapters) {
                if (source == 'mgdemon')
                    chapterLinks = await getAllChapterLinksDemon(manhwa.mid, data.jsonSingle, manhwa.slug.slice(0, -5));
                else
                    chapterLinks = await getAllChapterLinks(manhwa.mid, data.jsonSingle, manhwa);
            }
            //Fix status when site didn't
            data.status = await checkStatus(data.status.trim(), chapterLinks, data.chapter);
            if (!data.status)
                return false;

            data.chapter = chapterLinks.length != 0 ? chapterLinks[0].number : data.chapter;
            data.genres = data.genres.slice(2);
            data.status = data.status.trim();

            await createNewObj(manhwa, data.chapter, data.description, data.genres, data.status, chapterLinks, checkIfSaved);
        } catch (e) {
            console.log(e);
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }

    async function checkStatus(status, chapterLinks, chapter) {
        if (status == 'Dropped')
            return false;
        if ((chapterLinks.length < 1 && isNaN(chapter)))
            chapter = 0;
        if (chapter % 1 !== 0 || (chapterLinks.length > 0 && chapterLinks[0].number % 1 !== 0))
            status = 'Hiatus'
        if (chapter == 0)
            status = 'Comming Soon'
        return status;
    }

    async function createNewObj(manhwa, chapter, description, genres, status, chapterLinks, checkIfSaved) {
        let newObj = {
            title: manhwa.title,
            mid: manhwa.mid,
            description: description,
            slug: manhwa.slug,
            media: 404,
            image: manhwa.image,
            chapters: chapter,
            baseurl: manhwa.baseurl,
            genres: genres,
            lastUpdate: manhwa.lastUpdate,
            status: status,
            manhwaChapters: chapterLinks
        }
        let update = await checkUpdate(newObj, manhwa);
        if (update != false)
            manhwasUpdate.push(newObj);
    }

    async function checkUpdate(fetchManhwa, existManhwa) {
        if (parseFloat(fetchManhwa.chapters).toFixed(1) == parseFloat(existManhwa.chapters).toFixed(1) && fetchManhwa.status.trim().toLowerCase() == existManhwa.status.trim().toLowerCase())
            return false;
        return fetchManhwa;
    }

    async function checkReaperContents(manhwa) {
        try {
            let responseSingle = await fetch(`${manhwa.baseurl}series/${manhwa.slug}/`);
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
                let chapter;
                let chapterSlice = jsonSingle.slice(jsonSingle.search('<span class="epcur epcurlast">'), jsonSingle.search('<span class="epcur epcurlast">') + 80);
                chapter = chapterSlice.split(' ')[3].split('<')[0];
                return { genres, description, status, chapter, jsonSingle };
            }
        } catch (err) {
            console.log(err);
            res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
            res.end();
        }
    }

    async function checkFlameContents(manhwa) {
        try {
            let responseSingle = await fetch(`${manhwa.baseurl}series/${manhwa.slug}/`);
            if (responseSingle.status === 200) {
                let jsonSingle = await responseSingle.text();
                //Get genres
                let genreSlice = jsonSingle.slice(jsonSingle.search('class="mgen"'), jsonSingle.search('<div class="summary">'));
                genreSlice = genreSlice.split('">')
                let genres = [];
                genreSlice.forEach(genre => genres.push(genre.split('</')[0]));
                //Get description
                let descriptionSlice = jsonSingle.slice(jsonSingle.search('<div class="entry-content entry-content-single" itemprop="description">'), jsonSingle.search('<div class="see-more">'));
                let description = descriptionSlice.replace(/(<([^>]+)>)/gi, "");
                //Get status
                let statusSlice = jsonSingle.slice(jsonSingle.search('class="status"'), jsonSingle.search('class="status"') + 100);
                let status = statusSlice.split('>')[4].split('<')[0];
                //Get chapters links
                let chapter;
                let chapterSlice = jsonSingle.slice(jsonSingle.search('<span class="epcur epcurlast">'), jsonSingle.search('<span class="epcur epcurlast">') + 80);
                chapter = chapterSlice.split(' ')[3].split('<')[0];
                return { genres, description, status, chapter, jsonSingle };
            }
        } catch (err) {
            console.log(err);
            res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
            res.end();
        }
    }

    async function checkMgdemonContents(manhwa) {
        try {
            let responseSingle = await fetch(`https://mgdemon.org/manga/${manhwa.slug}/`);
            let jsonSingle = await responseSingle.text();
            //Get genres from site
            let genreSlice = jsonSingle.slice(jsonSingle.search('class="categories"'), jsonSingle.search('class="author"'));
            genreSlice = genreSlice.replace(/<[^>]*>?/gm, '').split('\n');
            let genres = [];
            genreSlice.forEach(genre => genre.length > 2 ? genres.push(genre) : false);
            //Get chapters from site
            let chapterSlice = jsonSingle.slice(jsonSingle.search('<strong class="chapter-title">'), jsonSingle.search('<strong class="chapter-title">') + 80);
            let chapter = chapterSlice.replace(/[^0-9]/g, '');
            //Get status from site
            let statusSlice = jsonSingle.slice(jsonSingle.search('<small>Status</small>'), jsonSingle.search('<small>Status</small>') + 80);
            let status = statusSlice.replace(/<[^>]*>?/gm, '').split('\n')[1];
            //Get description from site
            let descriptionSlice = jsonSingle.slice(jsonSingle.search('<p class="description">'), jsonSingle.search('<section id="chapters" class="on">'));
            let description = descriptionSlice.replace(/<[^>]*>?/gm, '').replace(/(\r\n|\n|\r)/gm, "");
            //Check if new chapters need to be fetched.
            return { genres, description, status, chapter, jsonSingle };
        } catch (err) {
            console.log(err);
            res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
            res.end();
        }
    }

    // async function searchMgdemonChapters(content, name) {
    //     //Get chapters links
    //     let chapterLinks = [];
    //     content.slice(content.search('class="chapter-list"'));
    //     let allNumber = content.split('data-chapterno="');
    //     for (let number of allNumber) {
    //         let chapterNum = number.split('"')[0];
    //         if (!isNaN(parseFloat(chapterNum)))
    //             chapterLinks.push({ link: `https://mgdemon.org/manga/${name}/chapter/${chapterNum}-VA54`, number: chapterNum })
    //     }
    //     return chapterLinks;
    // }

    // async function searchChapters(jsonSingle, manhwa) {
    //     //Get chapters links
    //     let chapterLinks = [];
    //     let reg = new RegExp(String.raw`href=".*?-chapter.*?"`, "gi");
    //     let chapterLinksRaw = jsonSingle.match(reg).join('').replaceAll('"', '').split('href=');

    //     for (let chapterLink of chapterLinksRaw) {
    //         try {
    //             let number
    //             if (chapterLink != "") {
    //                 number = parseFloat(chapterLink.split('chapter').pop().slice(0, -1).substring(1).replace(/-/g, '.').match(/\b\d+(?:.\d+)?/, '')[0]).toFixed(1);
    //                 chapterLinks.push({ link: chapterLink, number })
    //             }
    //         } catch (e) {
    //             console.log(e);
    //         }
    //     };
    //     return chapterLinks;
    // }
}