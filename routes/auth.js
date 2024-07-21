import express from 'express';
import auth from '../controllers/Auth.js';
import manhwaController from '../controllers/Manhwa.js';

const router = express.Router();



router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    })
});


router.get('/savedmanhwas', async (req, res, next) => {
    const manhwas = await manhwaController.getSavedManhwas(req, res, next);
    res.render('layout', { template: 'pages/savedmanhwas.ejs', manhwas });
});


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