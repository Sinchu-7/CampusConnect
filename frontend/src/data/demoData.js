export const demoStudent = {
  name: "Aarav Sharma",
  studentId: "4NI22CS042",
  email: "aarav.sharma@campus.edu",
  phone: "+91 98765 43210",
  department: "Computer Science & Engineering",
  semester: "6th Semester",
};

export const subjects = [
  { code: "CS601", name: "Machine Learning", instructor: "Dr. Meera Rao", attendance: 92, color: "violet" },
  { code: "CS602", name: "Cloud Computing", instructor: "Prof. Kiran Kumar", attendance: 86, color: "blue" },
  { code: "CS603", name: "Computer Networks", instructor: "Dr. Anita Desai", attendance: 78, color: "pink" },
  { code: "CS604", name: "Software Engineering", instructor: "Prof. R. Prakash", attendance: 95, color: "green" },
];

export const timetable = [
  { time: "09:00 AM", subject: "Machine Learning", code: "CS601", room: "Block A · 204", color: "violet" },
  { time: "10:30 AM", subject: "Computer Networks", code: "CS603", room: "Block B · 108", color: "blue" },
  { time: "12:00 PM", subject: "Software Engineering", code: "CS604", room: "Block A · 310", color: "pink" },
  { time: "02:00 PM", subject: "Cloud Computing", code: "CS602", room: "Lab 2 · C Wing", color: "green" },
];

export const examinations = [
  { subject: "Machine Learning", code: "CS601", date: "Nov 24, 2026", time: "10:00 AM", venue: "Main Block · Hall 2", days: "8 days" },
  { subject: "Computer Networks", code: "CS603", date: "Nov 27, 2026", time: "02:00 PM", venue: "North Wing · Hall 1", days: "11 days" },
  { subject: "Cloud Computing", code: "CS602", date: "Dec 01, 2026", time: "10:00 AM", venue: "Main Block · Hall 3", days: "15 days" },
];

export const announcements = [
  { title: "Registration for TechNova 2026 is now open", category: "Campus life", date: "Today", body: "Join us for two days of ideas, innovation, and unforgettable campus energy. Sign-ups are open through November 22." },
  { title: "End-semester examination schedule published", category: "Academics", date: "Yesterday", body: "The examination timetable for Semester 6 is available. Please review your schedule and venue details." },
  { title: "Library extended hours during exam week", category: "Campus update", date: "Nov 12", body: "The central library will remain open until 10 PM from November 20 to December 5." },
];

export const assignments = [
  { title: "Neural Network Classification", subject: "Machine Learning", due: "Nov 19, 2026", status: "In progress" },
  { title: "Routing Protocol Analysis", subject: "Computer Networks", due: "Nov 21, 2026", status: "Not started" },
  { title: "Cloud Deployment Report", subject: "Cloud Computing", due: "Nov 25, 2026", status: "Submitted" },
];
