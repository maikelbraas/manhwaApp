import user from '../models/User.js';
import isAuthenticated from '../utils/checkAuth.js';
import manhwaModel from '../models/Manhwa.js';
import checkSingle from '../utils/getAllChapterLinks.js';

class Auth {
    static async register(req, res, next) {
        try {
            let errors = [];
            const { username, password, confpassword, email } = req.body;
            if (password != confpassword)
                errors.push('Wachtwoorden komen niet overeen.');

            const existingUser = await user.findByUsernameOrEmail(username, email);

            if (existingUser.length > 0)
                errors.push('Account bestaat al.')

            if (errors.length > 0)
                return res.render('layout', { template: 'pages/register.ejs', errors })

            const userId = await user.create(username, password, email);
            res.flash('Registratie succesvol!');
            return res.redirect('/auth/login');
        } catch (err) {
            console.log(err);
            // return res.render('layout', { template: 'pages/register.ejs', errors: ['Er is iets fout gegaan met het aanmaken van je account.'] })
            return res.redirect('/auth/register')
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
            let chapters = await checkSingle(req.params.id);
            if (!chapters)
                this.removeSaved(req, res, next)
            for (let chapter of chapters) {
                await manhwaModel.saveManhwaChapters(req.params.id, chapter.link, chapter.number);
            }
        }
        res.redirect('/auth/savedmanhwas');
        // next();
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