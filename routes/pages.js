import express from 'express';
import manhwaController from '../controllers/Manhwa.js';
import passport from 'passport';
import pageModel from '../models/Page.js';
import page from '../controllers/Page.js';

const router = express.Router();


router.get('/', (req, res, next) => {
    if (req.session.user == undefined)
        page.showLoginForm(req, res, next);
    else
        res.redirect('/auth/savedmanhwas');
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

// router.get('/register', (req, res, next) => {
//     if (req.session.user == undefined)
//         res.render('layout', { template: 'pages/register.ejs', errors: [], title: 'Register' });
//     else
//         res.redirect('/auth/savedmanhwas');
// })

// router.post('/register', async (req, res, next) => {
//     await page.register(req, res, next);
// })

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
    return res.json(manhwas);

});

router.get('/api/latest', async (req, res, next) => {
    let manhwas = await manhwaController.getLastUpdated(req, res, next, global.totalUpdated ? global.totalUpdated < 10 ? 10 : global.totalUpdated : 10);
    return res.json(manhwas);
})

export default router;