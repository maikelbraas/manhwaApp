import manhwaModel from '../models/Manhwa.js';
import manhwaCheckSpecific from '../utils/manhwaCheckSpecific.js';
import genreCheck from '../utils/genreCheck.js';
import buildJson from '../utils/buildJson.js';
import downloadImage from '../utils/downloadImage.js';
import manhwaCheckUpdate from '../utils/manhwaCheckUpdate.js';
import manhwaCheck from '../utils/manhwaCheck.js';
import genreModel from '../models/Genre.js';
import resizeImages from '../utils/resizeImages.js';

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
                await this.resizeImages(manhwasCreate);
            }
        }
        res.flash(`New manhwas added: ${totalCreated}`);
        res.write(`data: ${JSON.stringify({ progress: 100, done: true, createdRows: totalCreated })}\n\n`);
        global.lastUpdated = new Date();
        res.end();
        await this.buildJson();
        return;
    }

    static async resizeImages(manhwasCreate) {
        for (let manhwaResize of manhwasCreate) {
            await resizeImages(manhwaResize.mid, { width: 150, height: 225 });
            await resizeImages(manhwaResize.mid, { width: 100, height: 150 });
        }
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
        global.totalUpdated = totalUpdated;

        global.lastUpdated = new Date();

        res.flash(`Manhwas updated: ${totalUpdated}`);
        res.write(`data: ${JSON.stringify({ progress: 100, done: true, updatedRows: totalUpdated })}\n\n`);
        res.end();
        await this.buildJson();
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
        let genres = await genreModel.getAllGenres();
        await buildJson(manhwas);
        global.manhwas = { manhwas: manhwas, totalManhwas: manhwas.length, genres };
        global.buildDate = Date.now();
        if (res != null) {
            res.write(`data: ${JSON.stringify({ progress: 100, done: true })}\n\n`);
            res.end();
        }
        return;
    }

    static async getAllManhwas() {
        let manhwas = await manhwaModel.getAllManhwasAndGenres();
        let genres = await genreModel.getAllGenres();
        global.manhwas = { manhwas: manhwas, totalManhwas: manhwas.length, genres };
        return manhwas;
    }

    static async getManhwas(req, res, next) {
        let manhwas = await manhwaModel.getAllManhwasLimit(req.params.page);
        let genres = await genreModel.getAllGenres();
        return { manhwas, genres };
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

    static async getSavedManhwaChapterApi(req, res, next, id) {
        const [chapterData] = await manhwaModel.getSavedManhwaChapter(id, req.session.user.id);
        return chapterData
    }


    static async getLastUpdated(req, res, next, limit) {
        const manhwas = await manhwaModel.getLastUpdated(limit);
        return manhwas;
    }

    static async getFilteredManhwas(req, res, next) {
        const data = req.query;
        const page = req.params.page - 1;
        let allowed = [];
        let denied = [];
        for (let filter in data) {
            if (data[filter] == 'denied') {
                denied.push(filter);
            }
            if (data[filter] == 'allowed') {
                allowed.push(filter)
            }
        }

        let genres = await genreModel.getAllGenres();
        return { manhwas: await manhwaModel.getFilteredManhwa(allowed, denied, page), genres };
    }

}

export default Manhwa;