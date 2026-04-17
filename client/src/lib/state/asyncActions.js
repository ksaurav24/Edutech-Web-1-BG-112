import { authApi } from '../api/authApi.js';
import { goalsApi } from '../api/goalsApi.js';
import { sessionsApi } from '../api/sessionsApi.js';
import { profileApi } from '../api/profileApi.js';
import { notificationsApi } from '../api/notificationsApi.js';
import { clearAuthSession } from '../api/httpClient.js';

const runtime = {
  state: null,
  render: null,
  toast: null,
};

function getRuntime() {
  if (!runtime.state || !runtime.render || !runtime.toast) {
    throw new Error('Async actions are not configured');
  }
  return runtime;
}

function normalizeMessage(error, fallback) {
  return error?.message || fallback;
}

function extractList(payload, keys) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  for (const key of keys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }
  return [];
}

function toGoal(raw) {
  return {
    id: raw?.id ?? raw?._id,
    text: raw?.text ?? raw?.title ?? '',
    done: Boolean(raw?.done ?? raw?.completed),
  };
}

function toSession(raw) {
  return {
    id: raw?.id ?? raw?._id,
    date: raw?.date ?? '',
    subject: raw?.subject ?? 'Coding',
    duration: Number(raw?.duration ?? 0),
  };
}

function toNotification(raw) {
  return {
    id: raw?.id ?? raw?._id,
    text: raw?.text ?? raw?.message ?? '',
    time: raw?.time ?? 'now',
    read: Boolean(raw?.read),
  };
}

function applyUserFromPayload(payload) {
  const { state } = getRuntime();
  const user = payload?.user || payload;
  if (!user || typeof user !== 'object') {
    return;
  }
  state.user = {
    ...state.user,
    ...user,
    joinDate: user.joinDate || state.user.joinDate,
  };
}

export function configureAsyncActions({ state, render, toast }) {
  runtime.state = state;
  runtime.render = render;
  runtime.toast = toast;
}

export async function hydrateAfterAuthAction() {
  const { state } = getRuntime();
  const [profileRes, goalsRes, sessionsRes, notificationsRes] = await Promise.allSettled([
    profileApi.get(),
    goalsApi.list(),
    sessionsApi.list(),
    notificationsApi.list(),
  ]);

  if (profileRes.status === 'fulfilled') {
    applyUserFromPayload(profileRes.value);
  }

  if (goalsRes.status === 'fulfilled') {
    state.goals = extractList(goalsRes.value, ['goals', 'items']).map(toGoal);
  }

  if (sessionsRes.status === 'fulfilled') {
    state.sessions = extractList(sessionsRes.value, ['sessions', 'items']).map(toSession);
  }

  if (notificationsRes.status === 'fulfilled') {
    state.notifications = extractList(notificationsRes.value, ['notifications', 'items']).map(toNotification);
  }
}

export async function bootstrapAuthAction() {
  const { state } = getRuntime();
  try {
    const verifyData = await authApi.verify();
    state.isAuthenticated = true;
    applyUserFromPayload(verifyData);
    await hydrateAfterAuthAction();
  } catch (_verifyError) {
    state.isAuthenticated = false;
    clearAuthSession();
    state.page = 'login';
  }
}

export async function loginAction() {
  const { state, render, toast } = getRuntime();
  state.loginForm.loading = true;
  render();
  try {
    const data = await authApi.login({
      email: state.loginForm.email,
      password: state.loginForm.password,
    });
    applyUserFromPayload(data);
    state.isAuthenticated = true;
    state.page = 'app';
    state.loginForm.password = '';
    await hydrateAfterAuthAction();
    toast('Welcome back!');
  } catch (error) {
    toast(normalizeMessage(error, 'Unable to login'), 'error');
  } finally {
    state.loginForm.loading = false;
    render();
  }
}

export async function signupAction() {
  const { state, render, toast } = getRuntime();
  state.signupForm.loading = true;
  render();
  try {
    const data = await authApi.signup({
      name: state.signupForm.name,
      email: state.signupForm.email,
      password: state.signupForm.password,
    });
    applyUserFromPayload(data);
    state.isAuthenticated = true;
    state.page = 'app';
    state.signupForm.password = '';
    await hydrateAfterAuthAction();
    toast('Account created!');
  } catch (error) {
    toast(normalizeMessage(error, 'Unable to create account'), 'error');
  } finally {
    state.signupForm.loading = false;
    render();
  }
}

