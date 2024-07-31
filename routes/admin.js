import express from 'express';
import admin from '../controllers/Admin.js';

const router = express.Router();

router.get('/dashboard', (req, res, next) => {
    res.render('layout', { template: 'admin/dashboard.ejs', counter: req.session.counter })
});



export default router;