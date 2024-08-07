import manhwaModel from '../models/Manhwa.js';
export default async function manhwaCheck(req, res, next, baseurl, source) {
    let i = 1;
    let manhwasNew = [];
    let totalManhwas;
    let json;
    let response;
    let nextManhwa = 0;

    do {
        try {
            response = await fetch(`${baseurl}wp-json/wp/v2/categories?page=${i}`);
            if (i == 1)
                totalManhwas = response.headers.get('x-wp-total');
            json = await response.json();
            for (let next = 0; next < json.length; next++) {
                if (typeof json[next] === 'object' && !Array.isArray(json[next]) && json[next] !== null && json[next] !== undefined) {
                    await checkSingle(json[next]);
                }
            }
            i++;
        } catch (error) {
            res.write(`data: ${JSON.stringify({ progress: 100, error, i, json })}\n\n`);
            res.end();
        }
    } while (response.status == 200 && json.length > 0);

    return manhwasNew;

    async function checkSingle(manhwa) {
        try {
            let checkManhwa = [];
            nextManhwa++;
            let inter = (nextManhwa / totalManhwas) * 100;
            let progress = {};
            manhwa.baseurl = baseurl;
            progress[source] = inter;
            if (res != null)
                res.write(`data: ${JSON.stringify({ progress })}\n\n`);
            if (manhwa.count == 0 || manhwa.slug == "uncategorized")
                return false;
            if (manhwa.hasOwnProperty('id')) {
                checkManhwa = await manhwaModel.findManhwaById(source + '-' + manhwa.id);
            }
            if (checkManhwa.length > 0)
                return false;

            //Crawl pages and get needed data
            let data;
            if (source == 'reaper')
                data = await checkReaperContents(manhwa);
            else if (source == 'flame') {
                data = await checkFlameContents(manhwa);
            }
            //If manhwa page doesn't exists
            if (data == undefined)
                return false;

            //If the chapter isn't a float
            if (parseFloat(data.chapter).toFixed(1) == 'NaN')
                return false;

            //Fix status when site didn't
            data.manhwaStatus = await checkStatus(data.manhwaStatus.trim(), data.chapter);
            if (!data.manhwaStatus)
                return false;

            data.genres = data.genres.slice(2);
            data.manhwaStatus = data.manhwaStatus.trim();
            manhwa.image = 'https://' + data.image;

            await createNewObj(manhwa, data.chapter, data.description, data.genres, data.manhwaStatus);
        } catch (e) {
            console.log(e);
            res.write(`data: ${JSON.stringify({ error: e })}\n\n`);
            res.end();
        }
    }

    async function checkStatus(manhwaStatus, chapter) {
        if (manhwaStatus == 'Dropped')
            return false;
        if (isNaN(chapter))
            chapter = 0;
        if (chapter % 1 !== 0)
            manhwaStatus = 'Hiatus'
        if (chapter == 0)
            manhwaStatus = 'Comming Soon'
        return manhwaStatus;
    }

    async function createNewObj(manhwa, chapter, description, genres, manhwaStatus) {
        let newObj = {
            title: manhwa.name,
            mid: source + '-' + manhwa.id,
            description: description,
            slug: manhwa.slug,
            media: 404,
            image: manhwa.image,
            chapters: chapter,
            baseurl: manhwa.baseurl,
            genres: genres,
            lastUpdate: manhwa.lastUpdate,
            status: manhwaStatus,
            manhwaChapters: []
        }
        manhwasNew.push(newObj);
    }

    async function checkReaperContents(manhwa) {
        try {
            let responseSingle = await fetch(`${baseurl}series/${manhwa.slug}/`);
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
                //Get image
                let imageSlice = jsonSingle.slice(jsonSingle.search('itemprop="image"'), jsonSingle.search('fetchpriority="high"'));
                let [image] = imageSlice.split('src="https://', 3)[1].split('"', 1);
                //Get description
                let descriptionSlice = jsonSingle.slice(jsonSingle.search('itemprop="description">') + 23, jsonSingle.search('<div class="lastend">'));
                let description = descriptionSlice.replace(/(<([^>]+)>)/gi, "");
                //Get status
                let statusSlice = jsonSingle.slice(jsonSingle.search('<div class="status-value">'), jsonSingle.search('<div class="status-value">') + 50);
                let manhwaStatus = statusSlice.split('>')[1].split('<')[0];
                //Get chapters links
                let chapter;
                let chapterSlice = jsonSingle.slice(jsonSingle.search('<span class="epcur epcurlast">'), jsonSingle.search('<span class="epcur epcurlast">') + 80);
                chapter = chapterSlice.split(' ')[3].split('<')[0];
                return { genres, description, manhwaStatus, chapter, image };
            }
        } catch (err) {
            console.log(err);
            res.write(`data: ${JSON.stringify({ progress: 100, error: err })}\n\n`);
            res.end();
        }
    }

    async function checkFlameContents(manhwa) {
        try {
            let responseSingle = await fetch(`${baseurl}series/${manhwa.slug}/`);
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
                //Get image
                let imageSlice = jsonSingle.slice(jsonSingle.search('itemprop="image"'), jsonSingle.search('decoding="async"'));
                let [image] = imageSlice.split('src="https://', 3)[1].split('"', 1);
                //Get status
                let statusSlice = jsonSingle.slice(jsonSingle.search('class="status"'), jsonSingle.search('class="status"') + 100);
                let manhwaStatus = statusSlice.split('>')[4].split('<')[0];
                //Get chapters links
                let chapter;
                let chapterSlice = jsonSingle.slice(jsonSingle.search('<span class="epcur epcurlast">'), jsonSingle.search('<span class="epcur epcurlast">') + 80);
                chapter = chapterSlice.split(' ')[3].split('<')[0];
                return { genres, description, manhwaStatus, chapter, image };
            }
        } catch (err) {
            console.log(err);
            res.write(`data: ${JSON.stringify({ progress: 100, error: err })}\n\n`);
            res.end();
        }
    }
}