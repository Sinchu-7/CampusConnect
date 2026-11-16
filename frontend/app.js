const state = { user: null, page: 'overview', register: false, cache: {}, search: '' };
const roleLabels = { admin: 'Administrator', student: 'Student', faculty: 'Faculty' };
const navItems = [
  { id: 'overview', label: 'Overview', icon: '⌂', roles: ['admin', 'student', 'faculty'] },
  { id: 'students', label: 'Students', icon: '♙', roles: ['admin'] },
  { id: 'faculty', label: 'Faculty', icon: '♧', roles: ['admin'] },
  { id: 'departments', label: 'Departments', icon: '▦', roles: ['admin'] },
  { id: 'courses', label: 'Courses', icon: '▤', roles: ['admin', 'student', 'faculty'] },
  { id: 'attendance', label: 'Attendance', icon: '◷', roles: ['admin', 'student', 'faculty'] },
  { id: 'results', label: 'Marks & Results', icon: '◈', roles: ['admin', 'student', 'faculty'] },
  { id: 'timetable', label: 'Timetable', icon: '▣', roles: ['admin', 'student', 'faculty'] },
  { id: 'announcements', label: 'Announcements', icon: '◉', roles: ['admin', 'student', 'faculty'] },
  { id: 'profile', label: 'My profile', icon: '◎', roles: ['admin', 'student', 'faculty'] }
];

