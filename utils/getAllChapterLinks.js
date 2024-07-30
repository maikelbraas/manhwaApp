import manhwaModel from '../models/Manhwa.js';
export default async function checkSingle(mid) {
    try {
        let [manhwa] = await manhwaModel.findManhwaById(mid);
        let jsonSingle;
        let responseSingleOr;
        let responseSingle;
        if (manhwa.baseurl.includes('flame')) {
            responseSingleOr = await fetch(`${manhwa.baseurl}series/${manhwa.slug}`);
            jsonSingle = await responseSingleOr.text();
        } else {
            responseSingle = await fetch(`${manhwa.baseurl}manga/${manhwa.slug}`);
            jsonSingle = await responseSingle.text();
        }
        //Get chapters links
        let chapterLinks = [];
        let chapterLinkSlice = jsonSingle.slice(jsonSingle.search('<div class="eplister" id="chapterlist">'), jsonSingle.search('var chapterSearchNotFound'));
        let splitted = chapterLinkSlice.split('<li data-num="');
        splitted.shift();
        for (let splits of splitted) {
            try {
                let link = splits.split('href=')[1].split('"')[1];
                let number = parseFloat(splits.split(' ')[0].split('"')[0])
                let findChapter = await manhwaModel.findChapterByMidAndLink(manhwa.mid, link);
                if (findChapter.length == 0)
                    chapterLinks.push({ link, number })
            } catch (e) {
                console.log(e);
            }
        }
        return chapterLinks;
    } catch (e) {
        console.log(e);
        return false;
    }
}
