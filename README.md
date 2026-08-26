# 🏥 Medy — Smart Healthcare Triage Platform

**Medy** is a full-stack healthcare appointment management platform that connects patients with hospitals, doctors, and staff through a secure, role-based system. It features an AI-powered multilingual chatbot assistant for instant healthcare guidance.

> **Live Demo**: Deployed on Vercel  
> **Tech Stack**: React 19 · Express.js · PostgreSQL (Supabase) · Sequelize ORM · Gemini AI · Web Speech API

---

## 📋 Table of Contents

- [Features Overview](#-features-overview)
- [Role-Based Modules](#-role-based-modules)
  - [Patient (User)](#-patient-user-module)
  - [Staff](#-staff-module)
  - [Hospital Manager](#-hospital-manager-module)
  - [Admin](#-admin-module)
- [AI Chatbot](#-ai-chatbot---medy-ai)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment (Vercel)](#-deployment-vercel)
- [API Endpoints](#-api-endpoints)
- [Test Accounts](#-test-accounts)

---

## ✨ Features Overview

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | JWT-based login with bcrypt password hashing |
| 👥 **4 User Roles** | Patient, Staff, Hospital Manager, Admin |
| 🏥 **Hospital Management** | Add, edit, and manage hospitals across the network |
| 👨‍⚕️ **Doctor Management** | Add doctors, set specializations, manage approvals |
| 📅 **Appointment Booking** | 3-step flow: Hospital → Doctor → Time Slot |
| 🔍 **Search & Filter** | Find doctors by name and filter by specialization |
| 🤖 **AI Chatbot** | Gemini-powered multilingual assistant with voice I/O |
| 📱 **Responsive Design** | Mobile-first with sidebar navigation and overlay menus |
| 🛡️ **Security Hardened** | Helmet, rate limiting, CORS, compression |

---

## 👥 Role-Based Modules

### 🧑‍💻 Patient (User) Module

The patient is the primary end-user of the platform. After registering and logging in, patients can:

#### Book an Appointment (3-Step Flow)
1. **Select Hospital** — Browse all approved hospitals with location details
2. **Choose Doctor** — View doctors at the selected hospital with:
   - 🔍 **Search** by doctor name
   - 🏷️ **Filter** by specialization (Cardiologist, Dermatologist, Neurologist, Pediatrician, etc.)
3. **Select Time Slot** — Pick a date, view available slots, and confirm the booking

#### Other Features
- **My Bookings** — View all past and upcoming appointments with status tracking (Pending, Confirmed, Completed, Cancelled)
- **Profile Management** — Update name, phone, email, and date of birth
- **AI Chat** — Get instant healthcare guidance via the chatbot

#### Navigation
- Sidebar: Home · Profile · My Bookings · Book Appointment · Logout
- Header: "Book an Appointment" quick-access button

---

### 👨‍💼 Staff Module

Hospital staff members manage the day-to-day appointment operations for their assigned hospital.

#### Features
- **Generate Slots** — Create available time slots for doctors by selecting a date. The system auto-generates slots based on the doctor's working hours and slot duration
- **Manage Appointments** — View all appointments and update their status:
  - `Pending` → `Confirmed` or `Rejected`
  - `Confirmed` → `Completed` or `Cancelled`
- **Profile Management** — Update personal details

#### Navigation
- Sidebar: Home · Profile · Manage Appointments · Logout

---

### 🏥 Hospital Manager Module

Hospital managers oversee the medical team at their assigned hospital.

#### Features
- **Hospital Doctors** — Full CRUD management of doctors:
  - ➕ **Add Doctor** — Name, specialization, experience, fees, working hours, slot duration
  - ✏️ **Edit Doctor** — Modify doctor details
  - 🗑️ **Delete Doctor** — Remove doctors from the hospital
- **Team Management** — Add staff members to the hospital
- **Profile Management** — Update personal details

#### Navigation
- Sidebar: Home · Profile · Hospital Doctors · Logout

---

### 🛡️ Admin Module

The platform administrator has full control over the entire system.

#### Features
- **Overview Dashboard** — Real-time stats displayed in a compact 3-column grid:
  - Total Hospitals
  - Approved Doctors
  - Pending Approvals
  - Total Users
  - Total Appointments
  - System Health
- **Hospital Management** — Add new hospitals, edit existing ones, view detailed hospital profiles including:
  - List of doctors at each hospital
  - Staff assigned to each hospital
- **Doctor Approvals** — Review and approve/reject pending doctor registrations
- **User Management** — Create new users with any role (Admin, Manager, Staff, User)
- **Profile Management** — Update personal details

#### Navigation
- Sidebar: Home · Profile · Overview · Hospitals · Manage Doctors · User Management · Logout

---

## 🤖 AI Chatbot — Medy AI

A floating chatbot accessible from every page via a chat bubble button at the bottom-right corner.

### Features
- **Text Input** — Type questions in any language
- **Voice Input** — Click the microphone button to speak (uses Web Speech Recognition API)
- **Voice Output** — AI responses are automatically read aloud using a **female voice** (Web Speech Synthesis API)
- **Multilingual** — Automatically detects and responds in the user's language:
  - 🇬🇧 English · 🇮🇳 Hindi · 🇮🇳 Telugu · 🇮🇳 Tamil · 🇮🇳 Kannada · 🇮🇳 Malayalam · 🇮🇳 Bengali · and more
- **Secure** — API key is stored server-side in `.env`, never exposed to the browser
- **Context-Aware** — Maintains conversation history for follow-up questions

### How It Works
```
User clicks 💬 → Modal opens in center → Type or speak → 
Backend proxies to Gemini API → Response displayed + spoken aloud
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, Lucide Icons |
| **Backend** | Express.js, Node.js |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Sequelize v6 |
| **Auth** | JWT + bcryptjs |
| **AI** | Google Gemini API (gemini-3.6-flash) |
| **Voice** | Web Speech API (Recognition + Synthesis) |
| **Security** | Helmet, express-rate-limit, CORS, compression |
| **Build** | Vite 8 |
| **Deployment** | Vercel (Serverless) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/Lohith1807/medydoc.git
cd medydoc

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Start development server
npm run dev
```

The app will be available at `http://127.0.0.1:5173` with the API at port `5001`.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here

DB_DIALECT=postgres
DB_URL=your_supabase_connection_string

GEMINI_API_KEY=your_gemini_api_key_here
```

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default: 5001) |
| `JWT_SECRET` | Secret key for JWT token signing |
| `DB_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key (starts with `AIza`) |

---

## 🌐 Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import** your repository
3. Add the following **Environment Variables** in Vercel dashboard:
   - `JWT_SECRET`
   - `DB_URL`
   - `GEMINI_API_KEY`
4. Click **Deploy**

The `vercel.json` is pre-configured to:
- Serve the Express API as a serverless function at `/api/*`
- Serve the React frontend as static files with SPA routing

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with email/phone + password |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |

### Patient
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/patient/hospitals` | List all approved hospitals |
| GET | `/api/patient/doctors` | Search/filter doctors |
| GET | `/api/patient/doctors/:id/slots` | Get available slots |
| POST | `/api/patient/appointments` | Book an appointment |
| GET | `/api/patient/my-appointments` | View my bookings |

### Staff
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/staff/doctors/:id/generate-slots` | Generate time slots |
| GET | `/api/staff/appointments` | View all appointments |
| PUT | `/api/staff/appointments/:id` | Update appointment status |

### Manager
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/manager/doctors` | List hospital doctors |
| POST | `/api/manager/doctors` | Add a doctor |
| PUT | `/api/manager/doctors/:id` | Edit a doctor |
| DELETE | `/api/manager/doctors/:id` | Delete a doctor |
| GET | `/api/manager/users` | List hospital team |
| POST | `/api/manager/users` | Add team member |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/hospitals` | List all hospitals |
| POST | `/api/admin/hospitals` | Add a hospital |
| PUT | `/api/admin/hospitals/:id` | Edit a hospital |
| GET | `/api/admin/doctors/pending` | Pending doctor approvals |
| PUT | `/api/admin/doctors/:id/status` | Approve/reject doctor |
| POST | `/api/admin/users` | Create any user role |

### AI Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Send message to AI chatbot |

---

## 🧪 Test Accounts

The system auto-seeds these accounts on first run:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@gmail.com | admin123 |
| **Manager** | manager@gmail.com | manager123 |
| **Staff** | staff@gmail.com | staff123 |
| **Patient** | user@gmail.com | user123 |

---

## 📁 Project Structure

```
medy/
├── api/
│   ├── index.js          # Express server + Vercel serverless entry
│   ├── db.js             # Sequelize database connection
│   ├── models.js         # Data models (User, Hospital, Doctor, Slot, Appointment)
│   ├── middleware.js      # JWT auth middleware with role checking
│   ├── routes/
│   │   ├── auth.js       # Authentication routes
│   │   ├── admin.js      # Admin management routes
│   │   ├── manager.js    # Hospital manager routes
│   │   ├── staff.js      # Staff appointment routes
│   │   └── patient.js    # Patient booking routes
│   └── __tests__/        # Jest test suite
├── src/
│   ├── App.jsx           # Main app with routing and header
│   ├── api.js            # Frontend API client
│   ├── index.css         # Global styles
│   ├── main.jsx          # React entry point
│   ├── components/
│   │   └── AIChatBot.jsx # AI chatbot with voice I/O
│   └── pages/
│       ├── Home.jsx      # Landing page
│       ├── Login.jsx     # Login page
│       ├── Register.jsx  # Registration page
│       └── Dashboard.jsx # Role-based dashboard with all sub-views
├── .env.example          # Environment variable template
├── vercel.json           # Vercel deployment config
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite build configuration
```

---

## 📄 License

This project is built for educational and hackathon purposes.

---

**Built with ❤️ by Lohith**