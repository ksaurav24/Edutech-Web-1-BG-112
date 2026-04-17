# Finishing Details — Design Spec

**Date:** 2026-04-17  
**Project:** Edutech-Web-1-BG-112 (StudyPro)

---

## Scope

Four finishing-detail features:

1. Goals — mark done and delete (fix broken onclick IDs)
2. Profile photo — upload via Cloudinary (through backend)
3. Dashboard — replace all static data with real computed values
4. Backend — new `POST /profile/avatar` endpoint

---

## 1. Goals — Mark Done & Delete

### Problem

`renderGoals()` in `client/script.js` generates inline onclick handlers using bare (unquoted) ObjectId strings:

```js
onclick="toggleGoal(${goal.id})"   // renders as: toggleGoal(686abc123...)  ← invalid JS
onclick="removeGoal(${goal.id})"
```

MongoDB ObjectIds are not valid JS identifiers, so these throw a ReferenceError at runtime.

### Fix

Wrap IDs in single quotes inside the template literal:

```js
onclick="toggleGoal('${goal.id}')"
onclick="removeGoal('${goal.id}')"
```

No backend changes needed — the backend already supports `PATCH /goals/:id` (toggle `done`) and `DELETE /goals/:id`.

---

## 2. Profile Photo — Cloudinary Upload

### Approach

Upload flows through the backend to keep auth on the server side. No new npm packages needed.

**Frontend:**
- In `renderProfile()`, replace the initial-letter avatar `<div>` with:
  - An `<img>` if `state.user.avatar` is set, otherwise the initial letter
  - A camera-icon overlay button that triggers a hidden `<input type="file" accept="image/*">`
- On file select, use `FileReader` to read the file as a base64 data URL
- POST `{ avatar: "<data URL>" }` to `PATCH /profile` (reuse existing endpoint, which already handles `avatar` field) — **no new endpoint needed** since `profile.controller.ts` already accepts `avatar` in the update body

**Backend (no changes needed to controller):**
- `profile.controller.ts → update()` already handles `req.body.avatar` and saves it as a string
- The frontend currently sends only `name/email/skillLevel/interests` — we extend it to also send the Cloudinary URL

**New endpoint: `POST /profile/avatar`**

Since the profile `PATCH` endpoint just stores whatever string is passed as `avatar`, the actual Cloudinary upload logic must live somewhere. We add a dedicated endpoint:

- Route: `POST /profile/avatar`
- Auth: `verifyAuth` middleware
- Body: `{ avatar: "<base64 data URL>" }` (JSON, not multipart)
- Logic:
  1. Validate it's a valid image data URL
  2. Call `cloudinary.uploader.upload(base64, { folder: env.cloudinaryFolder, resource_type: 'image' })`
  3. Update `user.avatar = result.secure_url`
  4. Return updated profile

**Frontend API call:**
- Add `uploadAvatar(base64DataUrl)` to `profileApi.js`: `request('/profile/avatar', { method: 'POST', body: { avatar: base64DataUrl } })`
- Add `uploadAvatarAction()` to `asyncActions.js`
- Expose as `window.uploadAvatar` in `script.js`

---

## 3. Dashboard — Real Data

Replace all hardcoded values in `renderDashboard()` with computed values from `state`:

| Stat | Current (static) | New (computed) |
|------|-----------------|----------------|
| Total Hours | `142h` | `Math.round(state.sessions.reduce((sum, s) => sum + s.duration, 0) / 60 * 10) / 10` (duration in minutes) |
| Day Streak | `user.streak` | Already real — no change |
| Goals Done | `2 / 4` | `doneCount / state.goals.length` |
| Avg Score | `58%` | `Math.round(avg of Object.values(state.user.progress || {}))` or `0` if empty |

**Weekly chart** (currently hardcoded `weeklyData` array):
- Filter `state.sessions` to the current Mon–Sun week
- Group by weekday (Mon=0 … Sun=6), summing durations
- Build a 7-element array `[{ day: 'Mon', hours: X }, ...]`
- Fall back to `0` for days with no sessions
- Duration is in minutes → divide by 60 for display

---

## 4. Backend — `POST /profile/avatar`

**File:** `server/src/controllers/profile.controller.ts` — add `uploadAvatar` method  
**File:** `server/src/routes/profile.routes.ts` — add `router.post('/avatar', profile.uploadAvatar)`

Cloudinary is already configured via `env.cloudinaryCloudName/ApiKey/ApiSecret`.  
Initialize Cloudinary in `profile.controller.ts` or a shared `services/cloudinary.ts` file.

Validation:
- Reject if body is missing or `avatar` is not a string starting with `data:image/`
- Max size is handled implicitly by Express body parser limits (default 100kb — may need to increase to ~2MB for photos via `express.json({ limit: '5mb' })`)

Error handling:
- Cloudinary upload failure → 502 Bad Gateway with descriptive message

---

## Data Flow

```
User picks file (input[type=file])
  → FileReader reads as dataURL
    → POST /profile/avatar { avatar: dataURL }
      → backend: cloudinary.upload(dataURL)
        → user.avatar = secure_url saved to DB
          → response: updated profile
            → state.user.avatar = secure_url
              → re-render (shows <img> with new photo)
```

---

## Files Changed

| File | Change |
|------|--------|
| `client/script.js` | Fix goal onclick IDs; profile photo UI; dashboard real stats; weekly chart from sessions |
| `client/src/lib/api/profileApi.js` | Add `uploadAvatar()` |
| `client/src/lib/state/asyncActions.js` | Add `uploadAvatarAction()` |
| `server/src/controllers/profile.controller.ts` | Add `uploadAvatar()` method |
| `server/src/routes/profile.routes.ts` | Add `POST /avatar` route |
| `server/src/app.ts` | Increase JSON body limit to `5mb` |

---

## Out of Scope

- Progress/practice section data (not requested)
- Session delete
- Cropping/resizing of uploaded photos
- Multiple photo storage or gallery
