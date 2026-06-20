const express = require('express');
const User = require('../models/user');
const { getQuote } = require('../services/finnhub');

const router = express.Router();

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
}

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await User.create(name, email, password);
    req.session.userId = user.id;
    req.session.userName = user.name;
    res.redirect('/dashboard');
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findByEmail(email);

    if (!user || !(await User.verifyPassword(user, password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.id;
    req.session.userName = user.name;
    res.redirect('/dashboard');
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/quote', requireAuth, async (req, res) => {
  const { symbol } = req.body;

  if (!symbol) {
    return res.status(400).json({ error: 'Stock symbol is required' });
  }

  try {
    const quote = await getQuote(symbol.toUpperCase());

    if (!quote || quote.o === 0) {
      return res.status(404).json({ error: 'Symbol not found' });
    }

    res.json({ symbol: symbol.toUpperCase(), openPrice: quote.o });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