export async function forgotPasswordAction() {
  const { state, render, toast } = getRuntime();
  try {
    await authApi.forgotPassword({
      email: state.forgotForm.email,
    });
    state.forgotForm.sent = true;
    toast('Reset link sent!');
  } catch (error) {
    toast(normalizeMessage(error, 'Unable to send reset link'), 'error');
  } finally {
    render();
  }
}

export async function addGoalAction() {
  const { state, render, toast } = getRuntime();
  const text = state.goalsForm.text.trim();
  if (!text) {
    toast('Goal text is required', 'error');
    return;
  }

  try {
    const data = await goalsApi.create({ text });
    const savedGoal = toGoal(data?.goal || data);
    state.goals.push(savedGoal);
    state.goalsForm.text = '';
    state.goalsForm.modalOpen = false;
    toast('Goal added!');
  } catch (error) {
    toast(normalizeMessage(error, 'Unable to add goal'), 'error');
  } finally {
    render();
  }
}

export async function toggleGoalAction(goalId) {
  const { state, render, toast } = getRuntime();
  const current = state.goals.find((goal) => String(goal.id) === String(goalId));
  if (!current) {
    return;
  }

  try {
    const data = await goalsApi.update(goalId, { done: !current.done });
    const updatedGoal = toGoal(data?.goal || data || { ...current, done: !current.done });
    state.goals = state.goals.map((goal) => (String(goal.id) === String(goalId) ? updatedGoal : goal));
  } catch (error) {
    toast(normalizeMessage(error, 'Unable to update goal'), 'error');
  } finally {
    render();
  }
}

export async function removeGoalAction(goalId) {
  const { state, render, toast } = getRuntime();
  try {
    await goalsApi.remove(goalId);
    state.goals = state.goals.filter((goal) => String(goal.id) !== String(goalId));
    toast('Goal removed', 'info');
  } catch (error) {
    toast(normalizeMessage(error, 'Unable to remove goal'), 'error');
  } finally {
    render();
  }
}

export async function addSessionAction() {
  const { state, render, toast } = getRuntime();
  if (!state.plannerForm.date) {
    toast('Pick a date', 'error');
    return;
  }
  try {
    const payload = {
      date: state.plannerForm.date,
      subject: state.plannerForm.subject,
      duration: Number(state.plannerForm.duration),
    };
    const data = await sessionsApi.create(payload);
    state.sessions.push(toSession(data?.session || data || payload));
    state.plannerForm.modalOpen = false;
    toast('Session added');
  } catch (error) {
    toast(normalizeMessage(error, 'Unable to add session'), 'error');
  } finally {
    render();
  }
}

export async function saveProfileAction() {
  const { state, render, toast } = getRuntime();
  try {
    const payload = {
      name: state.profileForm.name,
      email: state.profileForm.email,
      skillLevel: state.profileForm.skillLevel,
      interests: state.profileForm.interests,
    };
    const data = await profileApi.update(payload);
    applyUserFromPayload(data?.user || payload);
    state.profileForm.editing = false;
    toast('Profile updated');
  } catch (error) {
    toast(normalizeMessage(error, 'Unable to update profile'), 'error');
  } finally {
    render();
  }
}

export async function markAllReadAction() {
  const { state, render, toast } = getRuntime();
  try {
    const data = await notificationsApi.markAllRead();
    const list = extractList(data, ['notifications', 'items']);
    if (list.length > 0) {
      state.notifications = list.map(toNotification);
    } else {
      state.notifications = state.notifications.map((notification) => ({ ...notification, read: true }));
    }
  } catch (error) {
    toast(normalizeMessage(error, 'Unable to update notifications'), 'error');
  } finally {
    render();
  }
}

export async function uploadAvatarAction(file) {
  const { state, render, toast } = getRuntime();

  const reader = new FileReader();
  reader.readAsDataURL(file);

  await new Promise((resolve, reject) => {
    reader.onload = resolve;
    reader.onerror = reject;
  });

  const base64DataUrl = reader.result;

  try {
    const data = await profileApi.uploadAvatar(base64DataUrl);
    applyUserFromPayload(data);
    toast('Photo updated!');
  } catch (error) {
    toast(normalizeMessage(error, 'Unable to upload photo'), 'error');
  } finally {
    render();
  }
}

export function logoutAction() {
  const { state, render } = getRuntime();
  clearAuthSession();
  state.isAuthenticated = false;
  state.page = 'login';
  render();
}

