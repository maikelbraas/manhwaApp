

export default function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(404).render('page_not_found.ejs', { title: '404: file not found', url: process.env.HOST_NAME + req.originalUrl });
}