import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import manhwaController from '../controllers/Manhwa.js';
import genreModel from '../models/Genre.js';
import passport from 'passport';
import local from '../utils/Strategy.js';
import auth from '../controllers/Auth.js';
import readFromJson from '../utils/getFromJson.js';

const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('layout', { template: 'pages/index.ejs' });
});


router.get('/manhwa', async (req, res, next) => {
    const manhwas = await manhwaController.getManhwas(req, res, next);
    res.render('layout', { template: 'pages/manhwas.ejs', manhwas, page: req.url });
});


router.get('/manhwa/:id', async (req, res, next) => {
    let manhwa = await manhwaController.getManhwa(req, res, next);
    if (!manhwa) {
        await manhwaController.getManhwas(req, res, next);
        manhwa = await manhwaController.getManhwa(req, res, next);
    }
    if (typeof req.session.user != 'undefined')
        manhwa.saved = await manhwaController.getSavedManhwaChapter(req, res, next);

    manhwa.genres = await genreModel.getAllGenresOfManhwa(req.params.id);

    res.render('layout', { template: 'pages/manhwa.ejs', manhwa });
});

router.get('/api/manhwa', async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    await manhwaController.checkInsert(req, res, next);

});

router.get('/api/manhwas', async (req, res, next) => {
    await readFromJson(req, res, next);
});

router.get('/api/manhwaUpdate', async (req, res, next) => {

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    await manhwaController.checkUpdate(req, res, next);
});

router.get('/api/jsonWrite', async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    await manhwaController.buildJson(req, res, next);
});

router.get('/register', (req, res, next) => {
    res.render('layout', { template: 'pages/register.ejs', errors: [] });
})

router.post('/register', async (req, res, next) => {
    await auth.register(req, res, next);
})

router.get('/login', auth.showLoginForm);

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            // Authentication failed
            res.flash(info.message); // Set the flash message
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            return res.redirect('/');
        });
    })(req, res, next);
});

export default router;