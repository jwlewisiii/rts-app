const express = require('express');
const path = require('path');

const router = express.Router();
const viewsDir = path.join(__dirname, '..', 'views');

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

router.get('/', (req, res) => {
  res.sendFile(path.join(viewsDir, 'home.html'));
});

router.get('/login', (req, res) => {
  res.sendFile(path.join(viewsDir, 'login.html'));
});

router.get('/signup', (req, res) => {
  res.sendFile(path.join(viewsDir, 'signup.html'));
});

router.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(viewsDir, 'dashboard.html'));
});

module.exports = router;
