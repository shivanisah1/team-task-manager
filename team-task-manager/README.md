# Team Task Manager (Full-Stack)

A web application for project and task management with **Admin** and **Member** role-based access control.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Bootstrap 5         |
| Backend  | Node.js, Express                    |
| Database | MongoDB (Mongoose)                  |

## Features

- Secure signup and login (JWT)
- Create and manage projects (Admin)
- Add team members to projects
- Create, assign, and update tasks
- Dashboard with task summaries and overdue list
- RBAC: Admin vs Member permissions

## Project Structure

```
team-task-manager/
├── backend/          # REST API
├── frontend/         # React SPA
└── README.md
```

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

API runs at `http://localhost:5000`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:3000` (proxies `/api` to backend in dev).

## API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | `/api/auth/signup`    | Register user            |
| POST   | `/api/auth/login`     | Login                    |
| GET    | `/api/auth/me`        | Current user             |
| GET    | `/api/projects`       | List projects            |
| POST   | `/api/projects`       | Create project (Admin)   |
| GET    | `/api/tasks`          | List tasks               |
| POST   | `/api/tasks`          | Create task              |
| GET    | `/api/dashboard`      | Dashboard stats          |

## RBAC Summary

| Action              | Admin | Member        |
|---------------------|-------|---------------|
| Create project      | Yes   | No            |
| Create task         | Yes   | Yes (in team) |
| Update task status  | Yes   | Assigned only |
| Delete project      | Yes   | No            |

## Deploy on Railway

1. Push this repo to GitHub.
2. Create a **MongoDB** service on Railway (or use Atlas).
3. Deploy **backend** service:
   - Root: `backend`
   - Start: `npm start`
   - Env: `MONGODB_URI`, `JWT_SECRET`, `PORT`
4. Deploy **frontend** service:
   - Root: `frontend`
   - Build: `npm run build`
   - Start: `npx serve -s dist` (or use static hosting)
   - Env: `VITE_API_URL=https://your-backend.railway.app/api`
5. Rebuild frontend after setting `VITE_API_URL`.

## Demo Accounts

Sign up via the UI and choose **Admin** or **Member** role on registration.

## License

MIT
