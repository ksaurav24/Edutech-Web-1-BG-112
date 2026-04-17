// --- Constants & dummy Data --- //
const weeklyData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.2 },
  { day: 'Wed', hours: 1.8 },
  { day: 'Thu', hours: 4.0 },
  { day: 'Fri', hours: 2.9 },
  { day: 'Sat', hours: 3.5 },
  { day: 'Sun', hours: 1.2 },
];
const subjectPerformance = [
  { subject: 'Math', score: 72, color: '#4F46E5' },
  { subject: 'Science', score: 58, color: '#22D3EE' },
  { subject: 'Coding', score: 85, color: '#A855F7' },
  { subject: 'English', score: 45, color: '#F59E0B' },
  { subject: 'History', score: 30, color: '#EF4444' },
];
const quotesList = [
  { id: 1, text: 'Success is the sum of small efforts repeated daily.', author: 'Robert Collier', bg: 'from-indigo-600 to-purple-700' },
  { id: 2, text: 'The expert in anything was once a beginner.', author: 'Helen Hayes', bg: 'from-cyan-500 to-blue-600' },
  { id: 3, text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci', bg: 'from-purple-600 to-pink-600' },
  { id: 4, text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin', bg: 'from-emerald-500 to-teal-600' },
];
const recommendedSkills = [
  { title: 'React Advanced Patterns', level: 'Intermediate', tag: 'Web Dev', color: 'from-indigo-500 to-purple-600' },
  { title: 'Machine Learning Basics', level: 'Beginner', tag: 'AI', color: 'from-cyan-500 to-blue-600' },
  { title: 'Data Structures & Algorithms', level: 'Advanced', tag: 'CS', color: 'from-purple-500 to-pink-600' },
  { title: 'System Design', level: 'Advanced', tag: 'Architecture', color: 'from-emerald-500 to-teal-600' },
];
const allInterests = ['Web Dev', 'AI', 'Data Science', 'Mobile', 'DevOps', 'UI/UX', 'Blockchain', 'Cybersecurity'];
const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];

// --- Application State --- //
const state = {
  theme: 'dark',
  page: 'login', // login, signup, forgot, app
  activeSection: 'dashboard',
  mobileOpen: false,
  user: {
      name: 'Alex Johnson', email: 'alex@example.com', avatar: null,
      skillLevel: 'Intermediate', interests: ['Web Dev', 'AI', 'Data Science'],
      streak: 7, totalHours: 142, joinDate: 'Jan 2025'
  },
  goals: [
      { id: 1, text: 'Complete React course', done: true },
      { id: 2, text: 'Solve 20 DSA problems', done: false },
      { id: 3, text: 'Build portfolio project', done: false },
  ],
  progress: { Math: 72, Science: 58, Coding: 85, English: 45, History: 30 },
  notifications: [
      { id: 1, text: 'You completed 1 task today', time: '2m ago', read: false },
      { id: 2, text: 'Keep going! 7-day streak active', time: '1h ago', read: false },
  ],
  sessions: [
      { date: '2025-04-01', subject: 'Coding', duration: 90 },
      { date: '2025-04-04', subject: 'Coding', duration: 120 },
  ],
  // Temp states for forms
  loginForm: { email: '', password: '', show: false, loading: false },
  signupForm: { name: '', email: '', password: '', show: false, loading: false, selectedInterests: ['Web Dev', 'AI'], level: 'Intermediate' },
  forgotForm: { email: '', sent: false },
  goalsForm: { text: '', modalOpen: false },
  plannerForm: { date: '', subject: 'Coding', duration: 60, modalOpen: false },
  profileForm: { editing: false, name: '', email: '', skillLevel: '', interests: [] },
  practiceForm: { input: '', submitted: false },
  navbar: { showNotif: false }
};

let chartInstance = null;
let progressChartInstance = null;

// --- Utilities & Engine --- //
function toast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast flex items-start gap-2`;
    el.innerHTML = `<span>${type === 'error' ? '❌' : (type==='info'?'ℹ️':'✅')}</span><span>${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 3000);
}

