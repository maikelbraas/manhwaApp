import express from 'express';
import page from '../models/Page.js';
import manhwaController from '../controllers/Manhwa.js';

const router = express.Router();

router.get('/dashboard', (req, res, next) => {
    res.render('layout', { template: 'admin/dashboard.ejs', counter: req.session.counter, visitorsTotal: req.session.visitorsTotal })
});

router.get('/newUpdate', (req, res, next) => {
    res.render('layout', { template: 'admin/newUpdate.ejs' })
});

router.post('/newUpdate', async (req, res, next) => {
    let { title, content } = req.body;
    await page.postUpdate(title, content);
    res.redirect('/admin/newUpdate');
});

router.get('/api/manhwaUpdate', async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none'
    });
    await manhwaController.checkUpdate(req, res, next);
});

router.get('/api/manhwa', async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none'
    });
    await manhwaController.checkInsert(req, res, next);
});



router.get('/api/specific/:id', async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none'
    });
    await manhwaController.checkSpecific(req, res, next);
});



export default router;