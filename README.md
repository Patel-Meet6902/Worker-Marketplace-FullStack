# Worker Marketplace

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/Realtime-WebSocket-orange?style=for-the-badge)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)


## 📌 Overview

Worker Marketplace is a full-stack web application built for managing shift-based work between two types of users: **clients** and **workers**.

Clients can create shifts, manage applicants, approve or reject applications, and chat with workers. Workers can browse available shifts, apply, confirm or decline approved shifts, receive notifications, and communicate with clients through real-time chat.

This project was built to simulate a practical real-world hiring and shift management workflow.

---

## Features

### Authentication and Role-Based Access
- User registration and login
- JWT-based authentication
- Separate roles for **client** and **worker**
- Protected frontend routes
- Role-based redirection after login

### Client Features
- Create and update client profile
- Create new shifts
- View own shifts
- Edit shifts
- Cancel or complete shifts
- View applicants for a shift
- Approve or reject worker applications
- Chat with workers

### Worker Features
- Create and update worker profile
- Browse available shifts
- Filter shifts by location, date, pay, and status
- Apply to shifts
- View own applications
- Withdraw application
- Confirm or decline approved shifts
- Chat with clients

### Dashboard Features
- Client dashboard with shift and applicant insights
- Worker dashboard with application and shift status overview
- Recent activity panels
- Navigation into actual working pages

### Notifications
- Notification system stored in database
- Notifications created for important workflow events such as:
  - new application
  - application approved
  - application rejected
  - shift confirmed
  - shift declined
  - shift cancelled
  - new chat message

### Real-Time Chat
- Conversation-based chat between client and worker
- One conversation per shift between a client and a worker
- Chat history stored in database
- Real-time messaging using WebSocket

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| Vite | Development/build tool |
| React Router | Frontend routing |
| Axios | API requests |
| Tailwind CSS | Styling and responsive UI |
| WebSocket API | Real-time chat connection |

### Backend

| Technology | Purpose |
|---|---|
| FastAPI | Backend API framework |
| SQLAlchemy | ORM and database models |
| PostgreSQL | Relational database |
| JWT | Authentication |
| Argon2 | Password hashing |
| WebSocket | Real-time chat |
| Pydantic | Request/response validation |

---

## Project Structure

```bash
WorkerMarketPlace/
├── Backend/
│   ├── Logic/
│   │   ├── application_logic.py
│   │   ├── chat_logic.py
│   │   ├── dashboard_logic.py
│   │   ├── notification_logic.py
│   │   ├── profile_logic.py
│   │   ├── shift_logic.py
│   │   └── user_logic.py
│   │
│   ├── models/
│   │   ├── clients.py
│   │   ├── conversation.py
│   │   ├── message.py
│   │   ├── notification.py
│   │   ├── shiftapplications.py
│   │   ├── shifts.py
│   │   ├── user.py
│   │   └── workers.py
│   │
│   ├── Routers/
│   │   ├── applications.py
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── dashboard.py
│   │   ├── notifications.py
│   │   ├── profile.py
│   │   └── shift.py
│   │
│   ├── Database.py
│   ├── main.py
│   ├── requirements.txt
│   ├── schemas.py
│   ├── security.py
│   └── websocketManager.py
│
├── Frontend/
│   └── Worker_MarketPlace/
│       ├── public/
│       ├── src/
│       │   ├── api/
│       │   │   └── axios.js
│       │   ├── context/
│       │   │   └── AuthContext.jsx
│       │   ├── pages/
│       │   │   ├── ChatListPage.jsx
│       │   │   ├── ChatPage.jsx
│       │   │   ├── ClientMyShiftsPage.jsx
│       │   │   ├── CreateProfile.jsx
│       │   │   ├── CreateShiftPage.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── DashboardLayout.jsx
│       │   │   ├── LandingPage.jsx
│       │   │   ├── Loading.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── ProfilePage.jsx
│       │   │   ├── Register.jsx
│       │   │   ├── ShiftApplicantsPage.jsx
│       │   │   ├── ShiftDetailPage.jsx
│       │   │   ├── ShiftListPage.jsx
│       │   │   ├── WorkerMyApplicationsPage.jsx
│       │   │   ├── notification.jsx
│       │   │   └── validation.jsx
│       │   ├── routes/
│       │   │   ├── ProtectedRoute.jsx
│       │   │   ├── PublicRoute.jsx
│       │   │   └── RoleRedirect.jsx
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css
│       ├── package.json
│       ├── package-lock.json
│       └── vite.config.js
│
└── README.md
```

