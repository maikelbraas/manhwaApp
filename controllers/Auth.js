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
            if (password.length < 8) {
                errors.push('password needs to be between 8 and 20 characters.');
            }
            if (!/[a-z]/g.test(password)) {
                errors.push('password needs atleast 1 lowercase.');
            }
            if (!/[A-Z]/g.test(password)) {
                errors.push('password needs atleast 1 UPPERCASE.');
            }
            if (!/\d/g.test(password)) {
                errors.push('password needs atleast 1 number.');
            }
            if (!/[#$@!%&*?]/g.test(password)) {
                errors.push('password needs atleast 1 special character.');
            }
            // if (!/^(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z]{8,20}$/.test(password)) {
            //     errors.push('password needs to be between 8 and 20 characters, atleast 1 number and 1 special character.');
            // }

            const existingUser = await user.findByUsernameOrEmail(username);

            if (existingUser.length > 0)
                errors.push('Account already exists.')

            if (errors.length > 0) {
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
        res.write(`data: ${JSON.stringify({ progress: 100, updatedRows: totalUpdated, done: true })}\n\n`);
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