function updateTheme() {
    if (state.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
}

function render() {
    updateTheme();
    const root = document.getElementById('root');
    let html = '';
    
    if (state.page === 'login') html = renderLoginPage();
    else if (state.page === 'signup') html = renderSignupPage();
    else if (state.page === 'forgot') html = renderForgotPage();
    else if (state.page === 'app') html = renderAppLayout();

    root.innerHTML = html;
    
    // Create icons via Lucide
    if (window.lucide) lucide.createIcons();
    
    // Initialize specific dynamic elements based on section (like Charts)
    initAfterRender();
}

function initAfterRender() {
    if (state.page === 'app' && state.activeSection === 'dashboard') {
        const ctx = document.getElementById('dashboardChart');
        if (ctx) {
            if(chartInstance) chartInstance.destroy();
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: weeklyData.map(d => d.day),
                    datasets: [{
                        label: 'Study Hours',
                        data: weeklyData.map(d => d.hours),
                        backgroundColor: function(context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return null;
                            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                            gradient.addColorStop(0, '#22D3EE');
                            gradient.addColorStop(1, '#4F46E5');
                            return gradient;
                        },
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { border: { display: false }, grid: { display:false } },
                        x: { border: { display: false }, grid: { display:false } }
                    }
                }
            });
        }
    } else if (state.page === 'app' && state.activeSection === 'progress') {
        const ctx = document.getElementById('progressChart');
        if (ctx) {
            if(progressChartInstance) progressChartInstance.destroy();
            progressChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: subjectPerformance.map(d => d.subject),
                    datasets: [{
                        label: 'Score',
                        data: subjectPerformance.map(d => d.score),
                        backgroundColor: subjectPerformance.map(d => d.color),
                        borderRadius: 6,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { border: { display: false }, grid: { display:false }, min: 0, max: 100 },
                        x: { border: { display: false }, grid: { display:false } }
                    }
                }
            });
        }
    }
}

// --- UI Components --- //
function Badge(color, text) {
  const colors = {
    indigo: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
    cyan: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
    purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
    green: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    red: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  };
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.indigo}">${text}</span>`;
}

function Button(variant, classes, attrs, innerHTML, disabled) {
    const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 cursor-pointer select-none btn-transition';
    const variants = {
        primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 px-5 py-2.5',
        secondary: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-5 py-2.5',
        ghost: 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-4 py-2',
        danger: 'bg-red-500 hover:bg-red-400 text-white px-5 py-2.5',
        outline: 'border border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-5 py-2.5',
        gradient: 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/30 px-5 py-2.5',
    };
    const opacity = disabled ? 'opacity-50 cursor-not-allowed' : '';
    return `<button ${attrs} ${disabled ? 'disabled' : ''} class="${base} ${variants[variant]} ${opacity} ${classes}">${innerHTML}</button>`;
}

function Card(classes, innerHTML, hover = false) {
    const hoverClass = hover ? 'hover:shadow-lg hover:-translate-y-0.5' : '';
    return `
    <div class="rounded-2xl border transition-all duration-300 bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/30 ${hoverClass} ${classes}">
      ${innerHTML}
    </div>`;
}

function CircularProgress(value, label, color) {
  const size = 90, stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return `
    <div class="flex flex-col items-center gap-2">
      <div class="relative" style="width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" class="-rotate-90">
          <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="currentColor" stroke-width="${stroke}" class="text-slate-200 dark:text-slate-700"></circle>
          <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" style="transition: stroke-dashoffset 0.8s ease"></circle>
        </svg>
        <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-white">${value}%</span>
      </div>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400">${label}</span>
    </div>
  `;
}