const resourceConfig = {
  students: {
    title: 'Students', endpoint: '/api/users?role=student', collection: '/api/users',
    createRoles: ['admin'], fields: [
      { name: 'name', label: 'Full name', required: true },
      { name: 'email', label: 'Email address', type: 'email', required: true },
      { name: 'password', label: 'Temporary password', type: 'password', required: true },
      { name: 'studentId', label: 'Student ID' },
      { name: 'department', label: 'Department', type: 'select', options: 'departments', optionLabel: 'name', optionValue: '_id' },
      { name: 'phone', label: 'Phone' }
    ],
    columns: [
      { label: 'Student', value: (row) => person(row.name, row.email) },
      { label: 'Student ID', key: 'studentId', fallback: '—' },
      { label: 'Department', path: 'department.name', fallback: '—' },
      { label: 'Status', value: (row) => pill(row.active === false ? 'inactive' : 'active') }
    ], actions: true
  },
  faculty: {
    title: 'Faculty', endpoint: '/api/users?role=faculty', collection: '/api/users',
    createRoles: ['admin'], fields: [
      { name: 'name', label: 'Full name', required: true },
      { name: 'email', label: 'Email address', type: 'email', required: true },
      { name: 'password', label: 'Temporary password', type: 'password', required: true },
      { name: 'facultyId', label: 'Faculty ID' },
      { name: 'department', label: 'Department', type: 'select', options: 'departments', optionLabel: 'name', optionValue: '_id' },
      { name: 'phone', label: 'Phone' }
    ],
    columns: [
      { label: 'Faculty member', value: (row) => person(row.name, row.email) },
      { label: 'Faculty ID', key: 'facultyId', fallback: '—' },
      { label: 'Department', path: 'department.name', fallback: '—' },
      { label: 'Status', value: (row) => pill(row.active === false ? 'inactive' : 'active') }
    ], actions: true
  },
  departments: {
    title: 'Departments', endpoint: '/api/academics/departments', collection: '/api/academics/departments',
    createRoles: ['admin'], fields: [
      { name: 'name', label: 'Department name', required: true },
      { name: 'code', label: 'Short code', required: true },
      { name: 'description', label: 'Description', type: 'textarea' }
    ],
    columns: [
      { label: 'Department', value: (row) => person(row.name, row.description || 'Academic department') },
      { label: 'Code', key: 'code' },
      { label: 'Department head', path: 'head.name', fallback: 'Not assigned' },
      { label: 'Created', value: (row) => dateLabel(row.createdAt) }
    ], actions: true
  },
  courses: {
    title: 'Courses', endpoint: '/api/academics/courses', collection: '/api/academics/courses',
    createRoles: ['admin'], fields: [
      { name: 'name', label: 'Course name', required: true },
      { name: 'code', label: 'Course code', required: true },
      { name: 'department', label: 'Department', type: 'select', options: 'departments', optionLabel: 'name', optionValue: '_id', required: true },
      { name: 'faculty', label: 'Assigned faculty', type: 'select', options: 'faculty', optionLabel: 'name', optionValue: '_id', multiple: true },
      { name: 'semester', label: 'Semester', type: 'number', min: 1, max: 12, required: true },
      { name: 'credits', label: 'Credits', type: 'number', min: 1, max: 12 },
      { name: 'description', label: 'Description', type: 'textarea' }
    ],
    columns: [
      { label: 'Course', value: (row) => person(row.name, row.code) },
      { label: 'Department', path: 'department.name' },
      { label: 'Faculty', value: (row) => (row.faculty || []).map((item) => item.name).join(', ') || 'Unassigned' },
      { label: 'Semester', value: (row) => `Semester ${row.semester}` },
      { label: 'Credits', key: 'credits' }
    ], actions: true
  },
  attendance: {
    title: 'Attendance', endpoint: '/api/records/attendance', collection: '/api/records/attendance', editFields: ['date', 'status', 'note'],
    createRoles: ['admin', 'faculty'], fields: [
      { name: 'student', label: 'Student', type: 'select', options: 'students', optionLabel: 'name', optionValue: '_id', required: true },
      { name: 'course', label: 'Course', type: 'select', options: 'courses', optionLabel: 'name', optionValue: '_id', required: true },
      { name: 'date', label: 'Class date', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', values: ['present', 'absent', 'late'], required: true },
      { name: 'note', label: 'Note', type: 'textarea' }
    ],
    columns: [
      { label: 'Student', value: (row) => person(row.student?.name || 'Student', row.student?.studentId || '') },
      { label: 'Course', value: (row) => row.course?.code || row.course?.name || '—' },
      { label: 'Date', value: (row) => dateLabel(row.date) },
      { label: 'Status', value: (row) => pill(row.status) },
      { label: 'Recorded by', path: 'faculty.name', fallback: '—' }
    ], actions: true
  },
  results: {
    title: 'Marks & Results', endpoint: '/api/records/marks', collection: '/api/records/marks', editFields: ['assessment', 'score', 'maxScore', 'remarks'],
    createRoles: ['admin', 'faculty'], fields: [
      { name: 'student', label: 'Student', type: 'select', options: 'students', optionLabel: 'name', optionValue: '_id', required: true },
      { name: 'course', label: 'Course', type: 'select', options: 'courses', optionLabel: 'name', optionValue: '_id', required: true },
      { name: 'assessment', label: 'Assessment', required: true },
      { name: 'score', label: 'Score', type: 'number', min: 0, required: true },
      { name: 'maxScore', label: 'Maximum score', type: 'number', min: 1, required: true },
      { name: 'remarks', label: 'Remarks', type: 'textarea' }
    ],
    columns: [
      { label: 'Student', value: (row) => person(row.student?.name || 'Student', row.student?.studentId || '') },
      { label: 'Course', value: (row) => row.course?.code || row.course?.name || '—' },
      { label: 'Assessment', key: 'assessment' },
      { label: 'Score', value: (row) => `${row.score} / ${row.maxScore} (${Math.round(row.score / row.maxScore * 100)}%)` },
      { label: 'Recorded by', path: 'faculty.name', fallback: '—' }
    ], actions: true
  },
  timetable: {
    title: 'Timetable', endpoint: '/api/records/timetable', collection: '/api/records/timetable',
    createRoles: ['admin'], fields: [
      { name: 'course', label: 'Course', type: 'select', options: 'courses', optionLabel: 'name', optionValue: '_id', required: true },
      { name: 'faculty', label: 'Faculty', type: 'select', options: 'faculty', optionLabel: 'name', optionValue: '_id', required: true },
      { name: 'department', label: 'Department', type: 'select', options: 'departments', optionLabel: 'name', optionValue: '_id', required: true },
      { name: 'day', label: 'Day', type: 'select', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
      { name: 'startTime', label: 'Start time', type: 'time', required: true },
      { name: 'endTime', label: 'End time', type: 'time', required: true },
      { name: 'room', label: 'Room', required: true }
    ],
    columns: [
      { label: 'Course', value: (row) => person(row.course?.name || 'Course', row.course?.code || '') },
      { label: 'Day', key: 'day' },
      { label: 'Time', value: (row) => `${row.startTime} – ${row.endTime}` },
      { label: 'Faculty', path: 'faculty.name' },
      { label: 'Room', key: 'room' }
    ], actions: true
  },
  announcements: {
    title: 'Announcements', endpoint: '/api/announcements', collection: '/api/announcements',
    createRoles: ['admin', 'faculty'], fields: [
      { name: 'title', label: 'Announcement title', required: true },
      { name: 'body', label: 'Message', type: 'textarea', required: true },
      { name: 'audience', label: 'Audience', type: 'select', values: ['student', 'faculty', 'admin'], multiple: true },
      { name: 'expiresAt', label: 'Expires on', type: 'date' }
    ],
    columns: [
      { label: 'Announcement', value: (row) => person(row.title, shortText(row.body, 75)) },
      { label: 'Audience', value: (row) => (row.audience || []).join(', ') },
      { label: 'Posted by', path: 'author.name', fallback: '—' },
      { label: 'Published', value: (row) => dateLabel(row.createdAt) }
    ], actions: true
  }
};

const dashboardLabels = {
  admin: [
    { key: 'students', label: 'Active students', icon: '♙', color: '#b69aff', glow: '#8b5cf629', foot: 'Across your institution' },
    { key: 'faculty', label: 'Faculty members', icon: '♧', color: '#66b6ff', glow: '#3b82f629', foot: 'Teaching community' },
    { key: 'departments', label: 'Departments', icon: '▦', color: '#f0a3e4', glow: '#d946ef22', foot: 'Academic divisions' },
    { key: 'courses', label: 'Active courses', icon: '▤', color: '#6be0b0', glow: '#10b98124', foot: 'Across all semesters' }
  ],
  faculty: [
    { key: 'courses', label: 'Assigned courses', icon: '▤', color: '#b69aff', glow: '#8b5cf629', foot: 'Your teaching schedule' },
    { key: 'students', label: 'Department students', icon: '♙', color: '#66b6ff', glow: '#3b82f629', foot: 'Students in your department' },
    { key: 'attendance', label: 'Attendance records', icon: '◷', color: '#f0a3e4', glow: '#d946ef22', foot: 'Records you can manage' },
    { key: 'announcements', label: 'Campus updates', icon: '◉', color: '#6be0b0', glow: '#10b98124', foot: 'For your role' }
  ],
  student: [
    { key: 'courses', label: 'My department courses', icon: '▤', color: '#b69aff', glow: '#8b5cf629', foot: 'Learning this semester' },
    { key: 'attendance', label: 'My attendance', icon: '◷', color: '#66b6ff', glow: '#3b82f629', foot: 'Classes recorded' },
    { key: 'marks', label: 'Assessment results', icon: '◈', color: '#f0a3e4', glow: '#d946ef22', foot: 'Published assessments' },
    { key: 'announcements', label: 'Campus updates', icon: '◉', color: '#6be0b0', glow: '#10b98124', foot: 'For your role' }
  ]
};

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
  });
  const payload = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'The request could not be completed.');
  return payload;
}

