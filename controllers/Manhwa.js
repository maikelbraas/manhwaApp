import manhwaModel from '../models/Manhwa.js';
import genreModel from '../models/Genre.js';
import manhwaCheck from '../utils/manhwaCheckAsura.js';
import manhwaCheckReaper from '../utils/manhwaCheckReaper.js';
import manhwaCheckAsuraUpdate from '../utils/manhwaCheckAsuraUpdate.js';
import manhwaCheckReaperUpdate from '../utils/manhwaCheckReaperUpdate.js';
import manhwaCheckFlame from '../utils/manhwaCheckFlame.js';
import manhwaCheckFlameUpdate from '../utils/manhwaCheckFlameUpdate.js';
import genreCheck from '../utils/genreCheck.js';
import writeToJson from '../utils/writeToJson.js';
import updateToJson from '../utils/updateToJson.js';
import readFromJson from '../utils/getFromJson.js';
import buildJson from '../utils/buildJson.js';

class Manhwa {
    static async checkInsert(req, res, next) {
        let manhwas = await manhwaCheck(req, res, next);
        if (manhwas.length > 0) {
            for (let manhwa of manhwas) {
                await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                await genreCheck(req, res, next, manhwa);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }
        let manhwasReaper = await manhwaCheckReaper(req, res, next);
        // console.log(manhwasReaper);
        if (manhwasReaper.length > 0) {
            for (let manhwa of manhwasReaper) {
                await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                await genreCheck(req, res, next, manhwa);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }
        let manhwasFlame = await manhwaCheckFlame(req, res, next);
        // console.log(manhwasReaper);
        if (manhwasFlame.length > 0) {
            for (let manhwa of manhwasFlame) {
                await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                await genreCheck(req, res, next, manhwa);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }
        res.write(`data: ${JSON.stringify({ progress: { asura: 100, reaper: 100 }, done: true, createdRows: manhwas.length + manhwasReaper.length + manhwasFlame.length })}\n\n`);
        return;
    }

    static async checkUpdate(req, res, next) {
        // let manhwas = [];
        let manhwas = await manhwaCheckAsuraUpdate(req, res, next);
        if (manhwas.length > 0) {
            for (let manhwa of manhwas) {
                await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }
        let manhwasReaper = await manhwaCheckReaperUpdate(req, res, next);
        if (manhwasReaper.length > 0) {
            for (let manhwa of manhwasReaper) {
                await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }

        let manhwasFlame = await manhwaCheckFlameUpdate(req, res, next);
        if (manhwasFlame.length > 0) {
            for (let manhwa of manhwasFlame) {
                await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }

        res.write(`data: ${JSON.stringify({ progress: { asura: 100, reaper: 100 }, done: true, updatedRows: manhwas.length + manhwasReaper.length + manhwasFlame.length })}\n\n`);
        return;
    }

    static async buildJson(req, res, next) {
        let manhwas = await manhwaModel.getAllManhwas();
        let i = 0;
        for (let manhwa of manhwas) {
            let genresOfManhwa = await genreModel.getAllGenresOfManhwa(manhwa.mid);
            manhwa.image = encodeURI(manhwa.image);
            manhwa.genres = [];
            for (let genre of genresOfManhwa) {
                manhwa.genres.push(genre.name);
            }

            i++;
            let inter = (i / manhwas.length) * 100;
            res.write(`data: ${JSON.stringify({ progress: inter })}\n\n`);
        }
        await buildJson(manhwas);

        res.write(`data: ${JSON.stringify({ progress: 100, done: true })}\n\n`);
        return;
    }

    static async getManhwas(req, res, next) {
        if (!req.session.hasOwnProperty('manhwas')) {
            req.session.manhwas = await manhwaModel.getAllManhwas();
        }
        return req.session.manhwas;
    }

    static async getManhwa(req, res, next) {
        const id = req.params.id;
        let manhwa = false;
        if (req.session.hasOwnProperty('manhwas'))
            manhwa = req.session.manhwas.find(x => x.mid == id);
        if (!manhwa)
            return false;
        return manhwa;
    }

    static async getSavedManhwaChapter(req, res, next) {
        const id = req.params.id;
        const [chapterData] = await manhwaModel.getSavedManhwaChapter(id, req.session.user.id);
        return chapterData
    }

    static async getSavedManhwas(req, res, next) {
        try {
            const userid = req.session.user.id;
            const manhwas = await manhwaModel.getSavedManhwas(userid);
            for (let manhwa of manhwas) {
                const [link] = await manhwaModel.getCurrentChapter(manhwa.mid, parseFloat(manhwa.chapter).toFixed(1));
                manhwa.link = link.chapter_link;
            }
            return manhwas;
        } catch (e) {
            console.log(e);
        }
    }

    static async getManhwasFromJson(req, res, next) {
        return await readFromJson();
    }

}

export default Manhwa;