// --- Layouts & Sections --- //
function renderDashboard() {
    const user = state.user;
    
    let statsHtml = `
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3"><i data-lucide="clock" class="text-indigo-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">142h</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Hours</p>`)}
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3"><i data-lucide="flame" class="text-orange-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">${user.streak} days</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Day Streak</p>`)}
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3"><i data-lucide="target" class="text-emerald-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">2 / 4</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Goals Done</p>`)}
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-3"><i data-lucide="trending-up" class="text-cyan-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">58%</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avg Score</p>`)}
    `;

    let skillsHtml = recommendedSkills.map(s => `
        ${Card("p-4 cursor-pointer group", `
            <div class="h-1.5 w-12 rounded-full bg-gradient-to-r ${s.color} mb-3"></div>
            <p class="font-medium text-slate-800 dark:text-white text-sm group-hover:text-indigo-500 transition-colors">${s.title}</p>
            <div class="flex items-center gap-2 mt-2">${Badge('indigo', s.tag)}<span class="text-xs text-slate-400">${s.level}</span></div>
        `, true)}
    `).join('');

    return `
    <div class="space-y-6 fade-up">
      <!-- Welcome -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 p-6 text-white shadow-xl shadow-indigo-500/20">
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 30px 30px"></div>
        <div class="relative z-10 flex items-start justify-between">
          <div>
            <p class="text-white/70 text-sm mb-1">Good morning,</p>
            <h2 class="text-2xl font-bold mb-2">${user.name}</h2>
            <p class="text-white/80 text-sm max-w-sm">You're on a ${user.streak}-day streak. Keep the momentum going!</p>
            <div class="flex gap-2 mt-4">${user.interests.map(i => `<span class="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">${i}</span>`).join('')}</div>
          </div>
          <div class="hidden sm:flex flex-col items-center bg-white/10 backdrop-blur rounded-2xl p-4">
            <i data-lucide="flame" class="text-orange-300 w-6 h-6 mb-1"></i>
            <span class="text-2xl font-bold">${user.streak}</span>
            <span class="text-white/60 text-xs">day streak</span>
          </div>
        </div>
      </div>
      
      <!-- Motivational quote -->
      <div class="fade-up delay-05">
        ${Card("p-5 border-l-4 border-l-indigo-500", `<p class="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed">"Success is the sum of small efforts repeated daily."</p><p class="text-xs text-slate-400 mt-2">— Robert Collier</p>`)}
      </div>
      
      <div class="fade-up delay-10 grid grid-cols-2 lg:grid-cols-4 gap-4">${statsHtml}</div>
      
      <!-- Weekly chart -->
      <div class="fade-up delay-15">
        ${Card("p-5", `
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-slate-800 dark:text-white text-sm">Weekly Study Hours</h3>
              ${Badge('indigo', 'This Week')}
            </div>
            <div style="height: 180px; width: 100%;">
                <canvas id="dashboardChart"></canvas>
            </div>
        `)}
      </div>

      <!-- Recommended skills -->
      <div class="fade-up delay-20">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-slate-800 dark:text-white text-sm">Recommended Skills</h3>
          <button onclick="state.activeSection='progress';render();" class="text-xs text-indigo-500 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer">View all <i data-lucide="arrow-right" class="w-3 h-3"></i></button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${skillsHtml}</div>
      </div>
    </div>`;
}

function renderProgress() {
    const progs = Object.entries(state.progress).map(([sub, val]) => {
        const color = sub === 'Math' ? '#4F46E5' : sub==='Science'?'#22D3EE':sub==='Coding'?'#A855F7':sub==='English'?'#F59E0B':'#EF4444';
        return CircularProgress(val, sub, color);
    }).join("");

    const sliders = Object.entries(state.progress).map(([sub, val]) => {
         const color = sub === 'Math' ? '#4F46E5' : sub==='Science'?'#22D3EE':sub==='Coding'?'#A855F7':sub==='English'?'#F59E0B':'#EF4444';
         return `
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${sub}</span>
                <span class="text-sm font-bold" style="color: ${color}">${val}%</span>
              </div>
              <input type="range" min="0" max="100" value="${val}" oninput="state.progress['${sub}']=parseInt(this.value); document.getElementById('root').innerHTML = renderAppLayout(); initAfterRender(); lucide.createIcons();" class="w-full h-2 rounded-full appearance-none cursor-pointer" style="accent-color: ${color}">
            </div>
         `;
    }).join("");

    return `
    <div class="space-y-6 fade-up">
        ${Card("p-6", `<h3 class="font-semibold text-slate-800 dark:text-white mb-5">Subject Progress</h3><div class="flex flex-wrap gap-6 justify-around">${progs}</div>`)}
        ${Card("p-6", `<h3 class="font-semibold text-slate-800 dark:text-white mb-5">Adjust Progress</h3><div class="space-y-5">${sliders}</div>`)}
        ${Card("p-6", `
            <h3 class="font-semibold text-slate-800 dark:text-white mb-4">Performance Analytics</h3>
            <div style="height: 200px; width: 100%;">
                <canvas id="progressChart"></canvas>
            </div>
        `)}
    </div>`;
}

function renderGoals() {
    const doneCount = state.goals.filter(g => g.done).length;
    const pct = state.goals.length ? Math.round((doneCount / state.goals.length) * 100) : 0;
    
    let goalsHtml = state.goals.map((goal, i) => `
        <div class="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
          <button onclick="toggleGoal(${goal.id})" class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${goal.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}">
            ${goal.done ? '<i data-lucide="check" class="text-white w-3 h-3"></i>' : ''}
          </button>
          <span class="flex-1 text-sm ${goal.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}">${goal.text}</span>
          <button onclick="removeGoal(${goal.id})" class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all cursor-pointer">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
    `).join('');

    if (state.goals.length === 0) goalsHtml = `<div class="p-12 text-center"><i data-lucide="target" class="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3"></i><p class="text-slate-500 dark:text-slate-400 font-medium">No goals yet</p></div>`;

    let modalHtml = '';
    if (state.goalsForm.modalOpen) {
        modalHtml = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="state.goalsForm.modalOpen=false; render()"></div>
          <div class="modal-enter relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-lg font-semibold text-slate-800 dark:text-white">Add New Goal</h3>
              <button onclick="state.goalsForm.modalOpen=false; render()" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>
            <div class="space-y-4">
              <input id="newGoalInput" value="${state.goalsForm.text}" oninput="state.goalsForm.text = this.value" placeholder="e.g. Complete React course" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50">
              <div class="flex gap-3">
                ${Button('secondary', 'flex-1', 'onclick="state.goalsForm.modalOpen=false; render()"', 'Cancel')}
                ${Button('gradient', 'flex-1', 'onclick="addGoal()"', 'Add Goal')}
              </div>
            </div>
          </div>
        </div>`;
    }

    return `
    <div class="space-y-6 fade-up">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-bold text-slate-800 dark:text-white">Goal Tracker</h2><p class="text-sm text-slate-500 dark:text-slate-400">${doneCount} of ${state.goals.length} completed</p></div>
        ${Button('gradient', '', 'onclick="state.goalsForm.modalOpen=true; render()"', '<i data-lucide="plus" class="w-4 h-4"></i> Add Goal')}
      </div>
      ${Card("p-5", `
          <div class="flex items-center justify-between mb-3"><span class="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Progress</span><span class="text-sm font-bold gradient-text">${pct}%</span></div>
          <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500" style="width: ${pct}%"></div></div>
      `)}
      ${Card("divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden", goalsHtml)}
      ${modalHtml}
    </div>`;
}

