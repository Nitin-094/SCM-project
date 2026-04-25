# Clean MERN Project (No Docker)

This project contains only:
- React (Vite) frontend
- Node.js + Express backend
- MongoDB (local instance)

## Run backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5000` and exposes:
- `GET /api/health`

## Run frontend

```bash
cd frontend
npm run dev
```

Frontend runs at the Vite dev URL (typically `http://localhost:5173`).

## MongoDB requirement

Ensure local MongoDB is running and reachable at:
`mongodb://127.0.0.1:27017/clean_mern_db`

You can change this in `backend/.env`.
# SCM-project
