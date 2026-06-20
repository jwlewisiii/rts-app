const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const createApp = require('./app');

const PORT = process.env.PORT || 3000;

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_NAME || 'finnhub_app',
});

const app = createApp(sessionStore);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
