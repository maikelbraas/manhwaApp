import manhwaModel from '../models/Manhwa.js';
import checkSingle from '../utils/getAllChapterLinks.js';
import checkSingleDemon from '../utils/getAllChapterLinksDemon.js';
import ChapterSaved from '../models/ChaptersSaved.js';
import user from '../models/User.js'

class Auth {

    static async saveOrUpdateChapter(req, res, next) {
        let flag = '';
        const chapter = req.body.chapternumber;
        const api = req.body.api != undefined ? req.body.api : false;
        const userid = req.session.user.id;
        const existingChapter = await ChapterSaved.getChapter(userid, req.params.id);
        const chapterExists = await manhwaModel.getCurrentChapter(req.params.id, chapter);
        if (existingChapter.length > 0) {
            if (chapterExists.length > 0) {
                await ChapterSaved.updateChapter(chapter, req.params.id, userid);
            } else
                res.flash('Input chapter does not exist');
        } else {
            flag = '#' + req.params.id;
            await ChapterSaved.saveChapter(chapter, req.params.id, req.session.user.id);
            let chapters;
            if (req.params.id.includes('mgdemon')) {
                chapters = await checkSingleDemon(req.params.id, null, null);
            } else {
                chapters = await checkSingle(req.params.id, null, null);
            }
            if (!chapters)
                this.removeSaved(req, res, next)
            for (let chapter of chapters) {
                await manhwaModel.saveManhwaChapters(req.params.id, chapter.link, chapter.number);
            }
        }
        return { api, flag };
    }

    static async updateSavedManhwa(req, res, next) {
        let chapters = [];
        let nextManhwa = 1;
        let totalUpdated = 0;
        const userid = req.session.user.id;
        let manhwas = await manhwaModel.getSavedManhwas(userid);
        for (let manhwa of manhwas) {
            if (manhwa.mid.includes('mgdemon')) {
                chapters = await checkSingleDemon(manhwa.mid);
            } else {
                chapters = await checkSingle(manhwa.mid);
            }
            for (let chapter of chapters) {
                await manhwaModel.saveManhwaChapters(manhwa.mid, chapter.link, chapter.number);
            }
            let inter = (nextManhwa / manhwas.length) * 100;
            res.write(`data: ${JSON.stringify({ progress: inter })}\n\n`);
            if (chapters.length > 0) {
                totalUpdated++;
                await manhwaModel.update(manhwa.title, manhwa.mid, manhwa.slug, manhwa.content, manhwa.media, manhwa.image, chapters[0].number, manhwa.baseurl, manhwa.status);
            }
            nextManhwa++;
        }
        res.flash(`Saved updated: ${totalUpdated}`);
        res.write(`data: ${JSON.stringify({ progress: 100, updatedRows: totalUpdated, done: true })}\n\n`);
        res.end();
        return;
    }

    static async removeSaved(req, res, next) {
        const mid = req.params.mid;
        const uid = req.session.user.id;
        await manhwaModel.deleteSaved(mid, uid);
    }

    static async patchSaved(req, res, next) {
        const mid = req.params.mid;
        const uid = req.session.user.id;
        await manhwaModel.patchSaved(mid, uid);
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

    static async getSavedManhwasApi(req, res, next) {
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

    static async updateImageOfManhwa(mid, imagename) {
        await manhwaModel.updateImageOfManhwa(mid, imagename);
    }

    static async deleteAccount(req, res, next) {
        const id = req.user.id;
        const response = await user.deleteAccount(id);
        if (response.affectedRows > 0) {
            res.flash(`Account deleted.`)
        } else {
            res.flash(`Something went wrong with deleting your account.`);
        }
        return response;
    }
}

export default Auth;