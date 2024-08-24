

export default function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.cookie('before', true, { sameSite: 'lax', secure: true });
        return next();
    }
    if (req.headers.cookie?.includes('before=true')) {
        res.redirect('/aV46X3j9z9m6')
    } else {
        res.status(404).render('page_not_found.ejs', { title: '404: file not found', url: process.env.HOST_NAME + req.originalUrl });
    }
}