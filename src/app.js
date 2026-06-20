const express = require('express');
const session = require('express-session');
const pageRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');

function createApp(sessionStore) {
  const app = express();

  const sessionOpts = {
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  };

  if (sessionStore) {
    sessionOpts.store = sessionStore;
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(session(sessionOpts));

  app.use('/', pageRoutes);
  app.use('/api', apiRoutes);

  return app;
}

module.exports = createApp;
