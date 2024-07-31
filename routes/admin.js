import express from 'express';
import admin from '../controllers/Admin.js';
import page from '../models/Page.js';

const router = express.Router();

router.get('/dashboard', (req, res, next) => {
    res.render('layout', { template: 'admin/dashboard.ejs', counter: req.session.counter })
});

router.get('/newUpdate', (req, res, next) => {
    res.render('layout', { template: 'admin/newUpdate.ejs' })
});

router.post('/newUpdate', async (req, res, next) => {
    let { title, content } = req.body;
    await page.postUpdate(title, content);
    res.redirect('/admin/newUpdate');
});



export default router;