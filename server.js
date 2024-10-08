import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import session from 'express-session';
import initializePassport from './utils/Strategy.js';
import flashMessage from './utils/flashMessage.js';
import checkRole from './utils/checkRole.js';
import expressVisitorCounter from 'express-visitor-counter';
import compression from 'compression';
import scheduledFetch from './utils/scheduledFetch.js';
import manhwaController from './controllers/Manhwa.js'
import { v4 as uuidv4 } from 'uuid';
//Routes
import pages from './routes/pages.js';
import auth from './routes/auth.js';
import admin from './routes/admin.js';
import isAuthenticated from './utils/checkAuth.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT;
const HOST_NAME = process.env.HOST_NAME;
const counters = {};
const app = express();
let visitedPages = [];
global.totalUpdated = 10;
global.manhwas;
global.buildDate = Date.now();
global.lastUpdated;
const v4options = {
    random: [
        0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58, 0x36,
    ],
};

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(express.static('public'))
app.set('trust proxy', true);
app.use(session({ secret: uuidv4(v4options).toString(), resave: false, saveUninitialized: false, cookie: { sameSite: 'lax', maxAge: 30 * 24 * 60 * 100, httpOnly: true, hostOnly: true, secure: false } }));

app.use(expressVisitorCounter({ hook: counterId => counters[counterId] = (counters[counterId] || 0) + 1 }));
app.use(flashMessage);
initializePassport(app);
app.use(cors({
    origin: HOST_NAME,
    credentials: true
}))


app.use(async (req, res, next) => {
    if (!global.manhwas) {
        await manhwaController.getAllManhwas();
    }
    next();
})


app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    req.session.counter = counters;
    if (global.manhwas) {
        res.locals.manhwasSearch = global.manhwas.manhwas;
        res.locals.totalManhwas = global.manhwas.totalManhwas;
    }

    if (req.headers.referer != undefined && !req.headers.referer.includes('login'))
        visitedPages.push(req.headers.referer);
    req.session.visitedPages = visitedPages;
    if (req.user != undefined) {
        req.session.user = { id: req.user.id, username: req.user.username, email: req.user.email, rol: req.user.rol };
        res.locals.currentUser = { id: req.user.id, username: req.user.username, email: req.user.email, rol: req.user.rol };
    }
    res.locals.host = HOST_NAME;
    res.locals.url = req.originalUrl;

    next();
})


app.use((req, res, next) => {
    if (req.headers.cookie == undefined || (global.buildDate != undefined && req.headers.cookie.indexOf(global.buildDate) == -1)) {
        res.cookie('newBuild', true, { sameSite: 'lax', secure: true });
        res.cookie('dateBuild', global.buildDate, { sameSite: 'lax', secure: true, httpOnly: true, hostOnly: true });
    }
    next();
})
app.use('/', pages);
app.use('/auth', isAuthenticated, auth)
app.use('/admin', checkRole(2), admin);

app.use('*', (req, res, next) => {
    res.status(404).render('page_not_found.ejs', { title: '404: file not found', url: process.env.HOST_NAME + req.originalUrl });
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
    setInterval(async () => {
        scheduledFetch(null, null, null, HOST_NAME);
    }, 1000 * 60 * 60 * 6)
})