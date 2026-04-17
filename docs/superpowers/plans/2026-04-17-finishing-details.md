# Finishing Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add goal completion/deletion, Cloudinary profile photo upload, and real dashboard stats to the StudyPro app.

**Architecture:** Backend gains a `POST /profile/avatar` endpoint that accepts a base64 data URL, uploads to Cloudinary, and persists the `secure_url`. The frontend computes all dashboard stats (hours, goals done, avg score, weekly chart) from the already-hydrated `state` object. Goals fix is a two-character change to quote the ObjectId in inline onclick handlers.

**Tech Stack:** Express + TypeScript (backend), Vanilla JS SPA (client), Cloudinary v2 SDK, MongoDB/Mongoose.

---

## File Map

| File | Change |
|------|--------|
| `server/src/app.ts` | Increase body parser limit from `1mb` to `5mb` |
| `server/src/services/cloudinary.ts` | New: initialize Cloudinary and export `uploadImage()` |
| `server/src/controllers/profile.controller.ts` | Add `uploadAvatar` method |
| `server/src/routes/profile.routes.ts` | Add `router.post('/avatar', profile.uploadAvatar)` |
| `client/src/lib/api/profileApi.js` | Add `uploadAvatar()` method |
| `client/src/lib/state/asyncActions.js` | Add `uploadAvatarAction()`, export it |
| `client/script.js` | Fix goal onclick IDs; profile photo UI + handler; dashboard real stats + weekly chart |

---

## Task 1: Increase JSON body limit

**Files:**
- Modify: `server/src/app.ts:18-19`

- [ ] **Step 1: Change the body parser limits**

In `server/src/app.ts`, replace both `'1mb'` strings with `'5mb'`:

```typescript
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
```

- [ ] **Step 2: Verify TypeScript still compiles**

```bash
cd server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add server/src/app.ts
git commit -m "chore: increase body parser limit to 5mb for avatar uploads"
```

---

## Task 2: Create Cloudinary service

**Files:**
- Create: `server/src/services/cloudinary.ts`

- [ ] **Step 1: Create the service file**

```typescript
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

export async function uploadImage(dataUrl: string, folder: string): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add server/src/services/cloudinary.ts
git commit -m "feat: add Cloudinary upload service"
```

---

## Task 3: Add uploadAvatar to profile controller

**Files:**
- Modify: `server/src/controllers/profile.controller.ts`

- [ ] **Step 1: Add import for the Cloudinary service and env at the top of the file**

Add these two imports after the existing imports in `server/src/controllers/profile.controller.ts`:

```typescript
import { uploadImage } from '../services/cloudinary';
import { env } from '../config/env';
```

- [ ] **Step 2: Add the `uploadAvatar` method inside `createProfileController()`**

Add this method after the `updatePreferences` method, before the closing `};` of the returned object:

```typescript
    uploadAvatar: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const avatar = req.body?.avatar;

        if (typeof avatar !== 'string' || !avatar.startsWith('data:image/')) {
          throw new BadRequestError('avatar must be a base64 image data URL');
        }

        const secure_url = await uploadImage(avatar, env.cloudinaryFolder);

        const user = await User.findByIdAndUpdate(
          userId,
          { $set: { avatar: secure_url } },
          { new: true, runValidators: true },
        ).lean();
        if (!user) throw new NotFoundError('User not found');

        const { password, refreshToken, resetPasswordToken, resetPasswordExpiresAt, __v, ...profile } = user as any;
        return ApiResponse.ok(res, profile, 'Avatar updated');
      } catch (err) {
        return next(err);
      }
    },
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add server/src/controllers/profile.controller.ts
git commit -m "feat: add uploadAvatar method to profile controller"
```

---

## Task 4: Add POST /avatar route

**Files:**
- Modify: `server/src/routes/profile.routes.ts`

- [ ] **Step 1: Add the route**

In `server/src/routes/profile.routes.ts`, add the new route after `router.patch('/preferences', profile.updatePreferences)`:

```typescript
  router.post('/avatar', profile.uploadAvatar);
```

The full file should now look like:

```typescript
import { Router } from 'express';
import { createProfileController } from '../controllers/profile.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

export function profileRouter(): Router {
  const router = Router();
  const profile = createProfileController();

  router.use(verifyAuth);

  router.get('/', profile.get);
  router.patch('/', profile.update);
  router.patch('/preferences', profile.updatePreferences);
  router.post('/avatar', profile.uploadAvatar);

  return router;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add server/src/routes/profile.routes.ts
git commit -m "feat: add POST /profile/avatar route"
```

---

## Task 5: Add uploadAvatar to client profileApi