function toast(message, type = 'success') {
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.textContent = message;
  document.querySelector('#toast-region').append(node);
  setTimeout(() => node.remove(), 3600);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function person(name, detail = '') {
  const initials = String(name || 'CC').trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
  return `<span class="person-cell"><span class="tiny-avatar">${escapeHtml(initials)}</span><span><strong>${escapeHtml(name || '—')}</strong><small>${escapeHtml(detail)}</small></span></span>`;
}

function pill(value) {
  return `<span class="pill ${escapeHtml(String(value || '').toLowerCase())}">${escapeHtml(value || '—')}</span>`;
}

function shortText(value, length) {
  const text = String(value || '');
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function dateLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function initials(name) {
  return String(name || 'CC').trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
}

async function initialize() {
  document.querySelector('#today-label').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
  document.querySelector('#auth-form').addEventListener('submit', onAuthSubmit);
  document.querySelector('#auth-toggle').addEventListener('click', toggleAuthMode);
  document.querySelector('#logout-button').addEventListener('click', logout);
  document.querySelector('#menu-toggle').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));
  document.querySelector('#profile-shortcut').addEventListener('click', () => navigate('profile'));
  document.querySelector('#content').addEventListener('click', onContentClick);
  document.querySelector('#record-dialog').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
  try {
    const result = await api('/api/auth/me');
    showApp(result.user);
  } catch {
    showAuth();
  }
}

function showAuth() {
  document.querySelector('#auth-view').classList.remove('hidden');
  document.querySelector('#app-shell').classList.add('hidden');
}

