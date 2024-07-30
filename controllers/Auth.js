import user from '../models/User.js';
import isAuthenticated from '../utils/checkAuth.js';
import manhwaModel from '../models/Manhwa.js';
import checkSingle from '../utils/getAllChapterLinks.js';
import checkSingleDemon from '../utils/getAllChapterLinksDemon.js';

class Auth {
    static async register(req, res, next) {
        try {
            let errors = [];
            const { username, password, confpassword } = req.body;
            if (password != confpassword)
                errors.push('Passwords are not the same.');

            const existingUser = await user.findByUsernameOrEmail(username);

            if (existingUser.length > 0)
                errors.push('Account already exists.')

            if (errors.length > 0) {
                res.flash(errors);
                return res.render('layout', { template: 'pages/register.ejs', errors })
            }

            const userId = await user.create(username, password);
            res.flash('Account created!');
            return res.redirect('/login');
        } catch (err) {
            console.log(err);
            // return res.render('layout', { template: 'pages/register.ejs', errors: ['Er is iets fout gegaan met het aanmaken van je account.'] })
            return res.redirect('/register')
        }
    }

    static showLoginForm(req, res, next) {
        res.render('layout', { template: 'pages/login.ejs' });

    }

    static async saveOrUpdateChapter(req, res, next) {
        const chapter = req.body.chapternumber;
        const userid = req.session.user.id;
        const existingChapter = await user.getChapter(userid, req.params.id);
        if (existingChapter.length > 0) {
            await user.updateChapter(chapter, req.params.id, userid);
        } else {
            await user.saveChapter(chapter, req.params.id, req.session.user.id);
            let chapters;
            if (req.params.id.includes('mgdemon')) {
                chapters = await checkSingleDemon(req.params.id);
            } else {
                chapters = await checkSingle(req.params.id);
            }
            if (!chapters)
                this.removeSaved(req, res, next)
            for (let chapter of chapters) {
                await manhwaModel.saveManhwaChapters(req.params.id, chapter.link, chapter.number);
            }
        }
        res.redirect('/auth/savedmanhwas');
        // next();
    }


    static async updateSavedManhwa(req, res, next) {
        let chapters = [];
        let nextManhwa = 0;
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
            if (chapters.length > 0)
                nextManhwa++;
        }
        console.log(manhwas);
        res.write(`data: ${JSON.stringify({ progress: 100, updatedRows: nextManhwa, done: true })}\n\n`);
        res.end();
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
}

export default Auth;