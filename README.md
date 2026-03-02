# Webbshop 2026 - Backend (MEN Stack)

**MEN Stack:** MongoDB · Express · Node.js

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
   *Note: `mongodb-memory-server` is used for testing. It is very heavy and therefore will take a lot of time to install.*

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if needed (e.g. MongoDB connection string).

   *Note: MongoDB is required to be installed and running locally or on Atlas.*

3. **Start MongoDB** (must be running locally or use Atlas)
   ```bash
   # If using local MongoDB
   mongod --dbpath <path to data directory>
   ```

4. **Run the server**
   ```bash
   npm run dev    # Development with auto-reload
   npm start      # Production
   ```

## API

- `GET /` — API info
- `GET /health` — Health check

## Project structure

```
src/
├── config/
│   └── database.js   # MongoDB connection
├── server.js         # Express app entry
└── (add: routes/, models/, controllers/)
```