function toggleAuthMode() {
  state.register = !state.register;
  document.querySelector('#register-name-wrap').classList.toggle('hidden', !state.register);
  document.querySelector('#register-role-wrap').classList.toggle('hidden', !state.register);
  document.querySelector('#register-name').required = state.register;
  document.querySelector('#auth-eyebrow').textContent = state.register ? 'JOIN YOUR CAMPUS' : 'WELCOME BACK';
  document.querySelector('#auth-title').textContent = state.register ? 'Create your account' : 'Sign in to your campus';
  document.querySelector('#auth-subtitle').textContent = state.register ? 'Get connected with your campus community.' : 'Enter your details to continue.';
  document.querySelector('#auth-submit').innerHTML = state.register ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
  document.querySelector('#auth-switch-copy').textContent = state.register ? 'Already have an account?' : 'New to CampusConnect?';
  document.querySelector('#auth-toggle').textContent = state.register ? 'Sign in' : 'Create an account';
  document.querySelector('#auth-password').autocomplete = state.register ? 'new-password' : 'current-password';
}

async function onAuthSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = document.querySelector('#auth-submit');
  submit.disabled = true;
  submit.textContent = 'Please wait…';
  try {
    let result;
    if (state.register) {
      result = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.elements.name.value.trim(),
          email: form.elements.email.value.trim(),
          password: form.elements.password.value,
          role: form.elements.role.value
        })
      });
    } else {
      result = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.elements.email.value.trim(), password: form.elements.password.value })
      });
    }
    form.reset();
    showApp(result.user);
    toast(`Welcome, ${result.user.name.split(' ')[0]}.`);
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    submit.disabled = false;
    submit.innerHTML = state.register ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
  }
}

async function logout() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    toast(error.message, 'error');
    return;
  }
  state.user = null;
  state.cache = {};
  if (state.register) toggleAuthMode();
  showAuth();
  toast('You have signed out.');
}

function showApp(user) {
  state.user = user;
  state.page = 'overview';
  document.querySelector('#auth-view').classList.add('hidden');
  document.querySelector('#app-shell').classList.remove('hidden');
  document.querySelector('#user-name').textContent = user.name;
  document.querySelector('#user-role').textContent = roleLabels[user.role] || user.role;
  document.querySelector('#user-avatar').textContent = initials(user.name);
  renderNav();
  navigate('overview');
}

function renderNav() {
  document.querySelector('#primary-nav').innerHTML = navItems
    .filter((item) => item.roles.includes(state.user.role))
    .map((item) => `<a href="#${item.id}" class="nav-link ${state.page === item.id ? 'active' : ''}" data-page="${item.id}"><span class="nav-icon">${item.icon}</span><span>${item.label}</span>${item.id === 'announcements' ? '<span class="nav-badge">NEW</span>' : ''}</a>`)
    .join('');
  document.querySelector('#primary-nav').querySelectorAll('[data-page]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigate(link.dataset.page);
    });
  });
}

function navigate(page) {
  if (!navItems.some((item) => item.id === page && item.roles.includes(state.user?.role))) page = 'overview';
  state.page = page;
  state.search = '';
  document.querySelector('#sidebar').classList.remove('open');
  renderNav();
  document.querySelector('#page-crumb').textContent = navItems.find((item) => item.id === page)?.label || 'Overview';
  renderPage();
}

async function renderPage() {
  const content = document.querySelector('#content');
  content.innerHTML = '<div class="loading"><div class="spinner"></div>Loading your workspace…</div>';
  if (state.page === 'overview') return renderDashboard(content);
  if (state.page === 'profile') return renderProfile(content);
  if (state.page === 'announcements') return renderAnnouncementsPage(content);
  return renderResourcePage(content, state.page);
}

