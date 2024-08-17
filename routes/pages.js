import express from 'express';
import manhwaController from '../controllers/Manhwa.js';
import passport from 'passport';
import pageModel from '../models/Page.js';
import page from '../controllers/Page.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    let manhwas = await manhwaController.getLastUpdated(req, res, next, global.totalUpdated);
    var date = new Date(manhwas[0].lastUpdate).toString().slice(0, 24).slice(4);
    return res.render('layout', { template: 'pages/index.ejs', manhwas, title: 'Latest updates', date: global.lastUpdated ? global.lastUpdated.toString().slice(0, 24).slice(4) : date });
});

router.get('/manhwas/:page', async (req, res, next) => {
    let filter = "?";
    if (Object.keys(req.query).length > 0) {
        let i = Object.keys(req.query).length - 1;
        for (let genre in req.query) {

            filter += `${genre}=${req.query[genre]}`;
            if (i > 0) {
                filter += '&';
                i--;
            }
        }
    } else {
        filter = '';
    }
    if (req.params.page > 0 && req.params.page <= Math.ceil(global.manhwas.totalManhwas / 6)) {
        if (Object.keys(req.query).length === 0) {
            let data = await manhwaController.getManhwas(req, res, next);
            return res.render('layout', { template: 'pages/manhwas.ejs', manhwas: data.manhwas, filter, page: req.params.page, manhwasTotal: global.manhwas.totalManhwas, title: 'Page: ' + req.params.page, genres: data.genres });
        } else if (Object.keys(req.query).length !== 0) {
            let data = await manhwaController.getFilteredManhwas(req, res, next);
            let manhwasTotal = data.manhwas.length != 0 ? data.manhwas[0].total - 6 : 0
            if (data.manhwas == false) {
                res.flash(['remove', 'Genre combination could not be found.']);
            }
            return res.render('layout', { template: 'pages/manhwas.ejs', manhwas: data.manhwas, filter, baseFilter: req.query, page: req.params.page, manhwasTotal, title: 'Filtered: ' + req.params.page, genres: data.genres });
        }
    }
    next();
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
    res.render('layout', { template: 'pages/privacypolicy.ejs', title: 'Privacy Policy' });
});

router.get('/cookiepolicy', async (req, res, next) => {
    res.render('layout', { template: 'pages/cookiepolicy.ejs', title: 'Cookie Policy' });
});

router.get('/siteUpdates', async (req, res, next) => {
    let updates = await pageModel.getUpdates();
    res.render('layout', { template: 'pages/siteUpdates.ejs', updates, title: 'Site updates' });
});

router.get('/manhwa/:id', async (req, res, next) => {
    try {
        let manhwa = await manhwaController.getManhwa(req, res, next);
        if (!manhwa) {
            next();
            return;
        }
        [manhwa] = manhwa;
        if (typeof req.session.user != 'undefined')
            manhwa.saved = await manhwaController.getSavedManhwaChapter(req, res, next);

        res.render('layout', { template: 'pages/manhwa.ejs', manhwa, title: manhwa.title });
    } catch (error) {
        console.log(error);
    }
});

router.get('/register', (req, res, next) => {
    if (req.session.user == undefined)
        res.render('layout', { template: 'pages/register.ejs', errors: [], title: 'Register' });
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
            return page.showLoginForm(req, res, next);
        }
        req.logIn(user, (err) => {
            let goback = pages[pages.length - 1] == undefined || pages[pages.length - 1].split('/')[3] != 'manhwa' ? pages[pages.length - 1] = '/auth/savedmanhwas' : pages[pages.length - 1].split('/')
            if (err) { return next(err); }
            if (goback[3] == 'manhwa') {
                return res.redirect(`/manhwa/${goback.pop()}`);
            } else {
                return res.redirect(`${goback}`);
            }

        });
    })(req, res, next);
});

//API

router.post('/api/login', passport.authenticate('local'), (req, res) => {
    return res.json({ success: true, user: req.user });
});

router.get('/api/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        res.json({ isAuthenticated: false });
    }
})



router.get('/api/manhwas/:num', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('totalPages', Math.ceil(global.manhwas.totalManhwas / 10));
    res.setHeader('totalManhwas', global.manhwas.totalManhwas);
    const start = (parseInt(req.params.num) - 1) * 10;
    const end = start + 10;
    const manhwas = global.manhwas.manhwas.slice(start, end);
    if (typeof req.session.user != 'undefined') {
        for (let manhwa of manhwas) {
            manhwa.saved = await manhwaController.getSavedManhwaChapterApi(req, res, next, manhwa.mid);
        }
        return res.json(manhwas);
    }
    return res.json(manhwas);

});

router.get('/api/latest', async (req, res, next) => {
    let manhwas = await manhwaController.getLastUpdated(req, res, next, global.totalUpdated);
    return res.json(manhwas);
})

export default router;