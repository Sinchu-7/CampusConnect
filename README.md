# CampusConnect

CampusConnect includes a responsive React/Vite college dashboard and a separate Express/MongoDB API. The frontend demo is intentionally standalone: it does not call the API, connect to MongoDB, or provide real authentication.

## Requirements

- Node.js 20 or newer and npm
- No database or backend setup is needed to run the frontend demo

## Run the frontend demo

1. Open a terminal at the repository root and move into the frontend:

   ```powershell
   cd frontend
   ```

2. Install the frontend dependencies:

   ```powershell
   npm install
   ```

3. Start the Vite development server:

   ```powershell
   npm run dev
   ```

4. Open the local URL printed by Vite (normally <http://localhost:5173>).

You can sign in with the sample account `aarav.sharma@campus.edu` and any password with at least six characters, or create a student account. Demo accounts and sessions are stored in this browser only. This is not secure authentication; do not enter a real password or sensitive personal information.

## Frontend structure

The standalone React app lives in `frontend/`: `src/components/` contains reusable interface elements, `src/pages/` contains login, registration, and dashboard screens, `src/data/` contains sample campus data, and `src/styles/` contains the responsive theme. Use `npm run build` from `frontend/` to create a production build.

## Environment variables

The following variables are for the existing optional backend only. They are not needed by the frontend demo.

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime environment |
| `PORT` | HTTP port (defaults to `3000`) |
| `MONGODB_URI` | MongoDB connection string; never commit a real value |
| `JWT_SECRET` | Private signing secret of at least 32 characters |
| `JWT_EXPIRES_IN` | JWT lifetime accepted by `jsonwebtoken` (defaults to `8h`) |
| `COOKIE_SECURE` | Set to `true` behind HTTPS; keep `false` for local HTTP |
| `CLIENT_ORIGIN` | Allowed CORS origin (defaults to `http://localhost:3000`) |
| `ADMIN_NAME` | Initial seed administrator name |
| `ADMIN_EMAIL` | Initial seed administrator email |
| `ADMIN_PASSWORD` | One-time seed password (at least 12 characters) |

For production, serve the site over HTTPS, set `COOKIE_SECURE=true`, use a strong unique JWT secret, and restrict `CLIENT_ORIGIN` to the actual frontend origin.

## Existing backend and API

The API in `backend/` is separate from the frontend demo and requires Node.js 20+, MongoDB 6+ (local or Atlas), and backend environment variables. To run it, install the root dependencies with `npm install`, configure `.env` using `.env.example`, start MongoDB, and run `npm start` from the repository root. The current React frontend does not use this API.

The backend provides password hashing, HttpOnly/SameSite JWT cookies, login and registration rate limiting, role-scoped API access, student/faculty/admin management, academic records, and audience-filtered announcements.

## REST API

All API responses use JSON. Authenticated requests use the HttpOnly `campusconnect_token` cookie.

| Area | Routes | Access |
| --- | --- | --- |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/me` | Public registration is limited to student/faculty; other routes require a session |
| Accounts | `GET/POST /api/users`, `PATCH/DELETE /api/users/:id` | Admin |
| Departments | `GET/POST /api/academics/departments`, `PATCH/DELETE /api/academics/departments/:id` | Read: signed-in users; writes: admin |
| Courses | `GET/POST /api/academics/courses`, `PATCH/DELETE /api/academics/courses/:id` | Read: signed-in users; writes: admin |
| Attendance | `GET/POST /api/records/attendance`, `PATCH/DELETE /api/records/attendance/:id` | Students read their own; faculty read/manage assigned-course records; admin manage all |
| Marks | `GET/POST /api/records/marks`, `PATCH/DELETE /api/records/marks/:id` | Students read their own; faculty read/manage assigned-course records; admin manage all |
| Timetable | `GET/POST /api/records/timetable`, `PATCH/DELETE /api/records/timetable/:id` | Read: signed-in users with role/department scoping; writes: admin |
| Announcements | `GET/POST /api/announcements`, `PATCH/DELETE /api/announcements/:id` | Read is audience/department scoped; faculty/admin can publish; admin can edit/remove |
| Dashboard | `GET /api/dashboard` | Signed-in users |
| Health | `GET /api/health` | Public |

## Tests

Run the API and security-boundary smoke tests:

```powershell
npm test
```

Tests that require live persistence need a reachable MongoDB instance and are not represented as passing by the isolated smoke tests.