---

## Application Flow

### Client Flow
1. Register as client
2. Login
3. Create client profile
4. Create shift
5. View applicants
6. Approve or reject worker
7. Start chat
8. Complete or cancel shift

### Worker Flow
1. Register as worker
2. Login
3. Create worker profile
4. Browse available shifts
5. Apply to shift
6. View application status
7. Confirm, decline, or withdraw application
8. Start chat with client

---

## Main Modules

### Backend Modules
- **Auth** → handles registration, login, token generation, and current user logic
- **Profile** → manages client and worker profiles
- **Shift** → handles shift creation, update, listing, filtering, cancelling, and completion
- **Applications** → handles apply, approve, reject, confirm, decline, and withdraw flows
- **Dashboard** → provides dashboard summaries for both roles
- **Notifications** → stores and serves notifications
- **Chat** → manages conversations, messages, and WebSocket-based real-time messaging

### Frontend Modules
- **AuthContext** → manages login state and current user
- **Protected/Public Routes** → controls route access
- **DashboardLayout** → shared dashboard shell with sidebar and header
- **Landing Page** → public home page
- **Create Profile Pages** → first step after role-based registration
- **Shift Pages** → browsing, details, management, and applicants
- **Profile Page** → view and update profile
- **Chat Pages** → conversations list and real-time chat view

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/worker-marketplace.git
cd worker-marketplace
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Backend Setup

Go to the backend folder:

```bash
cd Backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate the virtual environment:

### On macOS / Linux
```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI server:

```bash
uvicorn main:app --reload
```

Backend will run at:

```bash
http://127.0.0.1:8000
```

---

## Frontend Setup

Open a new terminal and go to the frontend folder:

```bash
cd Frontend/Worker_MarketPlace
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Frontend will run at:

```bash
http://localhost:5173
```

---

## Backend Requirements

Typical backend dependencies include:

- fastapi
- uvicorn
- sqlalchemy
- psycopg2-binary
- python-jose
- argon2-cffi
- email-validator

Install them through:

```bash
pip install -r requirements.txt
```

---

## Notes Before Running

Before running the project, make sure:

- PostgreSQL is installed and running
- the database connection string in backend is correctly configured
- JWT secret key and any sensitive settings are configured properly
- backend is started before frontend
- the correct Python virtual environment is activated

---

## Key Functional Rules in the App

- Only clients can create and manage shifts
- Only workers can apply to shifts
- Completed or cancelled shifts are not shown in worker browse list
- A worker does not see shifts they already applied to
- Chat is only allowed between users connected through a valid shift/application flow
- One conversation exists per shift between one client and one worker

---

## Screenshots

You can add screenshots here later.

Example:

```md
![Landing Page](./screenshots/landing-page.png)
![Client Dashboard](./screenshots/client-dashboard.png)
![Worker Dashboard](./screenshots/worker-dashboard.png)
![Shift List](./screenshots/shift-list.png)
![Applicants Page](./screenshots/applicants-page.png)
![Chat Page](./screenshots/chat-page.png)
```

Suggested screenshots to add:
- Landing page
- Register page
- Login page
- Client dashboard
- Worker dashboard
- Create shift page
- Shift list page
- Shift applicants page
- Profile page
- Chat page

---

## Future Improvements

- Better UI polish and animations
- Custom modal confirmations
- Better form validations
- Toast-based notifications
- Real-time notification updates
- Responsive improvements for smaller screens
- Alembic migrations
- Deployment
- Better file naming cleanup for frontend utilities/components

---

## Known Limitations

- Some validation and UI polish can still be improved
- Notifications currently work through normal API flow instead of live push
- Some file names in frontend can be cleaned up for better structure
- Deployment is not yet completed

---

## Author

**Meet Patel**

This project was built as a practical full-stack application to simulate a real shift-based worker hiring and management system using modern frontend and backend technologies.