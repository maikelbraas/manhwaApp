import manhwaModel from '../models/Manhwa.js';
export default async function checkChapterLinksDemon(mid, content, name) {
    try {
        let manhwa;
        if (manhwa == null)
            [manhwa] = await manhwaModel.findManhwaById(mid);
        if (content == null) {
            let responseSingle = await fetch(`https://demonicscans.org/manga/${manhwa.slug}/`);
            content = await responseSingle.text();
        }
        //Get chapters links
        let chapterLinks = [];
        content.slice(content.search('class="chapter-list"'));
        let allNumber = content.split('data-chapterno="');
        for (let number of allNumber) {
            let chapterNum = number.split('"')[0];
            let link = `https://demonicscans.org/title/${manhwa.slug}/chapter/${chapterNum}/1`;
            let findChapter = await manhwaModel.findChapterByMidAndLink(manhwa.mid, link);
            if (findChapter.length == 0) {
                if (!isNaN(parseFloat(chapterNum)))
                    chapterLinks.push({ link, number: chapterNum })
            }
        }
        return chapterLinks;
    } catch (e) {
        console.log(e);
        return false;
    }
}
