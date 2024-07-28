import manhwaModel from '../models/Manhwa.js';
export default async function manhwaCheck(req, res, next, manhwasAll) {
    let manhwasCheck = manhwasAll;
    let manhwas = [];
    let nextManhwa = 0;
    let totalManhwas = manhwasCheck.length;
    for (let singleManhwaCheck of manhwasCheck) {
        try {
            // console.log(singleManhwaCheck)
            await checkSingle(singleManhwaCheck);
        } catch (error) {
            res.write(`data: ${JSON.stringify({ error: error.message, json })}\n\n`);
            res.end();
        }
    }
    return manhwas;

    async function checkSingle(checkSingleManhwa) {
        try {
            let checkIfSaved;

            nextManhwa++;
            let inter = (nextManhwa / totalManhwas) * 100;
            res.write(`data: ${JSON.stringify({ progress: { asura: 100, reaper: 100, flame: 100, demon: inter } })}\n\n`);
            let src = "manga/" + checkSingleManhwa.slug;
            let name = checkSingleManhwa.title;
            let slug = checkSingleManhwa.slug;
            let mid = checkSingleManhwa.mid;
            checkIfSaved = await manhwaModel.findSavedManhwa("mgdemon-" + mid, req.user.id);

            let responseSingle = await fetch(`https://mgdemon.org/${src}/`);
            let single = await responseSingle.text();
            // console.log(single);

            let genreSlice = single.slice(single.search('class="categories"'), single.search('class="author"'));
            genreSlice = genreSlice.replace(/<[^>]*>?/gm, '').split('\n');
            let genres = [];
            genreSlice.forEach(genre => genre.length > 2 ? genres.push(genre) : false);
            genres.splice(0, 2)
            // console.log(genres);
            let chapterSlice = single.slice(single.search('<strong class="chapter-title">'), single.search('<strong class="chapter-title">') + 80);
            let chapter = chapterSlice.replace(/[^0-9]/g, '');
            // console.log(chapter);
            let statusSlice = single.slice(single.search('<small>Status</small>'), single.search('<small>Status</small>') + 80);
            let status = statusSlice.replace(/<[^>]*>?/gm, '').split('\n')[1];
            // console.log(status);
            let imageSlice = single.slice(single.search('src="https://readermc.org/images/thumbnails/'), single.search('src="https://readermc.org/images/thumbnails/') + 200);
            let image = imageSlice.replace(/<[^>]*>?/gm, '').split('"')[1];
            // console.log(image);
            let baseurl = "https://mgdemon.org/";
            // console.log(slug);
            let descriptionSlice = single.slice(single.search('<p class="description">'), single.search('<section id="chapters" class="on">'));
            let description = descriptionSlice.replace(/<[^>]*>?/gm, '').replace(/(\r\n|\n|\r)/gm, "");
            // console.log(description);
            let chapterLinks = [];
            if (checkIfSaved.length > 0)
                chapterLinks = await searchChapters(single, mid)
            // console.log(chapterLinks);

            let newObj = {
                title: name,
                mid: mid,
                description: description,
                slug: slug,
                media: 404,
                image: image,
                chapters: parseFloat(chapter),
                baseurl: baseurl,
                genres: genres,
                status: status,
                manhwaChapters: chapterLinks
            }
            // console.log(newObj);
            let update = await checkUpdate(newObj, checkSingleManhwa);
            if (update != false)
                manhwas.push(newObj);

        } catch (e) {
            console.log(e);
        }
    }

    async function checkUpdate(fetchManhwa, existManhwa) {
        // console.log(fetchManhwa.chapters, existManhwa[0].chapters);
        if (fetchManhwa.chapters == existManhwa.chapters && fetchManhwa.status == existManhwa.status)
            return false;
        return fetchManhwa;
    }

    async function searchChapters(content, name) {
        //Get chapters links
        let chapterLinks = [];
        content.slice(content.search('class="chapter-list"'));
        let allNumber = content.split('data-chapterno="');
        for (let number of allNumber) {
            let chapterNum = number.split('"')[0];
            if (!isNaN(parseFloat(chapterNum)))
                chapterLinks.push({ link: `https://mgdemon.org/manga/${name}/chapter/${chapterNum}-VA54`, number: chapterNum })
        }
        return chapterLinks;
    }
}