import https from 'https';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import initializePassport from './utils/Strategy.js';
import flashMessage from './utils/flashMessage.js';
import checkRole from './utils/checkRole.js';

//Routes
import pages from './routes/pages.js';
import auth from './routes/auth.js';
import admin from './routes/admin.js';
import isAuthenticated from './utils/checkAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT;

const app = express();

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))
app.set('trust proxy', true);

app.use(session({ secret: 'fd8s9f6sd@#$@fdsf23r23', resave: false, saveUninitialized: false }));
app.use(flashMessage);
initializePassport(app);

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    if (req.user != undefined) {
        req.session.user = { id: req.user.id, username: req.user.username, email: req.user.email, rol: req.user.rol };
        res.locals.currentUser = { id: req.user.id, username: req.user.username, email: req.user.email, rol: req.user.rol };
    }
    next();
})


app.use('/', pages);
app.use('/auth', isAuthenticated, auth)
app.use('/admin', checkRole(2), admin);

app.use('*', (req, res, next) => {
    res.render('page_not_found.ejs')
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
})