**Files:**
- Modify: `client/src/lib/api/profileApi.js`

- [ ] **Step 1: Add the method**

Replace the contents of `client/src/lib/api/profileApi.js` with:

```javascript
import { request } from './httpClient.js';

export const profileApi = {
  get: () => request('/profile'),
  update: (payload) => request('/profile', { method: 'PATCH', body: payload }),
  updatePreferences: (payload) => request('/profile/preferences', { method: 'PATCH', body: payload }),
  uploadAvatar: (base64DataUrl) => request('/profile/avatar', { method: 'POST', body: { avatar: base64DataUrl } }),
};
```

- [ ] **Step 2: Commit**

```bash
git add client/src/lib/api/profileApi.js
git commit -m "feat: add uploadAvatar to profileApi"
```

---

## Task 6: Add uploadAvatarAction to asyncActions

**Files:**
- Modify: `client/src/lib/state/asyncActions.js`

- [ ] **Step 1: Export `uploadAvatarAction`**

Add this function at the end of `client/src/lib/state/asyncActions.js`, before the `logoutAction` export:

```javascript
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
```

- [ ] **Step 2: Add `uploadAvatarAction` to the import list at the top of `client/script.js`**

In `client/script.js`, update the import from `asyncActions.js`. Find the existing import block and add `uploadAvatarAction`:

```javascript
import {
    configureAsyncActions,
    bootstrapAuthAction,
    loginAction,
    signupAction,
    forgotPasswordAction,
    addGoalAction,
    toggleGoalAction,
    removeGoalAction,
    addSessionAction,
    saveProfileAction,
    uploadAvatarAction,
    markAllReadAction,
    logoutAction,
} from './src/lib/state/asyncActions.js';
```

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/state/asyncActions.js client/script.js
git commit -m "feat: add uploadAvatarAction to async actions"
```

---

## Task 7: Fix goal onclick IDs

**Files:**
- Modify: `client/script.js` (lines ~318 and ~322 in `renderGoals()`)

- [ ] **Step 1: Fix the two onclick handlers**

In `client/script.js`, find `renderGoals()`. Change the two onclick strings from bare interpolation to quoted:

Find:
```javascript
          <button onclick="toggleGoal(${goal.id})" class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${goal.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}">
```

Replace with:
```javascript
          <button onclick="toggleGoal('${goal.id}')" class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${goal.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}">
```

Find:
```javascript
          <button onclick="removeGoal(${goal.id})" class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all cursor-pointer">
```

Replace with:
```javascript
          <button onclick="removeGoal('${goal.id}')" class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all cursor-pointer">
```

- [ ] **Step 2: Verify manually**

Start the server, log in, add a goal, then:
- Click the circle button → goal should show strikethrough and green checkmark
- Hover the goal row → trash icon appears; click it → goal disappears

- [ ] **Step 3: Commit**

```bash
git add client/script.js
git commit -m "fix: quote goal IDs in onclick handlers so MongoDB ObjectIds work"
```

---

## Task 8: Profile photo UI

**Files:**
- Modify: `client/script.js` — `renderProfile()` and the `window.*` handlers section

- [ ] **Step 1: Replace the avatar placeholder `<div>` in `renderProfile()`**

In `renderProfile()`, find this block inside the profile card:

```javascript
            <div class="flex items-center gap-5 mb-6">
                <div class="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">${u.name.charAt(0)}</div>
                <div><p class="font-bold text-lg dark:text-white">${u.name}</p><p class="text-sm text-slate-500">${u.email}</p></div>
            </div>
```

Replace with:

```javascript
            <div class="flex items-center gap-5 mb-6">
                <div class="relative w-20 h-20 flex-shrink-0">
                  ${state.user.avatar
                    ? `<img src="${state.user.avatar}" alt="avatar" class="w-20 h-20 rounded-2xl object-cover">`
                    : `<div class="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">${u.name.charAt(0)}</div>`
                  }
                  <label for="avatarInput" class="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center cursor-pointer shadow-md transition-colors">
                    <i data-lucide="camera" class="w-3.5 h-3.5 text-white"></i>
                  </label>
                  <input id="avatarInput" type="file" accept="image/*" class="hidden" onchange="handleAvatarChange(this)">
                </div>
                <div><p class="font-bold text-lg dark:text-white">${u.name}</p><p class="text-sm text-slate-500">${u.email}</p></div>
            </div>
