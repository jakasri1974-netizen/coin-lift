# CrypLift — Phase 9 Production Deployment Guide

## Architecture
- **Frontend**: Vite + React SPA (Static distribution built via `npm run build`).
- **Backend**: Node.js + Express HTTP & Socket.IO server.
- **Database**: MongoDB Atlas Cluster with replica sets and automated backups.

## Production Environment Variables

### Backend (`backend/.env`)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/cryplift?retryWrites=true&w=majority
JWT_SECRET=production_ultra_secure_jwt_secret_key_2026
CLIENT_URL=https://cryplift.app
CORS_ORIGIN=https://cryplift.app
```

### Frontend (`.env`)
```env
VITE_API_URL=https://api.cryplift.app/api
```

## Deployment Commands
```bash
# Build production bundle
npm run build

# Start production backend server
npm start
```
