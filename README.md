# Real Estate App

This project is structured as a beginner-friendly full-stack app with separate backend and frontend folders.

## Backend

The backend contains:
- config/
- controllers/
- models/
- routes/
- middleware/
- app.js
- server.js

## Frontend

The frontend contains:
- src/
- App.jsx
- main.jsx
- index.css

## Environment variables

Create the following files before starting the application. These files are already ignored by the root `.gitignore` and should not be committed.

### Backend

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/real-estate-db
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SEED_SAMPLE_DATA=false
```

`MONGO_URI` is optional. If it is not set, the backend starts a temporary in-memory MongoDB database for local development.
Set `SEED_SAMPLE_DATA=true` to automatically add sample properties when starting the backend in development. To seed manually, run `npm run seed:properties` from `backend`; use `npm run seed:properties:remove` to remove only sample properties.

### Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` points the frontend to the backend API. Only variables prefixed with `VITE_` are available in the frontend, so do not put secrets in this file.

## Run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
