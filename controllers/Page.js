import user from "../models/User.js";
import manhwaModel from '../models/Manhwa.js';
import users from '../models/User.js';
import resizeImages from '../utils/resizeImages.js';
class Page {

    static showLoginForm(req, res, next) {
        res.render('layout', { template: 'pages/login.ejs', title: 'Login' });
    }

    static async getUsersCount() {
        const [usersCount] = await users.getUsersCount();
        return usersCount.usersCount;
    }

    static async register(req, res, next) {
        try {
            let errors = [];
            const { username, password, confpassword } = req.body;
            if (password != confpassword)
                errors.push('Passwords are not the same.');
            if (password.length < 8) {
                errors.push('password needs to be between 8 and 20 characters.');
            }
            if (!/[a-z]/g.test(password)) {
                errors.push('password needs atleast 1 lowercase.');
            }
            if (!/[A-Z]/g.test(password)) {
                errors.push('password needs atleast 1 UPPERCASE.');
            }
            if (!/\d/g.test(password)) {
                errors.push('password needs atleast 1 number.');
            }
            if (!/[#$@!%&*?]/g.test(password)) {
                errors.push('password needs atleast 1 special character.');
            }

            const existingUser = await user.findByUsername(username);

            if (existingUser.length > 0)
                errors.push('Account already exists.')

            if (errors.length > 0) {
                res.flash(errors);
                return res.redirect('/register');
            }

            await user.create(username, password);
            res.flash('Account created!');
            console.log('Acount created');
            return res.redirect('/login');
        } catch (err) {
            console.log(err);
            return res.redirect('/register')
        }
    }

    static async resizeImages(req, res, next) {
        let manhwas = await manhwaModel.getAllManhwas();
        let size = { width: parseInt(req.params.size.split('x')[0]), height: parseInt(req.params.size.split('x')[1]) };
        for (let manhwa of manhwas) {
            await resizeImages(manhwa.mid, size);
        }
        res.write(`data: ${JSON.stringify({ progress: 100, done: true })}\n\n`);
        return;
    }
}
export default Page;