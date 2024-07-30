import manhwaModel from '../models/Manhwa.js';
export default async function manhwaCheck(req, res, next) {
    let i = 0;
    let response;
    let text;
    let manga = req.params.id;
    let manhwa = false;
    try {
        response = await fetch(`https://mgdemon.org/search.php?manga=${manga}`);

        text = await response.text();
        if (text.length > 1)
            await checkSingle(text);
        else
            res.write(`data: ${JSON.stringify({ error: 'could not find manhwa' })}\n\n`);
        i++;
    } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message, json })}\n\n`);
        res.end();
    }
    return manhwa;

    async function checkSingle(checkSingleManhwa) {
        try {
            let checkManhwa = ["fdsfdsdfs"];
            let checkIfSaved;

            let src = checkSingleManhwa.split('href="')[1].split('>')[0].slice(0, -1);
            let name = checkSingleManhwa.split('>')[2].split('<')[0].slice(1);
            let nameencoded = encodeURIComponent(name.replaceAll("(", "%28").replaceAll(")", "%29").replaceAll("'", "%27").replaceAll(",", "%2C").replaceAll("!", "%21").replaceAll("?", "%3F").replaceAll("-", '%252D'));
            let slug = nameencoded.replaceAll('%20', '-') + "-VA54";
            let mid = name.replaceAll(' ', '-');
            // console.log(name);
            // console.log(src);
            checkManhwa = await manhwaModel.findManhwaById("mgdemon-" + mid);
            checkIfSaved = await manhwaModel.findSavedManhwa("mgdemon-" + mid, req.user.id)
            if (checkManhwa.length > 0)
                return false;


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
                mid: "mgdemon-" + mid,
                description: description,
                slug: slug,
                media: 404,
                image: image,
                chapters: chapter,
                baseurl: baseurl,
                genres: genres,
                status: status,
                manhwaChapters: chapterLinks
            }
            manhwa = newObj;

        } catch (e) {
            console.log(e);
        }
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