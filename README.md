# CampusConnect

CampusConnect is a role-aware college management system with a vanilla HTML/CSS/JavaScript client, an Express REST API, and MongoDB persistence through Mongoose. It supports administrator, student, and faculty accounts.

## Requirements

- Node.js 20 or newer and npm
- MongoDB 6+ locally, or a MongoDB Atlas cluster

## Run locally

1. Install the project dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env`. Set `MONGODB_URI` to your local MongoDB URL or Atlas connection string. Replace `JWT_SECRET` with a private random value of at least 32 characters. Configure the seed administrator values before creating the first admin.

   A PowerShell example for generating a secret:

   ```powershell
   [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
   ```

3. Start MongoDB if you are using a local instance, then create the initial administrator once:

   ```powershell
   npm run seed:admin
   ```

   The seed refuses to run if an administrator already exists. It reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `.env`; the password must be at least 12 characters. Do not share or commit `.env`.

4. Start the server and open <http://localhost:3000>:

   ```powershell
   npm start
   ```

   For development with Node's file watcher, use `npm run dev`.

Students and faculty can register through the sign-in page. Administrator registration is not public; use the one-time seed or have an administrator provision accounts.

## Environment variables

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

## Features

- Password hashing with bcrypt, HttpOnly/SameSite JWT cookies, logout, authenticated profile updates, and login/registration rate limiting.
- Role-scoped dashboards and API permissions for admins, students, and faculty.
- Admin-managed accounts, departments, courses, and timetables.
- Attendance and assessment records; students see their own records, while faculty can only manage records in assigned courses.
- Audience- and department-filtered announcements.
- Responsive dark dashboard, search, data-entry dialogs, confirmations, loading states, and toast notifications.
- MongoDB-backed persistence; the app fails clearly at startup when the database URI or JWT secret is missing.

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
