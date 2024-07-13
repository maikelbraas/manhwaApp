import manhwaModel from '../models/Manhwa.js';
export default async function checkSingle(mid) {
    try {
        let [manhwa] = await manhwaModel.findManhwaById(mid);
        let responseSingle = await fetch(`${manhwa.baseurl}manga/${manhwa.slug}`);
        let jsonSingle = await responseSingle.text();
        //Get chapters links
        let chapterLinks = [];
        let chapterLinkSlice;
        chapterLinkSlice = jsonSingle.slice(jsonSingle.search('<div class="eplister" id="chapterlist">'), jsonSingle.search('var chapterSearchNotFound'));
        let splitted = chapterLinkSlice.split('<li data-num="');
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
