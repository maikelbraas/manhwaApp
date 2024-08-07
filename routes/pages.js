import express from 'express';
import manhwaController from '../controllers/Manhwa.js';
import passport from 'passport';
import pageModel from '../models/Page.js';
import page from '../controllers/Page.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    let manhwas = await manhwaController.getLastUpdated(req, res, next);
    return res.render('layout', { template: 'pages/index.ejs', manhwas });
});

router.get('/manhwas/:page', async (req, res, next) => {

    if (req.params.page > 0 && req.params.page <= Math.ceil(global.manhwas.totalManhwas / 6)) {
        let manhwas = await manhwaController.getManhwas(req, res, next);
        return res.render('layout', { template: 'pages/manhwas.ejs', manhwas, page: req.params.page, totalManhwas: global.manhwas.totalManhwas });
    }
    return res.redirect('/manhwas/1');
});

router.get('/api/jsonWrite', async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none'
    });
    await manhwaController.buildJson(req, res, next);
});

router.get('/privacypolicy', async (req, res, next) => {
    res.render('layout', { template: 'pages/privacypolicy.ejs' });
});

router.get('/cookiepolicy', async (req, res, next) => {
    res.render('layout', { template: 'pages/cookiepolicy.ejs' });
});

router.get('/siteUpdates', async (req, res, next) => {
    let updates = await pageModel.getUpdates();
    res.render('layout', { template: 'pages/siteUpdates.ejs', updates });
});

router.get('/manhwa/:id', async (req, res, next) => {
    try {
        let manhwa = await manhwaController.getManhwa(req, res, next);
        if (!manhwa) {
            res.redirect('/manhwas/1');
            return false;
        }
        [manhwa] = manhwa;
        if (typeof req.session.user != 'undefined')
            manhwa.saved = await manhwaController.getSavedManhwaChapter(req, res, next);

        res.render('layout', { template: 'pages/manhwa.ejs', manhwa });
    } catch (error) {
        console.log(error);
    }
});

router.get('/register', (req, res, next) => {
    if (req.session.user == undefined)
        res.render('layout', { template: 'pages/register.ejs', errors: [] });
    else
        res.redirect('/auth/savedmanhwas');
})

router.post('/register', async (req, res, next) => {
    await page.register(req, res, next);
})

router.get('/login', (req, res, next) => {
    if (req.session.user == undefined)
        page.showLoginForm(req, res, next);
    else
        res.redirect('/auth/savedmanhwas');
});

router.post('/login', (req, res, next) => {
    let pages = req.session.visitedPages;
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            res.flash(info.message);
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            let goback = pages[pages.length - 1] == undefined || pages[pages.length - 1].split('/')[3] != 'manhwa' ? pages[pages.length - 1] = '/auth/savedmanhwas' : pages[pages.length - 1].split('/')
            if (err) { return next(err); }
            if (goback[3] == 'manhwa')
                return res.redirect(`/manhwa/${goback.pop()}`);
            else
                return res.redirect(`${goback}`);

        });
    })(req, res, next);
});

export default router;