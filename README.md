# 🎓 CampusConnect – College Management Dashboard

CampusConnect is a modern and responsive college management system designed to simplify campus administration and academic management. It features a React-based dashboard with a standalone frontend demo and a separate Express.js backend API integrated with MongoDB.

The project demonstrates a full-stack architecture featuring modern UI design, REST APIs, database integration, authentication, security, and role-based access control.

---

## ✨ Features

### 💻 Frontend
- Responsive React dashboard built using Vite.
- Modern and user-friendly interface.
- Login and student registration pages.
- Dashboard displaying sample campus information.
- Reusable React components.
- Responsive design for desktop and mobile devices.
- Standalone demo using browser local storage.
- Sample student account for demonstration.

### ⚙️ Backend
- REST API built using Express.js.
- MongoDB integration using Mongoose.
- Secure password hashing.
- JWT-based authentication using HttpOnly cookies.
- Role-Based Access Control (RBAC).
- Login and registration rate limiting.
- Student, faculty, and administrator management.
- Department and course management.
- Attendance and marks management.
- Timetable management.
- Audience-based announcements.
- Dashboard API.
- Health-check endpoint.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, HttpOnly Cookies |
| Security | Password Hashing, Rate Limiting, RBAC |
| API | REST API |
| Testing | Node.js Test Runner |
| Tools | Git, GitHub, VS Code, npm |

---

## 📁 Project Structure

```text
CampusConnect/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── data/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── ...
│
├── tests/
├── .env.example
├── package.json
└── README.md
```

> The exact backend and test folder structure may vary depending on the implementation.

---

## 🚀 Getting Started

### Prerequisites

Install the following software:

- [Node.js 20+](https://nodejs.org/)
- npm
- [Git](https://git-scm.com/)

The frontend demo can run independently without MongoDB or backend configuration.

---

## 💻 Running the Frontend Demo

The frontend currently operates independently using sample data and browser local storage. It does not connect to the backend API or MongoDB.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/CampusConnect.git
```

### 2. Navigate to the project

```bash
cd CampusConnect
```

### 3. Navigate to frontend

```bash
cd frontend
```

### 4. Install dependencies

```bash
npm install
```

### 5. Start the development server

```bash
npm run dev
```

### 6. Open the application

Visit the URL displayed in your terminal:

```text
http://localhost:5173
```

### Demo Login

| Field | Value |
|---|---|
| Email | aarav.sharma@campus.edu |
| Password | Any password with at least 6 characters |

You can also register a new student account through the registration page.

> Demo accounts and sessions are stored locally in the browser. This demo does not implement real authentication. Avoid entering real passwords or sensitive information.

---

## 🗄️ Backend Setup

The backend is a separate Express.js API that supports authentication, database persistence, and campus management functionality.

### Prerequisites

- Node.js 20+
- MongoDB 6+ (Local installation or MongoDB Atlas)

### 1. Install root dependencies

Navigate to the project root:

```bash
npm install
```

### 2. Configure environment variables

Create an environment file using `.env.example`.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Mac/Linux:**

```bash
cp .env.example .env
```

### 3. Configure MongoDB

Add your MongoDB connection string to `.env`.

**Local MongoDB:**

```env
MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
```

**MongoDB Atlas:**

Use your MongoDB Atlas connection string.

### 4. Configure environment variables

Example `.env` configuration:

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect

JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
JWT_EXPI
