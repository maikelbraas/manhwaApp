import manhwaModel from '../models/Manhwa.js';
import manhwaCheckSpecific from '../utils/manhwaCheckSpecific.js';
import genreCheck from '../utils/genreCheck.js';
import readFromJson from '../utils/getFromJson.js';
import buildJson from '../utils/buildJson.js';
import downloadImage from '../utils/downloadImage.js';
import manhwaCheckUpdate from '../utils/manhwaCheckUpdate.js';
import manhwaCheck from '../utils/manhwaCheck.js';

class Manhwa {
    static async checkInsert(req, res, next) {
        let sources = [{ baseurl: 'https://reaper-scans.com/', name: 'reaper' }, { baseurl: 'https://flamecomics.me/', name: 'flame' }];
        let totalCreated = 0;
        for (let source of sources) {
            let manhwasCreate = await manhwaCheck(req, res, next, source.baseurl, source.name);
            totalCreated += manhwasCreate.length;
            if (manhwasCreate.length > 0) {
                for (let manhwa of manhwasCreate) {
                    let image = await downloadImage(manhwa.mid, manhwa.image);
                    await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                    await genreCheck(req, res, next, manhwa);
                }
            }
        }
        res.flash(`New manhwas added: ${totalCreated}`);
        res.write(`data: ${JSON.stringify({ progress: 100, done: true, createdRows: totalCreated })}\n\n`);
        res.end();
        return;
    }

    static async checkUpdate(req, res, next) {
        let sources = ['reaper', 'flame', 'mgdemon'];
        let totalUpdated = 0;
        for (let source of sources) {
            let updates = await manhwaCheckUpdate(req, res, next, source);
            if (updates.length > 0) {
                for (let manhwa of updates) {
                    await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                    await genreCheck(req, res, next, manhwa);
                    for (let chapter of manhwa.manhwaChapters) {
                        await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                    }
                }
            }
            totalUpdated += updates.length;
        }

        res.flash(`Manhwas updated: ${totalUpdated}`);
        res.write(`data: ${JSON.stringify({ progress: 100, done: true, updatedRows: totalUpdated })}\n\n`);
        res.end();
        return;
    }

    static async checkSpecific(req, res, next) {
        let manhwa = await manhwaCheckSpecific(req, res, next);
        if (manhwa != false) {
            let image = await downloadImage(manhwa.mid, manhwa.image);
            await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, image, manhwa.chapters, manhwa.baseurl, manhwa.status);
            await genreCheck(req, res, next, manhwa);

            for (let chapter of manhwa.manhwaChapters) {
                await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
            }
        }
        res.write(`data: ${JSON.stringify({ progress: 100, done: true, manhwa: JSON.stringify(manhwa) })}\n\n`);
        await this.buildJson(req, res, next);
        return;
    }

    static async buildJson(req, res, next) {
        let manhwas = await manhwaModel.getAllManhwasAndGenres();
        await buildJson(manhwas);
        global.manhwas = { manhwas: manhwas, totalManhwas: manhwas.length };
        global.buildDate = Date.now();
        if (res != null) {
            res.write(`data: ${JSON.stringify({ progress: 100, done: true })}\n\n`);
            res.end();
        }
        return;
    }

    static async updateImageOfManhwa(mid, imagename) {
        await manhwaModel.updateImageOfManhwa(mid, imagename);
    }

    static async getAllManhwas() {
        let manhwas = await manhwaModel.getAllManhwasAndGenres();
        global.manhwas = { manhwas: manhwas, totalManhwas: manhwas.length };
        return;
    }

    static async getManhwas(req, res, next) {
        // if (!req.session.hasOwnProperty('manhwas')) {
        //     req.session.manhwas = await manhwaModel.getAllManhwas();
        // }
        // return req.session.manhwas;
        let manhwas = await manhwaModel.getAllManhwasLimit(req.params.page);
        return manhwas;
    }

    static async getManhwa(req, res, next) {
        const id = req.params.id;
        let manhwa = await manhwaModel.findManhwaById(id);
        if (manhwa.length == 0)
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
                const next = await manhwaModel.getNextChapter(manhwa.mid, parseFloat(manhwa.chapter).toFixed(1));
                manhwa.next = "";
                if (next.length > 0)
                    manhwa.next = next[0].chapter_link;
            }
            return manhwas;
        } catch (e) {
            console.log(e);
        }
    }

    static async getManhwasFromJson(req, res, next) {
        return await readFromJson();
    }

    static async getLastUpdated(req, res, next) {
        const manhwas = await manhwaModel.getLastUpdated();
        return manhwas;
    }

}

export default Manhwa;