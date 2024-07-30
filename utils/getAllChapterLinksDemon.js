import manhwaModel from '../models/Manhwa.js';
export default async function checkSingle(mid) {
    try {
        let [manhwa] = await manhwaModel.findManhwaById(mid);
        let name = manhwa.slug.slice(0, -5);
        let responseSingle = await fetch(`https://mgdemon.org/manga/${manhwa.slug}/`);
        let content = await responseSingle.text();
        //Get chapters links
        let chapterLinks = [];
        content.slice(content.search('class="chapter-list"'));
        let allNumber = content.split('data-chapterno="');
        for (let number of allNumber) {
            let chapterNum = number.split('"')[0];
            let link = `https://mgdemon.org/manga/${name}/chapter/${chapterNum}-VA54`;
            let findChapter = await manhwaModel.findChapterByMidAndLink(manhwa.mid, link);
            if (findChapter.length == 0) {
                if (!isNaN(parseFloat(chapterNum)))
                    chapterLinks.push({ link: `https://mgdemon.org/manga/${name}/chapter/${chapterNum}-VA54`, number: chapterNum })
            }
        }
        return chapterLinks;
    } catch (e) {
        console.log(e);
        return false;
    }
}