window.toggleGoal = (id) => { state.goals = state.goals.map(g => g.id === id ? {...g, done: !g.done} : g); render(); };
window.removeGoal = (id) => { state.goals = state.goals.filter(g => g.id !== id); toast('Goal removed', 'info'); render(); };
window.addGoal = () => { 
    if(!state.goalsForm.text.trim()) return; 
    state.goals.push({id: Date.now(), text: state.goalsForm.text, done: false}); 
    state.goalsForm.text = ''; state.goalsForm.modalOpen = false; toast('Goal added!'); render(); 
};

function renderPlanner() {
    let sessionList = state.sessions.map((s, i) => `
        ${Card("p-4 flex items-center gap-4", `
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center"><i data-lucide="calendar" class="text-indigo-500 w-4 h-4"></i></div>
            <div class="flex-1"><p class="text-sm font-medium text-slate-800 dark:text-white">${s.subject}</p><p class="text-xs text-slate-400">${s.date}</p></div>
            <div class="flex items-center gap-1 text-slate-500"><i data-lucide="clock" class="w-3 h-3"></i><span class="text-xs">${s.duration}m</span></div>
            ${Badge('indigo', s.subject)}
        `)}
    `).join('');
    if(state.sessions.length === 0) sessionList = Card("p-8 text-center", `<i data-lucide="calendar" class="w-10 h-10 mx-auto text-slate-300"></i><p>No sessions planned.</p>`);

    let modalHtml = '';
    if (state.plannerForm.modalOpen) {
        modalHtml = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="state.plannerForm.modalOpen=false; render()"></div>
          <div class="modal-enter relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6">
            <h3 class="mb-4">Add Study Session</h3>
            <div class="space-y-4">
              <input type="date" oninput="state.plannerForm.date = this.value" value="${state.plannerForm.date}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
              <select onchange="state.plannerForm.subject = this.value" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
                <option ${state.plannerForm.subject==='Coding'?'selected':''}>Coding</option>
                <option ${state.plannerForm.subject==='Math'?'selected':''}>Math</option>
                <option ${state.plannerForm.subject==='Science'?'selected':''}>Science</option>
              </select>
              <input type="number" oninput="state.plannerForm.duration = this.value" value="${state.plannerForm.duration}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
              <div class="flex gap-3">
                ${Button('secondary', 'flex-1', 'onclick="state.plannerForm.modalOpen=false; render()"', 'Cancel')}
                ${Button('gradient', 'flex-1', 'onclick="addSession()"', 'Add')}
              </div>
            </div>
          </div>
        </div>`;
    }

    return `
    <div class="space-y-6 fade-up">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-bold text-slate-800 dark:text-white">Study Planner</h2><p class="text-sm text-slate-500">April 2025</p></div>
        ${Button('gradient', '', 'onclick="state.plannerForm.modalOpen=true; render()"', '<i data-lucide="plus" class="w-4 h-4"></i> Add')}
      </div>
      <h3 class="font-bold mb-2 text-slate-700 dark:text-slate-300">Upcoming Sessions</h3>
      <div class="space-y-2">${sessionList}</div>
      ${modalHtml}
    </div>`;
}

window.addSession = () => {
    if(!state.plannerForm.date) return toast('Pick a date', 'error');
    state.sessions.push({...state.plannerForm, duration: Number(state.plannerForm.duration)});
    state.plannerForm.modalOpen = false; toast('Session added'); render();
}

function renderPractice() {
    let warning = state.practiceForm.submitted ? `
        <div class="fade-up mb-6 mt-6">
            ${Card('p-5 border-amber-200 bg-amber-50 dark:bg-amber-500/5', '<p class="text-amber-700 dark:text-amber-400 font-bold flex gap-2"><i data-lucide="alert-circle" class="w-5 h-5"></i> Backend Required</p>')}
        </div>
    ` : '';
    return `
    <div class="space-y-6 fade-up">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">Practice Zone</h2>
        ${Card('p-5', `
            <textarea id="practiceInput" placeholder="Enter problem..." rows="5" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono" oninput="state.practiceForm.input = this.value">${state.practiceForm.input}</textarea>
            <div class="flex justify-end mt-3">${Button('gradient', '', 'onclick="submitPractice()"', '<i data-lucide="send" class="w-3 h-3"></i> Submit')}</div>
        `)}
        ${warning}
    </div>`;
}
window.submitPractice = () => {
    if(!state.practiceForm.input.trim()) return toast('Enter problem', 'error');
    state.practiceForm.submitted = true; toast('Evaluation needs backend', 'info'); render();
}

function renderQuotes() {
    let list = quotesList.map(q => `
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br ${q.bg} p-6 text-white shadow-lg fade-up btn-transition">
            <p class="text-base font-medium leading-relaxed mb-4 relative z-10">${q.text}</p>
            <div class="flex items-center gap-2"><div class="w-6 h-0.5 bg-white/50 rounded-full"></div><p class="text-sm text-white/70">${q.author}</p></div>
        </div>
    `).join('');
    return `<div class="space-y-6"><h2 class="text-lg font-bold text-slate-800 dark:text-white fade-up">Inspiration</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${list}</div></div>`;
}

function renderProfile() {
    const u = state.profileForm.editing ? state.profileForm : state.user;
    
    let mainContent = '';
    if(state.profileForm.editing) {
        const intList = allInterests.map(i => `<button onclick="toggleProfileInterest('${i}')" class="px-3 py-1 rounded-full text-xs font-medium ${u.interests.includes(i) ? 'bg-indigo-600 text-white':'bg-slate-100 dark:bg-slate-800 text-slate-500'}">${i}</button>`).join('');
        const lvlList = skillLevels.map(l => `<button onclick="state.profileForm.skillLevel='${l}';render()" class="py-2 rounded-xl text-xs font-medium ${u.skillLevel === l ? 'bg-indigo-600 text-white':'bg-slate-100 dark:bg-slate-800'}">${l}</button>`).join('');
        mainContent = `
            <div class="space-y-4">
                <input value="${u.name}" oninput="state.profileForm.name=this.value" class="w-full px-3 py-2 border rounded-xl dark:border-slate-700 dark:bg-slate-900 bg-slate-50 dark:text-white mb-2">
                <input value="${u.email}" oninput="state.profileForm.email=this.value" class="w-full px-3 py-2 border rounded-xl dark:border-slate-700 dark:bg-slate-900 bg-slate-50 dark:text-white">
                <div class="mt-4"><label class="text-xs">Level</label><div class="grid grid-cols-3 gap-2 mt-2">${lvlList}</div></div>
                <div class="mt-4"><label class="text-xs">Interests</label><div class="flex flex-wrap gap-2 mt-2">${intList}</div></div>
            </div>
        `;
    } else {
        mainContent = `
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50"><p class="text-xs text-slate-400">Total Hours</p><p class="font-bold dark:text-white">${u.totalHours}h</p></div>
                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50"><p class="text-xs text-slate-400">Streak</p><p class="font-bold dark:text-white">${u.streak} days</p></div>
                </div>
                <div class="flex flex-wrap gap-2 mt-2">${u.interests.map(i => Badge('indigo', i)).join('')}</div>
            </div>
        `;
    }

    return `
    <div class="space-y-6 max-w-2xl fade-up">
        ${Card('p-6', `
            <div class="flex items-start justify-between mb-5">
                <h3 class="font-bold dark:text-white">Profile</h3>
                ${!state.profileForm.editing ? Button('ghost', '', 'onclick="editProfile()"', '<i data-lucide="edit-2" class="w-3"></i> Edit') : `
                  <div class="flex gap-2">
                     ${Button('ghost','','onclick="cancelProfileEdit()"','Cancel')}
                     ${Button('gradient','','onclick="saveProfile()"','Save')}
                  </div>
                `}
            </div>
            <div class="flex items-center gap-5 mb-6">
                <div class="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">${u.name.charAt(0)}</div>
                <div><p class="font-bold text-lg dark:text-white">${u.name}</p><p class="text-sm text-slate-500">${u.email}</p></div>
            </div>
            ${mainContent}
        `)}
        ${Card('p-5 mt-6', `
            <div class="flex items-center justify-between">
                <div><p class="font-medium text-sm dark:text-white">Appearance</p><p class="text-xs text-slate-400 mt-1">Currently ${state.theme} mode</p></div>
                <button onclick="toggleTheme()" class="relative w-14 h-7 rounded-full ${state.theme==='dark'?'bg-indigo-600':'bg-slate-200'}">
                    <span class="absolute top-1 w-5 h-5 rounded-full bg-white transition-all flex items-center justify-center ${state.theme==='dark'?'left-8':'left-1'}">
                        ${state.theme==='dark'?'<i data-lucide="moon" class="w-3 text-indigo-600"></i>':'<i data-lucide="sun" class="w-3 text-amber-500"></i>'}
                    </span>
                </button>
            </div>
        `)}
    </div>`;
}
window.editProfile = () => { state.profileForm = { ...state.profileForm, editing: true, name: state.user.name, email: state.user.email, skillLevel: state.user.skillLevel, interests: [...state.user.interests] }; render(); }
window.cancelProfileEdit = () => { state.profileForm.editing = false; render(); }
window.saveProfile = () => { state.user = { ...state.user, name: state.profileForm.name, email: state.profileForm.email, skillLevel: state.profileForm.skillLevel, interests: state.profileForm.interests }; state.profileForm.editing = false; toast('Profile updated'); render(); }
window.toggleProfileInterest = (i) => { 
    if(state.profileForm.interests.includes(i)) state.profileForm.interests = state.profileForm.interests.filter(x => x!==i);
    else state.profileForm.interests.push(i);
    render();
}
window.toggleTheme = () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; render(); }

// --- Shell Sub-components --- //
function renderSidebar(isMobile = false) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
        { id: 'progress', label: 'Progress', icon: 'trending-up' },
        { id: 'goals', label: 'Goals', icon: 'target' },
        { id: 'planner', label: 'Study Planner', icon: 'calendar' },
        { id: 'practice', label: 'Practice Zone', icon: 'book-open' },
        { id: 'quotes', label: 'Inspiration', icon: 'book-open' },
        { id: 'profile', label: 'Profile', icon: 'user' },
    ];
    
    const itemsHtml = navItems.map(item => {
        const active = state.activeSection === item.id;
        const classes = active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white';
        return `
            <button onclick="state.activeSection='${item.id}'; if(${isMobile}) state.mobileOpen=false; render();" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${classes}">
                <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                <span class="flex-1 text-left">${item.label}</span>
                ${active ? `<i data-lucide="chevron-right" class="w-3 h-3"></i>` : ''}
            </button>
        `;
    }).join("");

    return `
    <div class="flex flex-col h-full ${state.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r">
      <div class="p-6 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg"><span class="text-white font-bold text-sm">SP</span></div>
          <div><p class="font-bold text-slate-800 dark:text-white text-sm">StudyPro</p></div>
        </div>
      </div>
      <div class="mx-4 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${state.user.name.charAt(0)}</div>
          <div class="min-w-0"><p class="text-xs font-semibold dark:text-white truncate">${state.user.name}</p><p class="text-xs text-slate-400 truncate">${state.user.skillLevel}</p></div>
        </div>
      </div>
      <nav class="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-hide">${itemsHtml}</nav>
      <div class="p-3 border-t border-slate-200 dark:border-slate-800">
        <button onclick="state.page='login'; render();" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 cursor-pointer">
          <i data-lucide="log-out" class="w-4 h-4"></i> <span>Sign Out</span>
        </button>
      </div>
    </div>`;
}

function renderNavbar() {
    const unread = state.notifications.filter(n => !n.read).length;
    let notifsHtml = '';
    if (state.navbar.showNotif) {
        notifsHtml = `
            <div class="absolute right-0 top-12 w-80 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-2xl overflow-hidden z-50 fade-in">
                <div class="flex items-center justify-between px-4 py-3 border-b dark:border-slate-700"><span class="font-semibold text-sm dark:text-white">Notifications</span><button onclick="markAllRead()" class="text-xs text-indigo-500">Mark all read</button></div>
                <div class="divide-y max-h-64 overflow-y-auto dark:divide-slate-700/50">
                    ${state.notifications.map(n => `
                        <div class="px-4 py-3 flex gap-3 items-start ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-500/5':''}">
                            <div class="w-2 h-2 rounded-full mt-1.5 ${!n.read ? 'bg-indigo-500':'bg-slate-300 dark:bg-slate-600'}"></div>
                            <div><p class="text-sm dark:text-white">${n.text}</p><p class="text-xs text-slate-400 mt-0.5">${n.time}</p></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    return `
    <header class="h-16 flex items-center justify-between px-4 md:px-6 border-b ${state.theme==='dark'?'bg-slate-900/80 border-slate-800':'bg-white/80 border-slate-200'} backdrop-blur-md sticky top-0 z-30">
        <div class="flex items-center gap-3">
            <button onclick="state.mobileOpen=true; render();" class="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><i data-lucide="menu" class="w-5 h-5"></i></button>
            <h1 class="text-base font-semibold capitalize text-slate-800 dark:text-white">${state.activeSection}</h1>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="toggleTheme()" class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                ${state.theme === 'dark' ? '<i data-lucide="sun" class="w-4 h-4"></i>':'<i data-lucide="moon" class="w-4 h-4"></i>'}
            </button>
            <div class="relative">
                <button onclick="state.navbar.showNotif = !state.navbar.showNotif; render();" class="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <i data-lucide="bell" class="w-4 h-4"></i>
                    ${unread > 0 ? `<span class="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full text-white text-[9px] flex items-center justify-center font-bold">${unread}</span>`:''}
                </button>
                ${notifsHtml}
            </div>
            <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer ml-2">${state.user.name.charAt(0)}</div>
        </div>
    </header>`;
}
window.markAllRead = () => { state.notifications = state.notifications.map(n => ({...n, read:true})); render(); }

function renderAppLayout() {
    let sectionHtml = '';
    if(state.activeSection === 'dashboard') sectionHtml = renderDashboard();
    else if(state.activeSection === 'progress') sectionHtml = renderProgress();
    else if(state.activeSection === 'goals') sectionHtml = renderGoals();
    else if(state.activeSection === 'planner') sectionHtml = renderPlanner();
    else if(state.activeSection === 'practice') sectionHtml = renderPractice();
    else if(state.activeSection === 'quotes') sectionHtml = renderQuotes();
    else if(state.activeSection === 'profile') sectionHtml = renderProfile();

    let mobileOverlay = state.mobileOpen ? `
        <div class="fixed inset-0 bg-black/50 z-40 md:hidden fade-in" onclick="state.mobileOpen=false; render()"></div>
        <div class="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden fade-in" style="transform-origin:left; animation: modalEnter 0.3s ease forwards">${renderSidebar(true)}</div>
    ` : '';

    return `
    <div class="flex h-screen overflow-hidden ${state.theme==='dark'?'bg-slate-950 text-white':'bg-slate-50 text-slate-900'}">
      <div class="hidden md:flex w-60 flex-shrink-0 flex-col">${renderSidebar()}</div>
      ${mobileOverlay}
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        ${renderNavbar()}
        <main class="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
            ${sectionHtml}
        </main>
      </div>
    </div>`;
}

// --- Auth Pages --- //
function renderLoginPage() {
    const show = state.loginForm.show;
    const load = state.loginForm.loading;
    return `
    <div class="min-h-screen flex ${state.theme==='dark'?'bg-slate-950':'bg-slate-50'}">
      <div class="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-cyan-600">
        <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px); background-size: 40px 40px"></div>
        <div class="relative z-10 flex flex-col justify-center px-16 text-white">
          <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-8"><span class="font-bold text-xl">SP</span></div>
          <h2 class="text-4xl font-bold mb-4 leading-tight">Track your learning<br>journey with ease.</h2>
        </div>
      </div>
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="w-full max-w-md fade-up">
            <h1 class="text-2xl font-bold dark:text-white mb-1">Welcome back</h1>
            <p class="text-slate-500 mb-6">Sign in to continue</p>
            <form onsubmit="handleLogin(event)" class="space-y-4">
               <div>
                 <label class="block text-sm font-medium dark:text-slate-300 mb-1.5">Email</label>
                 <input type="email" oninput="state.loginForm.email=this.value" value="${state.loginForm.email}" class="w-full px-4 py-2.5 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50">
               </div>
               <div>
                 <label class="block text-sm font-medium dark:text-slate-300 mb-1.5">Password</label>
                 <div class="relative">
                    <input type="${show?'text':'password'}" oninput="state.loginForm.password=this.value" value="${state.loginForm.password}" class="w-full px-4 py-2.5 rounded-xl border dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50">
                    <button type="button" onclick="state.loginForm.show=!state.loginForm.show;render()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      ${show ? '<i data-lucide="eye-off" class="w-4"></i>' : '<i data-lucide="eye" class="w-4"></i>'}
                    </button>
                 </div>
               </div>
               <div class="flex justify-end"><button type="button" onclick="state.page='forgot'; render()" class="text-sm text-indigo-500">Forgot password?</button></div>
               ${Button('gradient', 'w-full', 'type="submit"', load ? 'Signing in...' : 'Sign In', load)}
            </form>
            <p class="text-center text-sm text-slate-500 mt-6">Don't have an account? <button onclick="state.page='signup'; render()" class="text-indigo-500 font-medium">Sign up</button></p>
        </div>
      </div>
    </div>`;
}
window.handleLogin = (e) => {
    e.preventDefault();
    state.loginForm.loading = true; render();
    setTimeout(() => { state.loginForm.loading = false; toast('Welcome back!'); state.page = 'app'; render(); }, 800);
};

function renderSignupPage() {
    const load = state.signupForm.loading;
    return `
    <div class="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div class="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl fade-up">
         <div class="text-center mb-8"><h1 class="text-2xl font-bold text-white mb-1">Create Account</h1></div>
         <form onsubmit="handleSignup(event)" class="space-y-4">
            <input placeholder="Full Name" oninput="state.signupForm.name=this.value" value="${state.signupForm.name}" class="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white mb-2">
            <input type="email" placeholder="Email" oninput="state.signupForm.email=this.value" value="${state.signupForm.email}" class="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white mb-4">
            <div class="relative mb-4">
               <input type="${state.signupForm.show?'text':'password'}" placeholder="Password" oninput="state.signupForm.password=this.value" value="${state.signupForm.password}" class="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white">
               <button type="button" onclick="state.signupForm.show=!state.signupForm.show;render()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><i data-lucide="eye" class="w-4"></i></button>
            </div>
            ${Button('gradient', 'w-full', 'type="submit"', load ? 'Creating account...' : 'Create Account', load)}
         </form>
         <p class="text-center text-sm text-slate-500 mt-5">Already have an account? <button onclick="state.page='login'; render()" class="text-indigo-400">Sign in</button></p>
      </div>
    </div>`;
}
window.handleSignup = (e) => {
    e.preventDefault();
    state.signupForm.loading = true; render();
    setTimeout(() => { state.signupForm.loading = false; state.user.name = state.signupForm.name || state.user.name; toast('Account created!'); state.page = 'app'; render(); }, 800);
}

function renderForgotPage() {
    return `
    <div class="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl fade-up">
        <button onclick="state.page='login'; render()" class="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6"><i data-lucide="arrow-left" class="w-4"></i> Back</button>
        ${!state.forgotForm.sent ? `
            <div class="mb-6"><h1 class="text-xl font-bold text-white mb-1">Forgot password?</h1></div>
            <form onsubmit="handleForgot(event)" class="space-y-4">
               <input type="email" placeholder="alex@example.com" class="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" required>
               ${Button('gradient', 'w-full', 'type="submit"', 'Send Link')}
            </form>
        ` : `
            <div class="text-center py-4"><h2 class="text-lg font-bold text-white mb-2">Check your email</h2>${Button('secondary', 'w-full mt-4', 'onclick="state.page=\'login\'; render()"', 'Back to Login')}</div>
        `}
      </div>
    </div>`;
}
window.handleForgot = (e) => {
    e.preventDefault();
    setTimeout(() => { state.forgotForm.sent = true; toast('Reset link sent!'); render(); }, 500);
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
    render();
});
