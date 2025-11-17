# Duplicate Leave Management (Calendar variant) — Deactivation Log

Date: 2025-11-15
Marker used: `DUPLICATE_LEAVE_CALENDAR_DISABLED`
Decision: Option A — fully comment duplicate, remove nav + route, no stubs.
Kept module: Non-calendar leave flow (DashboardLayout for Role=Manager/Employee) using `LeaveCalendar.jsx` with `leave_duration` and today default.

## Summary of Changes
- Disabled sidebar Calendar entries across roles in `DashboardLayout.jsx`.
- Removed Calendar page route and import in `App.jsx`.
- Replaced `CalendarPage.jsx` with a minimal stub and commented original code.
- Commented out `calendarApi.js` and exported empty object.
- Commented out server calendar wiring in `server.js`.
- Commented out `server/src/routes/calendar.routes.js` (exporting empty router to avoid accidental import issues).
- Commented out `server/src/controllers/calendar.controller.js`.

---

## Client

### 1) `client/src/components/layout/DashboardLayout.jsx`
- Old (example for each role):
```jsx
{ to: '/calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
```
- New:
```jsx
// DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar variant)
// { to: '/calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
```

### 2) `client/src/App.jsx`
- Old:
```jsx
import CalendarPage from './pages/common/calendar/CalendarPage'
...
<Route path="calendar" element={<ProtectedRoute roles={['Employee','Manager','Management','HR']}><CalendarPage /></ProtectedRoute>} />
```
- New:
```jsx
// DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar variant)
// import CalendarPage from './pages/common/calendar/CalendarPage'
...
{/* DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar variant)
<Route path="calendar" element={<ProtectedRoute roles={['Employee','Manager','Management','HR']}><CalendarPage /></ProtectedRoute>} />
*/}
```

### 3) `client/src/pages/common/calendar/CalendarPage.jsx`
- Old: Full interactive calendar view with leave modals and task details (537 lines).
- New (stub + original commented):
```jsx
// DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar variant)
export default function CalendarPage() { return null }
/* Original implementation commented out. See details here. */
```

### 4) `client/src/api/calendarApi.js`
- Old:
```js
import { createApiInstance } from './axiosConfig'
const calendarApi = createApiInstance()
export const calendarService = {
  getAllEvents: () => calendarApi.get('/calendar'),
  getMyEvents: () => calendarApi.get('/calendar/mine'),
  getEventById: (id) => calendarApi.get(`/calendar/${id}`),
  createEvent: (eventData) => calendarApi.post('/calendar', eventData),
  updateEvent: (id, eventData) => calendarApi.put(`/calendar/${id}`, eventData),
  deleteEvent: (id) => calendarApi.delete(`/calendar/${id}`),
}
```
- New:
```js
// DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar API)
/* original implementation commented */
export const calendarService = {}
```

---

## Server

### 5) `server/src/server.js`
- Old:
```js
const calendarRoutes = require('./routes/calendar.routes');
...
app.use('/api/calendar', calendarRoutes);
```
- New:
```js
// DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar routes)
// const calendarRoutes = require('./routes/calendar.routes');
...
// app.use('/api/calendar', calendarRoutes);
```

### 6) `server/src/routes/calendar.routes.js`
- Old:
```js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/calendar.controller');
router.use(authenticate);
router.get('/events', ctrl.events);
module.exports = router;
```
- New:
```js
// DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar routes)
/* entire file commented */
// Export an empty router to avoid runtime errors if imported accidentally
const router = require('express').Router();
module.exports = router;
```

### 7) `server/src/controllers/calendar.controller.js`
- Old: Aggregates tasks and leaves to calendar events and returns JSON.
- New:
```js
// DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar controller)
/* entire controller commented */
```

---

## Notes
- Retained module: `client/src/components/common/LeaveCalendar.jsx` —
  uses the preferred fields (today default + `leave_duration`).
- No other modules were found importing `calendarService`.
- If any residual references surface, remove them in follow-up changes.
