# Astradex — Full Project Audit

## 🚀 Project Overview
**Astradex** is an EduTech web app for 9th–12th grade board exam preparation (CBSE & TN Board).
- **Frontend**: React 19 (Create React App) — runs on `localhost:3000`
- **Backend**: Node.js + Express — runs on `localhost:5000`
- **Auth**: localStorage-based (no JWT, no sessions)
- **Data**: Hardcoded JSON / localStorage — no database

---

## ✅ What IS There (Working / Implemented)

### Pages & Routing
| Route | Page | Status |
|---|---|---|
| `/` | Homepage | ✅ Fully built |
| `/courses` | Courses Catalog | ✅ Working |
| `/courses/:courseId` | Course Detail | ✅ Working |
| `/login` | Login | ✅ Working (localStorage auth) |
| `/register` | Register | ✅ Working (localStorage) |
| `/dashboard/student` | Student Dashboard | ✅ UI built |
| `/dashboard/staff` | Staff Dashboard | ✅ UI built |
| `/dashboard/admin` | Admin Dashboard | ✅ UI built |

### Homepage (`Homepage.jsx`)
- ✅ Navbar with links: Home, Courses, About, Contact, Register, Login
- ✅ Dark/Light theme toggle (ThemeContext)
- ✅ Hamburger mobile menu
- ✅ Hero section with illustration SVG
- ✅ Stats section with animated counters
- ✅ Course preview cards
- ✅ Features/highlights section (icons for Live, Progress, Secure)
- ✅ Testimonials / About section
- ✅ Contact section
- ✅ Footer
- ✅ Logo switches between light/dark versions

### Courses Catalog (`CoursesCatalog.jsx`)
- ✅ Lists 16 courses (11th & 12th, CBSE & TN Board, 4 subjects each)
- ✅ Grade filter pills: All Levels, Grade 10, Grade 11, Grade 12
- ✅ Search bar by name/tagline
- ✅ Links to individual course detail pages

### Course Detail (`CourseDetail.jsx`)
- ✅ Course title, tagline, description
- ✅ Price display (₹4,999 — hardcoded)
- ✅ Quick Facts sidebar (level, duration, modules, instructors)
- ✅ Highlights list
- ✅ Tags & Upcoming Batches sections
- ✅ Demo video embed (YouTube iframe — same video for all courses)
- ✅ Curriculum outline (3 generic modules for all courses)
- ✅ Instructors section (2 generic instructors for all courses)
- ⚠️ "Enroll Now" → shows `alert()` only (no real enrollment)

### Login (`Login.jsx`)
- ✅ Email + password form with validation
- ✅ Role-based redirect: admin → `/dashboard/admin`, staff → `/dashboard/staff`, student → `/dashboard/student`
- ✅ Two hardcoded demo accounts in JS:
  - `admin@astradex.com` / `admin`
  - `staff@astradex.com` / `staff`
- ✅ Also reads registered users from localStorage (`astradex_users`)

### Register (`Register.jsx`)
- ✅ Full name, email, password, grade (select IX–XII), school
- ✅ Saves to localStorage (`astradex_users`)
- ✅ Redirects to `/login` on success
- ⚠️ Role always hardcoded to `"student"`

### Student Dashboard (`StudentDashboard.jsx`)
- ✅ Auth guard (redirects to `/login` if not logged in)
- ✅ Profile tab — shows name, email, grade, school from localStorage
- ✅ Enrolled Courses tab — shows first 2 courses from hardcoded list with a fake 35% progress bar
- ✅ All Courses → redirects to `/courses`
- ✅ Sidebar nav with icons

### Staff Dashboard (`StaffDashboard.jsx`)
- ✅ Auth guard (staff only)
- ✅ Profile tab — shows name, email, department, joining date
- ✅ Video upload section — validates YouTube URL, extracts video ID, embeds it, saves to localStorage
- ✅ Attendance, Handling Courses, Students, Salary, Timetable tabs — UI panels exist

### Admin Dashboard (`AdminDashboard.jsx`)
- ✅ Auth guard (admin only)
- ✅ Overview with animated stat counters (hardcoded: 1240 students, 45 staff, 12 courses, ₹12.5L revenue)
- ✅ Recent Activity list (hardcoded)
- ✅ User Management tab — hardcoded table of 4 users with Edit/Delete buttons
- ✅ Course Management tab — hardcoded list of 3 courses
- ✅ Analytics tab — simple CSS bar chart (hardcoded percentages)
- ✅ Settings tab — site name, contact email, enable registration checkbox