async function renderDashboard(content) {
  try {
    const [{ data: stats }, { data: announcements }] = await Promise.all([api('/api/dashboard'), api('/api/announcements')]);
    if (content !== document.querySelector('#content')) return;
    const cards = dashboardLabels[state.user.role];
    const max = Math.max(1, ...cards.map((item) => Number(stats[item.key]) || 0));
    const bars = cards.map((item) => `<div class="chart-bar-wrap"><span class="chart-bar" style="height:${Math.max(9, Math.round((Number(stats[item.key]) || 0) / max * 100))}%"></span><small>${escapeHtml(item.label.split(' ')[0])}</small></div>`).join('');
    content.innerHTML = `
      <div class="page-heading"><div><p class="eyebrow">YOUR CAMPUS AT A GLANCE</p><h1>Good ${greeting()}, ${escapeHtml(state.user.name.split(' ')[0])}</h1><p>Here’s what’s happening across your campus today.</p></div><div class="heading-actions"><button class="button button-quiet" data-nav="announcements">View announcements&nbsp; →</button></div></div>
      <section class="stats-grid">${cards.map((item) => `<article class="stat-card" style="--stat-color:${item.color};--glow:${item.glow}"><div class="stat-top"><span>${escapeHtml(item.label)}</span><span class="stat-icon">${item.icon}</span></div><strong class="stat-value">${Number(stats[item.key]) || 0}</strong><div class="stat-foot">${escapeHtml(item.foot)}</div></article>`).join('')}</section>
      <div class="grid-two"><section class="panel"><div class="panel-header"><div><h2>Campus snapshot</h2><small>Live totals for your workspace</small></div><span class="pill">Updated now</span></div><div class="chart-area">${bars}</div><div class="stat-foot" style="margin-top:12px">Counts are sourced from your current account permissions.</div></section>
      <section class="panel"><div class="panel-header"><div><h2>Latest announcements</h2><small>Updates for your community</small></div><button class="text-button" data-nav="announcements">See all</button></div>${announcementList(announcements.slice(0, 4))}</section></div>`;
  } catch (error) {
    content.innerHTML = errorPanel(error);
  }
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
}

function announcementList(items) {
  if (!items.length) return '<div class="empty-state">No announcements yet.</div>';
  return `<div class="announcement-list">${items.map((item) => `<article class="announcement-item"><span class="announcement-marker"></span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(shortText(item.body, 125))}</p><small>${escapeHtml(item.author?.name || 'CampusConnect')} · ${dateLabel(item.createdAt)}</small></div></article>`).join('')}</div>`;
}

async function renderResourcePage(content, page) {
  const config = resourceConfig[page];
  if (!config) {
    content.innerHTML = errorPanel(new Error('This section is unavailable.'));
    return;
  }
  try {
    const { data } = await api(config.endpoint);
    if (content !== document.querySelector('#content')) return;
    state.cache[page] = data;
    renderTablePage(content, page, data);
  } catch (error) {
    content.innerHTML = errorPanel(error);
  }
}

function renderTablePage(content, page, rows) {
  const config = resourceConfig[page];
  const canCreate = config.createRoles.includes(state.user.role);
  const columns = config.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('');
  content.innerHTML = `
    <div class="page-heading"><div><p class="eyebrow">CAMPUS DIRECTORY</p><h1>${escapeHtml(config.title)}</h1><p>${descriptionFor(page)}</p></div>
    ${canCreate ? `<div class="heading-actions"><button class="button button-primary" data-create="${page}">＋&nbsp; Add ${singular(page)}</button></div>` : ''}</div>
    <section class="table-card"><div class="table-toolbar"><p>${rows.length} ${rows.length === 1 ? singular(page) : page === 'results' ? 'results' : page} found</p><label class="search-box"><input type="search" placeholder="Search ${escapeHtml(config.title.toLowerCase())}…" aria-label="Search ${escapeHtml(config.title)}"></label></div>
    <div class="table-scroll"><table><thead><tr>${columns}${config.actions ? '<th>Actions</th>' : ''}</tr></thead><tbody>${rows.length ? rows.map((row) => renderRow(config, row)).join('') : `<tr><td colspan="${config.columns.length + (config.actions ? 1 : 0)}"><div class="empty-state">Nothing to show yet.</div></td></tr>`}</tbody></table></div></section>`;
  const input = content.querySelector('input[type="search"]');
  input.addEventListener('input', () => {
    state.search = input.value.toLowerCase().trim();
    const filtered = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(state.search));
    const body = content.querySelector('tbody');
    body.innerHTML = filtered.length ? filtered.map((row) => renderRow(config, row)).join('') : `<tr><td colspan="${config.columns.length + (config.actions ? 1 : 0)}"><div class="empty-state">No matching records.</div></td></tr>`;
  });
}

