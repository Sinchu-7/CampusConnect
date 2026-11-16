import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import { demoStudent } from "./data/demoData.js";

const SESSION_KEY = "campusconnect-demo-session";
const ACCOUNTS_KEY = "campusconnect-demo-accounts";
const dashboardPaths = ["/dashboard", "/profile", "/attendance", "/timetable", "/examinations", "/assignments", "/announcements"];

function getStoredStudent() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [student, setStudent] = useState(getStoredStudent);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  function startSession(user, remember) {
    setStudent(user);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function login(email, password, remember) {
    let accounts = [];
    try {
      accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
    } catch {
      throw new Error("Saved demo accounts could not be read. Clear this site's local storage and try again.");
    }
    const account = accounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
    if (account) {
      const { password: _password, ...profile } = account;
      startSession(profile, remember);
      return;
    }
    if (email.trim().toLowerCase() === demoStudent.email && password.length >= 6) {
      startSession(demoStudent, remember);
      return;
    }
    throw new Error("We couldn't find a demo account with those details. Create an account or use aarav.sharma@campus.edu with any password (6+ characters).");
  }

  function register(values) {
    let accounts = [];
    try {
      accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
    } catch {
      throw new Error("Saved demo accounts could not be read. Clear this site's local storage and try again.");
    }
    if (accounts.some((account) => account.email.toLowerCase() === values.email.trim().toLowerCase())) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }
    const account = {
      name: values.name.trim(),
      studentId: values.studentId.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      department: values.department,
      semester: values.semester,
    };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, { ...account, password: values.password }]));
    startSession(account, true);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setStudent(null);
    navigate("/login", { replace: true });
  }

  const isDashboardPath = dashboardPaths.includes(location.pathname);
  if (isDashboardPath && !student) return <Navigate to="/login" replace />;
  if ((location.pathname === "/login" || location.pathname === "/register") && student) return <Navigate to="/dashboard" replace />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={login} />} />
      <Route path="/register" element={<RegisterPage onRegister={register} />} />
      {dashboardPaths.map((path) => <Route key={path} path={path} element={<div className="app-layout"><Sidebar student={student || demoStudent} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} /><DashboardPage student={student || demoStudent} section={path} onMenuClick={() => setSidebarOpen(true)} /></div>} />)}
      <Route path="*" element={<Navigate to={student ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
