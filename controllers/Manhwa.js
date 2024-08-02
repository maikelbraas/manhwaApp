import manhwaModel from '../models/Manhwa.js';
import genreModel from '../models/Genre.js';
import manhwaCheck from '../utils/manhwaCheckAsura.js';
import manhwaCheckReaper from '../utils/manhwaCheckReaper.js';
import manhwaCheckAsuraUpdate from '../utils/manhwaCheckAsuraUpdate.js';
import manhwaCheckReaperUpdate from '../utils/manhwaCheckReaperUpdate.js';
import manhwaCheckFlame from '../utils/manhwaCheckFlame.js';
import manhwaCheckFlameUpdate from '../utils/manhwaCheckFlameUpdate.js';
import manhwaCheckSpecific from '../utils/manhwaCheckSpecific.js';
import manhwaCheckSpecificUpdate from '../utils/manhwaCheckSpecificUpdate.js';
import genreCheck from '../utils/genreCheck.js';
import writeToJson from '../utils/writeToJson.js';
import updateToJson from '../utils/updateToJson.js';
import readFromJson from '../utils/getFromJson.js';
import buildJson from '../utils/buildJson.js';
import downloadImage from '../utils/downloadImage.js';

class Manhwa {
    static async checkInsert(req, res, next) {
        // let manhwas = await manhwaCheck(req, res, next);
        // if (manhwas.length > 0) {
        //     for (let manhwa of manhwas) {
        //         await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
        //         await genreCheck(req, res, next, manhwa);
        //         for (let chapter of manhwa.manhwaChapters) {
        //             await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
        //         }
        //     }
        // }
        let manhwasReaper = await manhwaCheckReaper(req, res, next);
        // let manhwasReaper = [];
        if (manhwasReaper.length > 0) {
            for (let manhwa of manhwasReaper) {
                let image = await downloadImage(manhwa.mid, manhwa.image);
                await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, image, manhwa.chapters, manhwa.baseurl, manhwa.status);
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
                let image = await downloadImage(manhwa.mid, manhwa.image);
                await manhwaModel.create(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                await genreCheck(req, res, next, manhwa);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }
        res.flash(`New manhwas added: ${manhwasReaper.length + manhwasFlame.length}`);
        res.write(`data: ${JSON.stringify({ progress: { asura: 100, reaper: 100 }, done: true, createdRows: manhwasReaper.length + manhwasFlame.length })}\n\n`);
        res.end();
        return;
    }

    static async checkUpdate(req, res, next) {
        // let manhwas = [];
        // let manhwas = await manhwaCheckAsuraUpdate(req, res, next);
        // if (manhwas.length > 0) {
        //     for (let manhwa of manhwas) {
        //         await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
        //         for (let chapter of manhwa.manhwaChapters) {
        //             await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
        //         }
        //     }
        // }
        // let manhwasReaper = [];
        let manhwasReaper = await manhwaCheckReaperUpdate(req, res, next);
        if (manhwasReaper.length > 0) {
            for (let manhwa of manhwasReaper) {
                await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                await genreCheck(req, res, next, manhwa);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }
        // let manhwasFlame = [];
        let manhwasFlame = await manhwaCheckFlameUpdate(req, res, next);
        if (manhwasFlame.length > 0) {
            for (let manhwa of manhwasFlame) {
                await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                await genreCheck(req, res, next, manhwa);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }
        let savedDemonManhwa = await manhwaModel.getDemonManhwa();
        let manhwasDemon = await manhwaCheckSpecificUpdate(req, res, next, savedDemonManhwa);
        if (manhwasDemon.length > 0) {
            for (let manhwa of manhwasDemon) {
                await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.description, manhwa.media, manhwa.image, manhwa.chapters, manhwa.baseurl, manhwa.status);
                await genreCheck(req, res, next, manhwa);
                for (let chapter of manhwa.manhwaChapters) {
                    await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
                }
            }
        }

        res.flash(`Manhwas updated: ${manhwasReaper.length + manhwasFlame.length + manhwasDemon.length}`);
        res.write(`data: ${JSON.stringify({ progress: { asura: 100, reaper: 100, flame: 100, demon: 100 }, done: true, updatedRows: manhwasReaper.length + manhwasFlame.length + manhwasDemon.length })}\n\n`);
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
        req.session.manhwas = manhwas;
        req.session.save();
        res.write(`data: ${JSON.stringify({ progress: 100, done: true })}\n\n`);
        return;
    }

    static async updateImageOfManhwa(mid, imagename) {
        await manhwaModel.updateImageOfManhwa(mid, imagename);
    }

    static async getManhwas(req, res, next) {
        if (!req.session.hasOwnProperty('manhwas')) {
            req.session.manhwas = await manhwaModel.getAllManhwas();
        }
        return req.session.manhwas;
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