function renderRow(config, row) {
  const columns = config.columns.map((column) => {
    let value = column.value ? column.value(row) : column.path ? getPath(row, column.path) : row[column.key];
    if ((value === undefined || value === null || value === '') && column.fallback) value = column.fallback;
    if (column.value) return `<td>${value}</td>`;
    return `<td>${escapeHtml(value ?? '—')}</td>`;
  }).join('');
  const actions = config.actions ? `<td><div class="row-actions">${canEditRow(config) ? `<button class="row-action" data-edit="${config.title.toLowerCase()}" data-id="${escapeHtml(row._id)}">Edit</button>` : ''}${canDeleteRow(config) ? `<button class="row-action" data-delete="${config.title.toLowerCase()}" data-id="${escapeHtml(row._id)}">Remove</button>` : ''}</div></td>` : '';
  return `<tr>${columns}${actions}</tr>`;
}

function canEditRow(config) {
  return config.createRoles.includes(state.user.role) && !(config.title === 'Announcements' && state.user.role === 'faculty');
}
function canDeleteRow(config) { return canEditRow(config); }

function getPath(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

function descriptionFor(page) {
  const descriptions = {
    students: 'Manage student records, identifiers, and enrollment details.',
    faculty: 'Keep faculty profiles and department assignments up to date.',
    departments: 'Organize your academic departments and leadership.',
    courses: 'Explore course offerings and faculty assignments.',
    attendance: 'Review class attendance records and participation.',
    results: 'Track assessment results and academic progress.',
    timetable: 'Keep track of upcoming classes and teaching sessions.',
    announcements: 'Important updates from across your campus.'
  };
  return descriptions[page] || '';
}

function singular(page) {
  return ({ students: 'student', faculty: 'faculty member', departments: 'department', courses: 'course', attendance: 'record', results: 'result', timetable: 'class', announcements: 'announcement' })[page] || 'record';
}

async function renderAnnouncementsPage(content) {
  const page = 'announcements';
  const config = resourceConfig[page];
  try {
    const { data } = await api(config.endpoint);
    if (content !== document.querySelector('#content')) return;
    state.cache[page] = data;
    const canCreate = config.createRoles.includes(state.user.role);
    content.innerHTML = `<div class="page-heading"><div><p class="eyebrow">CAMPUS BULLETIN</p><h1>Announcements</h1><p>Important updates from across your campus.</p></div>${canCreate ? '<div class="heading-actions"><button class="button button-primary" data-create="announcements">＋&nbsp; New announcement</button></div>' : ''}</div><div class="grid-two" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));margin-top:0">${data.length ? data.map((item) => `<article class="panel"><div class="panel-header"><span class="pill">${escapeHtml((item.audience || []).join(' · ') || 'Campus')}</span>${state.user.role === 'admin' ? `<button class="row-action" data-delete="announcements" data-id="${escapeHtml(item._id)}">Remove</button>` : ''}</div><h2 style="font:600 16px 'Space Grotesk',sans-serif">${escapeHtml(item.title)}</h2><p class="muted" style="font-size:11px;line-height:1.75;white-space:pre-wrap">${escapeHtml(item.body)}</p><div class="stat-foot">${escapeHtml(item.author?.name || 'CampusConnect')} · ${dateLabel(item.createdAt)}${item.expiresAt ? ` · Expires ${dateLabel(item.expiresAt)}` : ''}</div></article>`).join('') : '<section class="panel empty-state">No announcements have been published for you yet.</section>'}</div>`;
  } catch (error) {
    content.innerHTML = errorPanel(error);
  }
}

async function renderProfile(content) {
  const user = state.user;
  content.innerHTML = `<div class="page-heading"><div><p class="eyebrow">ACCOUNT SETTINGS</p><h1>My profile</h1><p>Manage your personal information and account access.</p></div></div>
    <div class="profile-grid"><section class="panel profile-card"><div class="profile-avatar">${escapeHtml(initials(user.name))}</div><h2>${escapeHtml(user.name)}</h2><p>${escapeHtml(roleLabels[user.role] || user.role)}</p><div class="profile-details"><div><small>Email</small><strong>${escapeHtml(user.email)}</strong></div><div><small>Department</small><strong>${escapeHtml(user.department?.name || 'No department assigned')}</strong></div><div><small>Member since</small><strong>${dateLabel(user.createdAt)}</strong></div></div></section>
    <section class="panel"><div class="panel-header"><div><h2>Personal information</h2><small>Changes are saved securely to your account.</small></div></div><form id="profile-form" class="dialog-form"><div class="field"><label for="profile-name">Full name</label><input id="profile-name" name="name" value="${escapeHtml(user.name)}" maxlength="100" required></div><div class="field"><label for="profile-phone">Phone</label><input id="profile-phone" name="phone" value="${escapeHtml(user.phone || '')}" maxlength="30"></div><div class="field"><label for="profile-password">New password <span class="muted">(optional)</span></label><input id="profile-password" name="password" type="password" minlength="10" maxlength="128" autocomplete="new-password" placeholder="At least 10 characters"></div><div><button class="button button-primary" type="submit">Save changes</button></div></form></section></div>`;
  content.querySelector('#profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = { name: form.elements.name.value.trim(), phone: form.elements.phone.value.trim() };
    if (form.elements.password.value) body.password = form.elements.password.value;
    try {
      const { user: updated } = await api('/api/auth/me', { method: 'PATCH', body: JSON.stringify(body) });
      showApp(updated);
      navigate('profile');
      toast('Profile updated.');
    } catch (error) {
      toast(error.message, 'error');
    }
  });
}

