export default function checkRole(role) {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }
    if (req.user.rol !== role) {
      return res.status(403).send('Access denied');
    }
    next();
  }
}