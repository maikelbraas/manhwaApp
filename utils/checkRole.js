export default function checkRole(role) {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect('/aV46X3j9z9m6');
    }
    if (req.user.rol !== role) {
      return res.status(403).send('Access denied');
    }
    next();
  }
}