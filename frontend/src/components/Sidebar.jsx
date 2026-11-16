import React from "react";
import { NavLink } from "react-router-dom";
import {
  Activity, Bell, CalendarDays, ClipboardCheck, GraduationCap, LayoutDashboard,
  LogOut, PanelLeftClose, UserRound, X,
} from "lucide-react";
import Brand from "./Brand.jsx";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "My profile", icon: UserRound },
  { to: "/attendance", label: "Attendance", icon: Activity },
  { to: "/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/examinations", label: "Examination", icon: GraduationCap },
  { to: "/assignments", label: "Assignments", icon: ClipboardCheck },
  { to: "/announcements", label: "Announcements", icon: Bell, badge: "3" },
];

export default function Sidebar({ student, open, onClose, onLogout }) {
  const initials = student.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return (
    <>
      <button className={`sidebar-scrim${open ? " is-visible" : ""}`} aria-label="Close navigation" onClick={onClose} />
      <aside className={`sidebar${open ? " sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Brand />
          <button className="sidebar-close icon-button" onClick={onClose} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="sidebar-label">YOUR WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {links.map(({ to, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} end={to === "/dashboard"} onClick={onClose} className={({ isActive }) => `side-link${isActive ? " active" : ""}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{badge && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon"><PanelLeftClose size={16} /></span>
            <div><strong>Make it a great day</strong><span>Your campus is in sync.</span></div>
          </div>
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div className="sidebar-user-copy"><strong>{student.name}</strong><span>{student.studentId}</span></div>
            <button className="logout-icon" onClick={onLogout} aria-label="Log out" title="Log out"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