async function onContentClick(event) {
  const nav = event.target.closest('[data-nav]');
  if (nav) return navigate(nav.dataset.nav);
  const create = event.target.closest('[data-create]');
  if (create) return openRecordDialog(create.dataset.create);
  const edit = event.target.closest('[data-edit]');
  if (edit) return openRecordDialog(pageForLabel(edit.dataset.edit), edit.dataset.id);
  const remove = event.target.closest('[data-delete]');
  if (remove) return removeRecord(pageForLabel(remove.dataset.delete), remove.dataset.id);
}

function pageForLabel(label) {
  return ({ students: 'students', faculty: 'faculty', departments: 'departments', courses: 'courses', attendance: 'attendance', 'marks & results': 'results', timetable: 'timetable', announcements: 'announcements' })[label] || label;
}

async function openRecordDialog(page, id = null) {
  const config = resourceConfig[page];
  const row = id ? (state.cache[page] || []).find((item) => item._id === id) : null;
  if (!config || (id && !row)) return toast('This record is no longer available.', 'error');
  const dialog = document.querySelector('#record-dialog');
  const fieldsToRender = row && config.editFields ? config.fields.filter((field) => config.editFields.includes(field.name)) : config.fields;
  const fields = await Promise.all(fieldsToRender.map((field) => buildField(field, row, page)));
  document.querySelector('#dialog-content').innerHTML = `<h2 class="dialog-heading">${row ? 'Edit' : 'Add'} ${escapeHtml(singular(page))}</h2><p class="dialog-description">Enter the details below. Fields are validated before saving.</p><form id="record-form" class="dialog-form">${fields.join('')}<div class="dialog-actions"><button type="button" class="button button-secondary" data-close-dialog>Cancel</button><button type="submit" class="button button-primary">${row ? 'Save changes' : 'Create record'}</button></div></form>`;
  dialog.showModal();
  dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
  dialog.querySelector('#record-form').addEventListener('submit', (event) => saveRecord(event, page, row));
}

