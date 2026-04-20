# Aidela Africa Deployment

## Backend

### Recommended target
Use Render for the Express API. The repo includes [render.yaml](./render.yaml) so Render can create the service from source control.

### Required backend environment variables

Copy [backend/.env.example](./backend/.env.example) into your Render service environment and replace the placeholder values:

- `NODE_ENV=production`
- `MONGO_URI=<your MongoDB Atlas connection string>`
- `JWT_SECRET=<long random secret>`
- `CLIENT_URL=https://your-frontend-domain.vercel.app`

You do not need to set `PORT` manually on Render; Render injects it automatically.

### Backend health check

The API exposes `GET /health` for platform health checks.

## Frontend

### Recommended target
Use Vercel for the Vite frontend.

### Required frontend environment variables

Copy [frontend/aidela-africa/.env.example](./frontend/aidela-africa/.env.example) into your Vercel project environment and replace the placeholder value:

- `VITE_API_URL=https://your-backend-domain.onrender.com`

### Vercel project settings

- Framework preset: `Vite`
- Root directory: `frontend/aidela-africa`
- Build command: `pnpm build`
- Output directory: `dist`

## Production checks

Before go-live, verify:

1. `GET /health` returns `200` on the deployed API.
2. Frontend requests point to the deployed backend URL, not `localhost`.
3. Register/login works.
4. Recruiters can create jobs.
5. Jobseekers can apply and view their applications.
6. Recruiters can review applicants and update status.
