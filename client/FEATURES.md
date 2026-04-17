# Feature Roadmap — Static → Dynamic

> Current state: frontend-only (React + Vite). All data is local state and resets on refresh.
> Future state: connect a backend (Node/Express, Firebase, etc.) to make features persistent and real.

---

## 🔐 Authentication

| Feature | Static (Now) | Dynamic (With Backend) |
|---|---|---|
| Login form | UI only, no validation | JWT / session auth via API |
| Signup form | Stores in React state | Creates user in DB |
| Google / GitHub login | Button UI only | OAuth 2.0 integration |
| Forgot password | Shows success UI | Sends real reset email |
| Profile picture upload | Preview via `URL.createObjectURL` | Upload to S3 / Cloudinary |
| Remember me | Checkbox UI only | Persistent session / refresh token |

---

## 📊 Dashboard

| Feature | Static (Now) | Dynamic (With Backend) |
|---|---|---|
| Welcome message | Hardcoded dummy user name | Fetched from auth session |
| Stat cards (hours, streak, score) | Hardcoded values | Calculated from user activity logs |
| Weekly study chart | Static dummy data array | Aggregated from study session records |
| Motivational quote | Hardcoded string | Random quote from quotes API or DB |
| Recommended skills | Static card list | Personalized via user interests + ML |

---

## 📈 Progress Tracking

| Feature | Static (Now) | Dynamic (With Backend) |
|---|---|---|
| Subject progress bars | Local state sliders | Saved per user in DB |
| Circular progress indicators | Dummy percentages | Computed from completed tasks/sessions |
| Performance bar chart | Static subject scores | Real scores from assessments |
| Analytics cards (hours, consistency) | Hardcoded numbers | Derived from activity history |
| Streak tracker | Fixed value in context | Calculated from daily login/study logs |

---

## 🎯 Goals

| Feature | Static (Now) | Dynamic (With Backend) |
|---|---|---|
| Add goal | Adds to React state only | POST to goals API, stored in DB |
| Mark complete | Toggles local state | PATCH request updates DB record |
| Delete goal | Removes from local state | DELETE request to API |
| Progress bar | Computed from local array | Synced with server-side goal data |
| Goals list | Resets on refresh | Persisted per user account |

---

## 📅 Study Planner

| Feature | Static (Now) | Dynamic (With Backend) |
|---|---|---|
| Calendar view | Highlights hardcoded dates | Fetches sessions from DB |
| Add study session | Adds to local state | POST to sessions API |
| Session list | Dummy + local state | Fetched and filtered by user/date |
| Duration tracking | UI input only | Stored and aggregated for analytics |

---

## 🧠 Practice Zone

| Feature | Static (Now) | Dynamic (With Backend) |
|---|---|---|
| Problem input | Text area, no evaluation | Sent to code execution API (Judge0 etc.) |
| Submit button | Shows "backend needed" notice | Triggers evaluation, returns result |
| Sample problems | Hardcoded list | Fetched from problems DB with filters |
| Difficulty badges | Static labels | Tied to real problem metadata |

---

## 👤 Profile

| Feature | Static (Now) | Dynamic (With Backend) |
|---|---|---|
| Edit name / email | Updates local context only | PATCH to user profile API |
| Skill level selector | Stored in React state | Saved to user record in DB |
| Interests chips | Local state toggle | Persisted, used for recommendations |
| Avatar upload | Preview only (object URL) | Uploaded to cloud storage |
| Theme preference | React state, resets on refresh | Saved to user preferences in DB |

---

## 🔔 Notifications

| Feature | Static (Now) | Dynamic (With Backend) |
|---|---|---|
| Notification panel | Hardcoded static messages | Real-time via WebSocket or polling |
| Mark all read | Toggles local state | PATCH to notifications API |
| Unread badge count | Counted from local array | Server-driven unread count |

---

## 🎨 UI/UX

| Feature | Static (Now) | Dynamic (With Backend) |
|---|---|---|
| Toast notifications | Triggered by UI actions only | Triggered by API success/error responses |
| Loading skeletons | Not wired to real loading state | Shown during actual API fetch |
| Empty states | Always visible (no data) | Shown only when API returns empty |
| Dark / light theme | React state, resets on refresh | Persisted in user preferences |

---

## 🔌 Backend Integration Prompts

Use these as starting points when adding a backend:

- **Prompt 1 — Basic:** Build auth system (login/signup) and connect with frontend forms.
- **Prompt 2 — Intermediate:** Create REST APIs to store and fetch goals dynamically.
- **Prompt 3 — Advanced:** Implement a recommendation engine based on user interests and display on dashboard.
- **Prompt 4 — Hard:** Persist study planner sessions and sync with the calendar UI in real time.
