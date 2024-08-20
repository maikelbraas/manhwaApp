import manhwaModel from '../models/Manhwa.js';
export default async function checkChapterLinks(mid, jsonSingle, manhwa) {
    try {
        if (manhwa == null)
            [manhwa] = await manhwaModel.findManhwaById(mid);
        if (jsonSingle == null) {
            let responseSingleOr = await fetch(`${manhwa.baseurl}series/${manhwa.slug}`);
            if (responseSingleOr.status != 200) return [];
            jsonSingle = await responseSingleOr.text();
        }
        //Get chapters links
        let chapterLinks = [];
        let reg = new RegExp(String.raw`href=".*?-chapter.*?"`, "gi");
        let chapterLinksRaw = jsonSingle.match(reg).join('').replaceAll('"', '').split('href=');
        for (let splits of chapterLinksRaw) {
            try {
                if (splits != "") {
                    let number = parseFloat(splits.split('chapter').pop().slice(0, -1).substring(1).replace(/-/g, '.').match(/\b\d+(?:.\d+)?/, '')[0]).toFixed(1);
                    let findChapter = await manhwaModel.findChapterByMidAndLink(manhwa.mid, splits);
                    if (findChapter.length == 0)
                        chapterLinks.push({ link: splits, number })
                }
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
