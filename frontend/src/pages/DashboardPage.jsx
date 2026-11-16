import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpen, CalendarDays,
  CheckCircle2, Clock3, MapPin, Menu, MoreHorizontal, Sparkles, TrendingUp,
} from "lucide-react";
import { announcements, assignments, examinations, subjects, timetable } from "../data/demoData.js";

const navigationTitles = {
  "/dashboard": "Dashboard", "/profile": "My profile", "/attendance": "Attendance",
  "/timetable": "Timetable", "/examinations": "Examination",
  "/assignments": "Assignments", "/announcements": "Announcements",
};
const today = new Date();
const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(today);

function PageHeading({ title, description, eyebrow = "YOUR ACADEMIC OVERVIEW" }) {
  return <div className="page-heading"><div><div className="section-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div></div>;
}

function Overview({ student }) {
  const [activeDay, setActiveDay] = useState("Today");
  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-copy">
          <div className="welcome-eyebrow"><span className="welcome-dot" /> YOUR CAMPUS AT A GLANCE</div>
          <h1>Good morning, {student.name.split(" ")[0]} <span className="wave">✦</span></h1>
          <p>A new day, a fresh start. Here’s what’s happening on your campus.</p>
          <div className="welcome-meta"><span><CalendarDays size={15} />{dateLabel}</span><span className="meta-divider" /><span>{student.semester} <span className="meta-dot">·</span> {student.department}</span></div>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-sun"><Sparkles size={27} /></div>
          <div className="art-card art-card-top"><span>THIS WEEK</span><strong>Looking good <span>✦</span></strong><i><b /></i></div>
          <div className="art-card art-card-bottom"><span className="art-check"><CheckCircle2 size={16} /></span><div><strong>You're on track</strong><small>Keep that momentum</small></div></div>
        </div>
      </section>

      <section className="stat-grid" aria-label="Academic summary">
        <article className="stat-card"><div className="stat-top"><span className="stat-icon violet-icon"><BookOpen size={19} /></span><span className="stat-trend"><TrendingUp size={13} /> This term</span></div><div className="stat-value">04</div><div className="stat-label">Enrolled subjects</div><div className="stat-foot">Across your semester</div></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon mint-icon"><CheckCircle2 size={19} /></span><span className="stat-trend trend-green"><TrendingUp size={13} /> +2.4%</span></div><div className="stat-value">87<span className="stat-unit">%</span></div><div className="stat-label">Attendance rate</div><div className="stat-progress"><span style={{ width: "87%" }} /></div><div className="stat-foot">You're above the 75% requirement</div></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon peach-icon"><CalendarDays size={19} /></span><span className="stat-trend trend-peach">Next up</span></div><div className="stat-value">03</div><div className="stat-label">Upcoming examinations</div><div className="stat-foot">First paper in 8 days</div></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon blue-icon"><ClipboardMark /></span><span className="stat-trend">On schedule</span></div><div className="stat-value">02</div><div className="stat-label">Assignments due</div><div className="stat-foot">Next deadline · Nov 19</div></article>
      </section>

      <div className="dashboard-columns">
        <section className="panel timetable-panel">
          <div className="panel-heading"><div><div className="panel-kicker">YOUR SCHEDULE</div><h2>Today’s timetable</h2></div><Link className="panel-link" to="/timetable">Full schedule <ArrowRight size={15} /></Link></div>
          <div className="day-tabs">{["Today", "Tomorrow", "Friday"].map((day) => <button key={day} className={activeDay === day ? "day-tab active" : "day-tab"} onClick={() => setActiveDay(day)}>{day}</button>)}</div>
          <div className="timeline">
            {timetable.slice(0, 3).map((item, index) => <div className={`timeline-row${index === 0 ? " current" : ""}`} key={item.code}>
              <div className="timeline-time">{activeDay === "Today" ? item.time : ["09:30 AM", "11:00 AM", "01:30 PM"][index]}</div>
              <div className={`timeline-mark ${item.color}`}><span /></div>
              <div className="timeline-class"><div><strong>{item.subject}</strong><span>{item.code}<i /> {item.room}</span></div><span className={`class-status ${index === 0 && activeDay === "Today" ? "in-progress" : ""}`}>{index === 0 && activeDay === "Today" ? "In progress" : "Upcoming"}</span></div>
            </div>)}
          </div>
        </section>
        <section className="panel exams-panel">
          <div className="panel-heading"><div><div className="panel-kicker">MARK YOUR CALENDAR</div><h2>Coming up</h2></div><Link className="panel-link" to="/examinations">All exams <ArrowRight size={15} /></Link></div>
          <div className="exam-list">{examinations.slice(0, 3).map((exam, index) => <div className="exam-row" key={exam.code}>
            <div className={`exam-date exam-date-${index}`}><span>{exam.date.split(" ")[0]}</span><strong>{exam.date.split(" ")[1].replace(",", "")}</strong></div>
            <div className="exam-info"><strong>{exam.subject}</strong><span>{exam.code} <i /> {exam.time}</span></div><span className="exam-countdown">{exam.days}</span>
          </div>)}</div>
          <div className="exam-note"><Clock3 size={15} /><span>Exam week begins in <strong>8 days</strong>. You’ve got this!</span></div>
        </section>
      </div>

      <div className="dashboard-columns lower-columns">
        <section className="panel subjects-panel">
          <div className="panel-heading"><div><div className="panel-kicker">KEEP AN EYE ON IT</div><h2>Subject attendance</h2></div><Link className="panel-link" to="/attendance">View all <ArrowRight size={15} /></Link></div>
          <div className="subject-list">{subjects.map((subject) => <div className="subject-row" key={subject.code}><span className={`subject-symbol ${subject.color}`}><BookOpen size={16} /></span><div className="subject-info"><strong>{subject.name}</strong><span>{subject.code}</span></div><div className="subject-bar"><span style={{ width: `${subject.attendance}%` }} className={subject.attendance < 80 ? "bar-warning" : ""} /></div><strong className={subject.attendance < 80 ? "attendance-warning" : "attendance-good"}>{subject.attendance}%</strong></div>)}</div>
        </section>
        <section className="panel announcements-panel">
          <div className="panel-heading"><div><div className="panel-kicker">AROUND CAMPUS</div><h2>Latest updates</h2></div><Link className="panel-link" to="/announcements">All updates <ArrowRight size={15} /></Link></div>
          <div className="announcement-list">{announcements.slice(0, 2).map((item, index) => <article className="announcement-item" key={item.title}><div className={`announcement-icon announcement-${index}`}><Bell size={16} /></div><div><div className="announcement-meta">{item.category}<span>·</span>{item.date}</div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div>
        </section>
      </div>
      <footer className="dashboard-footer"><span>Made for your next chapter <span className="footer-spark">✳</span></span><span>CAMPUSCONNECT <i>·</i> {student.studentId}</span></footer>
    </>
  );
}

function ClipboardMark() {
  return <span className="clipboard-mark"><CheckCircle2 size={19} /></span>;
}

function ListingPage({ section, student }) {
  const initials = student.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  if (section === "/profile") return <><PageHeading title="My profile" description="Your student details, all in one place." eyebrow="YOUR ACCOUNT" /><section className="panel profile-card"><div className="profile-avatar">{initials}</div><div className="profile-details"><div className="profile-name">{student.name}</div><p>Student profile</p><div className="profile-fields"><span><strong>Student ID</strong>{student.studentId}</span><span><strong>Department</strong>{student.department}</span><span><strong>Semester</strong>{student.semester}</span><span><strong>Email</strong>{student.email}</span></div></div></section></>;
  if (section === "/attendance") return <><PageHeading title="Attendance" description="Stay on top of your class participation and keep your semester on track." eyebrow="YOUR ACADEMIC RECORD" /><section className="panel listing-panel"><div className="attendance-summary"><div className="attendance-big">87<span>%</span></div><div><strong>Overall attendance</strong><p>You’re comfortably above the 75% minimum.</p></div><div className="attendance-ring"><span>87%</span></div></div><div className="listing-title">Attendance by subject</div><div className="subject-list">{subjects.map((subject) => <div className="subject-row" key={subject.code}><span className={`subject-symbol ${subject.color}`}><BookOpen size={16} /></span><div className="subject-info"><strong>{subject.name}</strong><span>{subject.code}</span></div><div className="subject-bar"><span style={{ width: `${subject.attendance}%` }} className={subject.attendance < 80 ? "bar-warning" : ""} /></div><strong className={subject.attendance < 80 ? "attendance-warning" : "attendance-good"}>{subject.attendance}%</strong></div>)}</div></section></>;
  if (section === "/timetable") return <><PageHeading title="Your timetable" description="A little structure makes room for a lot of great things." eyebrow="THE WEEK AHEAD" /><section className="panel listing-panel"><div className="panel-heading"><div><div className="panel-kicker">MONDAY · NOVEMBER 16</div><h2>Today’s classes</h2></div><span className="today-pill">4 classes</span></div><div className="full-timetable">{timetable.map((item, index) => <div className="full-class" key={item.code}><div className="full-time">{item.time}<span>{index === 0 ? "50 min" : "1 hr"}</span></div><span className={`full-class-dot ${item.color}`} /><div className="full-class-content"><strong>{item.subject}</strong><span>{item.code} <i /> Dr. {["Meera Rao", "Anita Desai", "R. Prakash", "Kiran Kumar"][index]}</span></div><span className="room-location"><MapPin size={14} />{item.room}</span></div>)}</div></section></>;
  if (section === "/examinations") return <><PageHeading title="Examinations" description="Your upcoming papers and everything you need to feel prepared." eyebrow="PLAN WITH CONFIDENCE" /><section className="panel listing-panel"><div className="panel-heading"><div><div className="panel-kicker">END-SEMESTER · NOV–DEC 2026</div><h2>Upcoming examinations</h2></div><span className="today-pill">3 scheduled</span></div><div className="exam-list exam-list-full">{examinations.map((exam, index) => <div className="exam-row" key={exam.code}><div className={`exam-date exam-date-${index}`}><span>{exam.date.split(" ")[0]}</span><strong>{exam.date.split(" ")[1].replace(",", "")}</strong></div><div className="exam-info"><strong>{exam.subject}</strong><span>{exam.code} <i /> {exam.time} <i /> <MapPin size={13} />{exam.venue}</span></div><span className="exam-countdown">{exam.days}</span></div>)}</div></section></>;
  if (section === "/assignments") return <><PageHeading title="Assignments" description="Small steps add up. Here’s what’s on your plate." eyebrow="YOUR COURSEWORK" /><section className="panel listing-panel"><div className="panel-heading"><div><div className="panel-kicker">SEMESTER 6</div><h2>Recent assignments</h2></div><span className="today-pill">2 due soon</span></div><div className="assignment-list">{assignments.map((task, index) => <article className="assignment-row" key={task.title}><span className={`assignment-icon assignment-icon-${index}`}><BookOpen size={18} /></span><div className="assignment-info"><strong>{task.title}</strong><span>{task.subject}</span></div><div className="assignment-due"><span>Due date</span><strong>{task.due}</strong></div><span className={`assignment-status status-${index}`}>{task.status}</span></article>)}</div></section></>;
  return <><PageHeading title="Campus announcements" description="The latest news, notices, and little things worth knowing." eyebrow="A LITTLE CAMPUS NEWS" /><section className="announcement-list-page">{announcements.map((item, index) => <article className="panel announcement-card" key={item.title}><div className={`announcement-icon announcement-${index}`}><Bell size={17} /></div><div className="announcement-card-body"><div className="announcement-meta">{item.category}<span>·</span>{item.date}</div><h2>{item.title}</h2><p>{item.body}</p></div><MoreHorizontal className="announcement-more" size={20} /></article>)}</section></>;
}

export default function DashboardPage({ student, section, onMenuClick }) {
  const title = navigationTitles[section] || "Dashboard";
  return (
    <div className="dashboard-content">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={onMenuClick} aria-label="Open navigation"><Menu size={19} /></button><div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{title}</strong></div><div className="topbar-right"><span className="topbar-date">{dateLabel}</span><span className="connected-status"><i /> Campus connected</span>      <Link className="notification-button" to="/announcements" aria-label="Notifications"><Bell size={18} /><i /></Link></div></header>
      <main className="content-area">
        {section === "/dashboard" ? <Overview student={student} /> : <ListingPage section={section} student={student} />}
      </main>
    </div>
  );
}
