import passport from 'passport';
import LocalStrategy from 'passport-local';
import db from './Database.js';
import bcrypt from 'bcryptjs';
export default function initializePassport(app) {
    passport.use(new LocalStrategy(
        async function (username, password, done) {
            try {
                const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
                if (rows.length === 0) {

                    return done(null, false, { message: 'Password or username incorrect.' });
                }
                const user = rows[0];
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    return done(null, false, { message: 'Password or username incorrect.' });
                }
                return done(null, { id: user.id, username: user.username, email: user.email, rol: user.rol });
            } catch (error) {
                return done(error);
            }
        }
    ));


    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser(async (user, done) => {
        try {
            const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [user.id]);
            done(null, rows[0]);
        } catch (error) {
            done(error);
        }
    });

    app.use(passport.initialize());
    app.use(passport.session());
}