```

- [ ] **Step 2: Add `window.handleAvatarChange` handler**

Add this near the other `window.*` profile handlers (after `window.toggleTheme`):

```javascript
window.handleAvatarChange = async (input) => {
    const file = input.files?.[0];
    if (!file) return;
    await uploadAvatarAction(file);
};
```

- [ ] **Step 3: Verify manually**

Log in, go to Profile. You should see:
- A camera icon badge in the bottom-right corner of the avatar
- Clicking it opens the file picker
- Selecting a photo uploads it and the avatar updates to show the photo

- [ ] **Step 4: Commit**

```bash
git add client/script.js
git commit -m "feat: add Cloudinary profile photo upload to profile section"
```

---

## Task 9: Replace dashboard static data with real computed values

**Files:**
- Modify: `client/script.js` — `renderDashboard()` and `initAfterRender()`

- [ ] **Step 1: Replace the static stats block in `renderDashboard()`**

Find the `statsHtml` block in `renderDashboard()`:

```javascript
    let statsHtml = `
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3"><i data-lucide="clock" class="text-indigo-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">142h</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Hours</p>`)}
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3"><i data-lucide="flame" class="text-orange-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">${user.streak} days</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Day Streak</p>`)}
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3"><i data-lucide="target" class="text-emerald-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">2 / 4</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Goals Done</p>`)}
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-3"><i data-lucide="trending-up" class="text-cyan-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">58%</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avg Score</p>`)}
    `;
```

Replace with:

```javascript
    const totalMinutes = state.sessions.reduce((sum, s) => sum + Number(s.duration || 0), 0);
    const totalHoursDisplay = (totalMinutes / 60).toFixed(1).replace(/\.0$/, '');

    const doneGoals = state.goals.filter(g => g.done).length;
    const totalGoals = state.goals.length;
    const goalsStat = totalGoals > 0 ? `${doneGoals} / ${totalGoals}` : '—';

    const progressValues = Object.values(state.user.progress || {});
    const avgScore = progressValues.length
      ? Math.round(progressValues.reduce((sum, v) => sum + Number(v), 0) / progressValues.length)
      : 0;

    let statsHtml = `
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3"><i data-lucide="clock" class="text-indigo-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">${totalHoursDisplay}h</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Hours</p>`)}
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3"><i data-lucide="flame" class="text-orange-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">${user.streak} days</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Day Streak</p>`)}
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3"><i data-lucide="target" class="text-emerald-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">${goalsStat}</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Goals Done</p>`)}
      ${Card("p-4", `<div class="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-3"><i data-lucide="trending-up" class="text-cyan-500 w-4 h-4"></i></div><p class="text-xl font-bold text-slate-800 dark:text-white">${avgScore}%</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avg Score</p>`)}
    `;
```

- [ ] **Step 2: Replace the hardcoded `weeklyData` chart in `initAfterRender()`**

Find the `if (state.page === 'app' && state.activeSection === 'dashboard')` block in `initAfterRender()`. The chart currently uses the static `weeklyData` constant. Replace the chart data computation inside the block:

Find the block that starts:
```javascript
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
```

Replace that entire block with:

```javascript
    if (state.page === 'app' && state.activeSection === 'dashboard') {
        const ctx = document.getElementById('dashboardChart');
        if (ctx) {
            if(chartInstance) chartInstance.destroy();

            const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const weekMinutes = [0, 0, 0, 0, 0, 0, 0];
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
            const mondayOffset = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
            const monday = new Date(now);
            monday.setHours(0, 0, 0, 0);
            monday.setDate(now.getDate() + mondayOffset);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            state.sessions.forEach(s => {
                const d = new Date(s.date);
                if (d >= monday && d <= sunday) {
                    const idx = (d.getDay() === 0 ? 6 : d.getDay() - 1); // Mon=0…Sun=6
                    weekMinutes[idx] += Number(s.duration || 0);
                }
            });

            const weeklyChartData = DAY_LABELS.map((day, i) => ({
                day,
                hours: Math.round((weekMinutes[i] / 60) * 10) / 10,
            }));

            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: weeklyChartData.map(d => d.day),
                    datasets: [{
                        label: 'Study Hours',
                        data: weeklyChartData.map(d => d.hours),
```

Make sure the rest of the chart options block (backgroundColor, borderRadius, etc.) and closing brackets remain unchanged after the data array.

- [ ] **Step 3: Verify manually**

Log in. On the Dashboard:
- Total Hours shows sum of all session durations ÷ 60 (not 142h)
- Goals Done shows real count (e.g. "1 / 3")
- Avg Score shows average of progress values (or 0% if no progress set)
- Weekly chart bars reflect only sessions from this Mon–Sun (bars should be 0 if no sessions this week)

- [ ] **Step 4: Commit**

```bash
git add client/script.js
git commit -m "feat: replace static dashboard stats with real data from state"
```
