import express from 'express';
import auth from '../controllers/Auth.js';

const router = express.Router();

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
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
    await auth.saveOrUpdateChapter(req, res, next);
})

router.delete('/remove/:mid', async (req, res, next) => {
    await auth.removeSaved(req, res, next);
    next();
})

router.patch('/patch/:mid', async (req, res, next) => {
    await auth.patchSaved(req, res, next);
    next();
})

export default router;