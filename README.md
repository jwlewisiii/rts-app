# James Lewis' Finnhub.io App

An Express.js application that allows logged-in users to look up stock information via finnhub.io.

## Pages

| Path         | Description                          |
|--------------|--------------------------------------|
| `/`          | Home / landing page                  |
| `/login`     | Log in form                          |
| `/signup`    | Sign up form                         |
| `/dashboard` | Stock lookup dashboard (auth required) |

## API Routes

| Method | Path          | Description                        |
|--------|---------------|------------------------------------|
| POST   | `/api/signup` | Create a new account               |
| POST   | `/api/login`  | Log in with email and password     |
| POST   | `/api/logout` | Log out and destroy session        |
| POST   | `/api/quote`  | Look up a stock's opening price (auth required) |

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- A free API key from [finnhub.io/register](https://finnhub.io/register)

## Running with Docker Compose

Set your Finnhub API key before building:

```sh
# Bash / macOS / Linux
export FINNHUB_API_KEY="your-api-key-here"
```

Then build and start the containers:

```sh
docker compose up --build
```

The app will be available at `http://localhost:3000` once MySQL passes its health check.

## Running Tests

Install dev dependencies and run the test suite:

```sh
npm install
npm test
```

Tests use [Jest](https://jestjs.dev/) and [Supertest](https://github.com/ladakh/supertest) to exercise the signup, login, and logout routes without requiring a running database.

> **Note:** Node.js v14.15+ is required. 

## Environment variables

| Variable           | Default       | Description                  |
|--------------------|---------------|------------------------------|
| `PORT`             | `3000`        | Port the server listens on   |
| `FINNHUB_API_KEY`  | —             | API key from finnhub.io (required) |
| `DB_HOST`          | `localhost`   | MySQL host                   |
| `DB_USER`          | `appuser`     | MySQL user                   |
| `DB_PASSWORD`      | `apppassword` | MySQL password               |
| `DB_NAME`          | `finnhub_app` | MySQL database name          |
| `SESSION_SECRET`   | `change-me-in-production` | Secret for signing session cookies |