async function buildField(field, row, page) {
  let value = row ? row[field.name] : '';
  if (field.name === 'role' && ['students', 'faculty'].includes(page)) value = page === 'students' ? 'student' : 'faculty';
  if (field.name === 'audience' && !row) value = ['student', 'faculty'];
  if (field.name === 'date' && !row) value = new Date().toISOString().slice(0, 10);
  if (field.name === 'date' && row && value) value = new Date(value).toISOString().slice(0, 10);
  if (field.name === 'expiresAt' && value) value = new Date(value).toISOString().slice(0, 10);
  if (field.name === 'password' && row) return `<div class="field"><label for="field-${field.name}">${escapeHtml(field.label)} <span class="muted">(leave blank to keep current)</span></label><input id="field-${field.name}" name="${field.name}" type="password" minlength="10" maxlength="128" autocomplete="new-password"></div>`;
  if (field.options) {
    const options = await loadOptions(field.options);
    const ids = Array.isArray(value) ? value.map((item) => typeof item === 'object' ? item._id : item) : [typeof value === 'object' ? value?._id : value];
    return `<div class="field"><label for="field-${field.name}">${escapeHtml(field.label)}</label><select id="field-${field.name}" name="${field.name}" ${field.required ? 'required' : ''} ${field.multiple ? 'multiple size="4"' : ''}><option value="">${field.multiple ? 'Choose one or more' : 'Select an option'}</option>${options.map((option) => `<option value="${escapeHtml(option[field.optionValue] || '')}" ${ids.includes(option[field.optionValue]) ? 'selected' : ''}>${escapeHtml(option[field.optionLabel] || option.name || '')}</option>`).join('')}</select></div>`;
  }
  if (field.values) {
    const values = Array.isArray(value) ? value : [value];
    return `<div class="field"><label for="field-${field.name}">${escapeHtml(field.label)}</label><select id="field-${field.name}" name="${field.name}" ${field.required ? 'required' : ''} ${field.multiple ? 'multiple size="3"' : ''}><option value="">${field.multiple ? 'Choose one or more' : 'Select an option'}</option>${field.values.map((option) => `<option value="${escapeHtml(option)}" ${values.includes(option) ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></div>`;
  }
  const attrs = `${field.required ? 'required' : ''} ${field.min !== undefined ? `min="${field.min}"` : ''} ${field.max !== undefined ? `max="${field.max}"` : ''} maxlength="${field.maxlength || 500}"`;
  if (field.type === 'textarea') return `<div class="field"><label for="field-${field.name}">${escapeHtml(field.label)}</label><textarea id="field-${field.name}" name="${field.name}" ${attrs}>${escapeHtml(value || '')}</textarea></div>`;
  return `<div class="field"><label for="field-${field.name}">${escapeHtml(field.label)}${field.required ? ' <span aria-hidden="true">*</span>' : ''}</label><input id="field-${field.name}" name="${field.name}" type="${field.type || 'text'}" value="${escapeHtml(value ?? '')}" ${attrs}></div>`;
}

async function loadOptions(kind) {
  const cacheKey = `options:${kind}`;
  if (state.cache[cacheKey]) return state.cache[cacheKey];
  const endpoints = { departments: '/api/academics/departments', courses: '/api/academics/courses', faculty: '/api/users?role=faculty', students: state.user.role === 'admin' ? '/api/users?role=student' : '/api/academics/students' };
  const { data } = await api(endpoints[kind]);
  state.cache[cacheKey] = data.filter((item) => item.active !== false);
  return state.cache[cacheKey];
}

async function saveRecord(event, page, existing) {
  event.preventDefault();
  const form = event.currentTarget;
  const config = resourceConfig[page];
  const body = {};
  for (const field of config.fields) {
    const element = form.elements[field.name];
    if (!element) continue;
    let value = field.multiple ? Array.from(element.selectedOptions).map((option) => option.value).filter(Boolean) : element.value.trim();
    if (field.type === 'number' && value !== '') value = Number(value);
    if (field.name === 'semester' && value === '') continue;
    if (field.name === 'credits' && value === '') continue;
    if (field.name === 'password' && existing && !value) continue;
    if (field.name === 'role' && ['students', 'faculty'].includes(page)) value = page === 'students' ? 'student' : 'faculty';
    if (field.name === 'audience' && !value.length) value = ['student', 'faculty'];
    if (value !== '') body[field.name] = value;
  }
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Saving…';
  try {
    if (page === 'students' || page === 'faculty') {
      if (!existing) body.role = page === 'students' ? 'student' : 'faculty';
      else if (!body.password) delete body.password;
    }
    const endpoint = config.collection + (existing ? `/${encodeURIComponent(existing._id)}` : '');
    await api(endpoint, { method: existing ? 'PATCH' : 'POST', body: JSON.stringify(body) });
    document.querySelector('#record-dialog').close();
    state.cache = {};
    toast(`${singular(page)} ${existing ? 'updated' : 'created'} successfully.`);
    renderPage();
  } catch (error) {
    toast(error.message, 'error');
    submit.disabled = false;
    submit.textContent = existing ? 'Save changes' : 'Create record';
  }
}

async function removeRecord(page, id) {
  const config = resourceConfig[page];
  const row = (state.cache[page] || []).find((item) => item._id === id);
  const label = row?.name || row?.title || row?.course?.name || 'this record';
  if (!config || !confirm(`Remove ${label}? This action cannot be undone.`)) return;
  try {
    await api(`${config.collection}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    state.cache = {};
    toast('Record removed.');
    renderPage();
  } catch (error) {
    toast(error.message, 'error');
  }
}

function errorPanel(error) {
  return `<section class="panel"><h2 class="section-title">Could not load this section</h2><p class="muted">${escapeHtml(error.message)}</p><button class="button button-quiet" data-retry>Try again</button></section>`;
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-retry]')) renderPage();
});

initialize();
