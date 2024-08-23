import express from 'express';
import auth from '../controllers/Auth.js';
import manhwaController from '../controllers/Manhwa.js';

const router = express.Router();

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/aV46X3j9z9m6');
    })
});

router.get('/savedmanhwas', async (req, res, next) => {
    const manhwas = await auth.getSavedManhwas(req, res, next);
    res.render('layout', { template: 'pages/savedmanhwas.ejs', manhwas, title: 'Saved Manhwas' });
});


router.get('/profile', async (req, res, next) => {
    const manhwas = await auth.getSavedManhwas(req, res, next);
    res.render('layout', { template: 'auth/profile.ejs', user: req.user, manhwas, title: 'Profile' });
});

router.delete('/deleteAccount', async (req, res, next) => {
    const response = await auth.deleteAccount(req, res, next);
    req.logout((err) => {
        if (err) return next(err);
        return res.redirect('/');
    })
})

router.get('/updatesavedmanhwa', async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none'
    });
    await auth.updateSavedManhwa(req, res, next);
})

router.post('/chapter/:id', async (req, res, next) => {
    let api = await auth.saveOrUpdateChapter(req, res, next);
    if (api.api)
        res.json({ success: true });
    else
        res.redirect('/auth/savedmanhwas' + api.flag);
})

router.delete('/remove/:mid', async (req, res, next) => {
    await auth.removeSaved(req, res, next);
    res.json({ success: true });
})

router.patch('/patch/:mid', async (req, res, next) => {
    await auth.patchSaved(req, res, next);
    res.json({ success: true });
})

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

router.get('/latest', async (req, res, next) => {
    let manhwas = await manhwaController.getLastUpdated(req, res, next, global.totalUpdated ? global.totalUpdated < 10 ? 10 : global.totalUpdated : 10);
    var date = new Date(manhwas[0].lastUpdate).toString().slice(0, 24).slice(4);
    return res.render('layout', { template: 'pages/latest.ejs', manhwas, title: 'Latest updates', date: global.lastUpdated ? global.lastUpdated.toString().slice(0, 24).slice(4) : date });
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

//API

router.get('/api/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ succes: true })
    })
});

router.get('/api/savedmanhwas', async (req, res, next) => {
    const manhwas = await auth.getSavedManhwasApi(req, res, next);
    res.setHeader('totalpages', manhwas.length);
    return res.json(manhwas);
});



export default router;