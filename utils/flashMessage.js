const flashMessage = (req, res, next) => {
    res.locals.getFlashMessage = () => {
        const message = req.session.flashMessage;
        delete req.session.flashMessage;
        return message;
    };

    res.flash = (message) => {
        req.session.flashMessage = message;
    };

    next();
}

export default flashMessage;