### Backend (`backend/server.js`)
- ✅ Express server on port 5000
- ✅ `POST /register` — saves to `user.json`
- ✅ `POST /login` — reads from `user.json`, returns user info
- ✅ CORS enabled
- ⚠️ **Frontend does NOT call the backend at all** — frontend uses localStorage only

---

## ⚠️ What is STUBBED / HARDCODED (UI only, no real logic)

| Feature | Status |
|---|---|
| Course enrollment | `alert()` placeholder — no real enrollment flow |
| Enrolled courses | Always shows first 2 courses from data file — not user-specific |
| Progress bars | Hardcoded at 35% |
| Admin user table | 4 hardcoded users — not connected to `user.json` |
| Admin course table | 3 hardcoded courses — not connected to courses data |
| Admin Edit/Delete buttons | Buttons render but do nothing |
| Admin analytics chart | 7 hardcoded bar heights |
| Admin stats | Hardcoded numbers (1240, 45, 12, ₹12.5L) |
| Staff attendance tab | UI only — no data |
| Staff "Handling Courses" tab | UI only — no data |
| Staff "Students with Courses" | UI only — no data |
| Staff salary details | UI only — no data |
| Staff timetable | UI only — no data |
| Student payment details | UI only — no data |
| Student "Upgrade Plans" | UI only — no data |
| Student "Refer and Earn" | UI only — no data |
| Student timetable | UI only — no data |
| Student mentors tab | UI only — no data |
| Admin settings "Save Changes" | Button does nothing |
| Course demo video | Same YouTube video for all 16 courses |
| Curriculum & instructors | Same generic 3-module/2-instructor template for all courses |

---

## ❌ What is MISSING (not implemented at all)

| Feature | Notes |
|---|---|
| **Backend integration** | Frontend never calls the backend API (no fetch/axios). Backend exists but is unused by the frontend. |
| **Real authentication** | No JWT, no sessions — just localStorage flags. Anyone can manually set `localStorage.setItem("role","admin")` and access admin panel. |
| **Actual enrollment system** | No way to enroll in a course and have it persist. |
| **Payment gateway** | Payment Details tab is empty; no Razorpay/Stripe integration. |
| **Real analytics** | No chart library (Chart.js, Recharts, etc.) — just CSS bars. |
| **Grade 10 courses** | Filter for "Grade 10" exists in catalog but no courses are tagged as `level: "10"`. |
| **Staff registration** | Only students can self-register. Staff accounts are manually added to `user.json`. |
| **Password hashing** | Passwords stored as plaintext in both localStorage and `user.json`. |
| **Profile editing** | No ability to edit name, school, grade, or password. |
| **Live class / Zoom integration** | Mentioned in marketing copy but not implemented. |
| **AI-powered quizzes** | Mentioned on login page but not implemented. |
| **Notifications system** | No notifications anywhere. |
| **Email verification** | No email functionality. |
| **Forgot password** | No reset flow. |
| **Logout button on some dashboards** | Admin has logout; check if Student/Staff have one. |
| **ThemeContext persistence** | Theme preference may not persist across page refreshes (check localStorage). |
| **About / Contact sections** | Present on homepage as anchor links; no separate pages. |
| **404 page** | Falls back to Homepage (`*` → `<Homepage />`). |

---

## 🏗️ Architecture Summary

```
Astradex/
├── src/
│   ├── Homepage.jsx          — Landing page (complete)
│   ├── App.js                — Router config
│   ├── styles.css            — Global CSS (42KB — large, covers all components)
│   ├── pages/
│   │   ├── Login.jsx         — localStorage auth
│   │   ├── Register.jsx      — localStorage registration
│   │   ├── CoursesCatalog.jsx— Course listing
│   │   ├── CourseDetail.jsx  — Course detail view
│   │   ├── StudentDashboard.jsx
│   │   ├── StaffDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── components/
│   │   └── UIUtils.jsx       — SkeletonLoader, EmptyState, AnimatedCounter
│   ├── context/
│   │   └── ThemeContext.js   — Dark/light mode toggle
│   └── data/
│       └── courses.js        — 16 hardcoded courses
└── backend/
    ├── server.js             — Express: /register, /login
    └── user.json             — User DB (flat JSON file with 4 seed users)
```

---

## 🔑 Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@astradex.com | admin |
| Staff | staff@astradex.com | staff |
| Admin (backend) | akshaykumar.sak6@gmail.com | admin123 |
| Staff (backend) | kavitha.rao@astradex.com | staffcredentials |
| Student | achyutha42@gmail.com | achyu |
| Student | kishore@gmail.com | kishore@02 |

> Note: Frontend only checks the two hardcoded demo accounts + localStorage registered users. The `user.json` accounts only work if the frontend is wired to the backend (which it currently is NOT).
