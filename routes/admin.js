import express from 'express';
import page from '../models/Page.js';
import manhwaController from '../controllers/Manhwa.js';
import auth from '../controllers/Auth.js';
import downloadImage from '../utils/downloadImage.js';

const router = express.Router();

router.get('/dashboard', (req, res, next) => {
    res.render('layout', { template: 'admin/dashboard.ejs', counter: req.session.counter, title: 'Dashboard' })
});

router.get('/newUpdate', (req, res, next) => {
    res.render('layout', { template: 'admin/newUpdate.ejs', title: 'New site update' })
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

router.get('/api/getimages', async (req, res, next) => {

    let nextImage = 0;
    let progress;
    try {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Encoding': 'none'
        });
        let manhwas = global.manhwas.manhwas;
        for (let manhwa of manhwas) {
            progress = (nextImage / global.manhwas.totalManhwas) * 100;
            res.write(`data: ${JSON.stringify({ progress })}\n\n`);
            await downloadImage(manhwa.mid, manhwa.image);
            nextImage++;
        }
        res.write(`data: ${JSON.stringify({ progress: 100, done: true, updatedRows: nextImage })}\n\n`);
    } catch (error) {
        console.log(error);
        res.write(`data: ${JSON.stringify({ progress: 100, error, nextImage })}\n\n`);
        res.end();
        return;
    }
});

export default router;