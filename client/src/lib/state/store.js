export const state = {
  theme: 'dark',
  page: 'login',
  activeSection: 'dashboard',
  mobileOpen: false,
  isAuthenticated: false,
  user: {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: null,
    skillLevel: 'Intermediate',
    interests: ['Web Dev', 'AI', 'Data Science'],
    streak: 7,
    totalHours: 142,
    joinDate: 'Jan 2025',
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
  loginForm: { email: '', password: '', show: false, loading: false },
  signupForm: {
    name: '',
    email: '',
    password: '',
    show: false,
    loading: false,
    selectedInterests: ['Web Dev', 'AI'],
    level: 'Intermediate',
  },
  forgotForm: { email: '', sent: false },
  goalsForm: { text: '', modalOpen: false },
  plannerForm: { date: '', subject: 'Coding', duration: 60, modalOpen: false },
  profileForm: { editing: false, name: '', email: '', skillLevel: '', interests: [] },
  practiceForm: { input: '', submitted: false },
  navbar: { showNotif: false },
};

let renderFn = () => {};

export function registerRender(fn) {
  renderFn = fn;
}

export function renderApp() {
  renderFn();
}

export function setState(patch) {
  Object.assign(state, patch);
}

