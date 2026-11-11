# Secure Notes API

REST API for a note-taking app with JWT auth and role-based access (user/admin), built with Express and MongoDB/Mongoose.

## Requirements

- Node.js >= 20.19
- MongoDB (local or Atlas)

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `MONGODB_URI` and `JWT_SECRET`.

## Run

```bash
npm run dev     # development (nodemon)
npm start        # production
npm test         # Jest test suite
```

Server runs on `http://localhost:3000` by default. API routes are under `/api`.
