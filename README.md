# 🎓 Techub - Student Management System

A comprehensive full-stack student management application with role-based dashboards for administrators, master admins, and students. Built with modern web technologies for seamless performance and user experience.

[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Default Credentials](#-default-credentials)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 👨‍💼 **Admin Dashboard**
- **Student Management**
  - Add, edit, and delete students individually or in bulk
  - Search and filter students by name or ID
  - Organize students by section and batch
  - Update student passwords

- **Points System**
  - Award or deduct points with reasons
  - View complete point transaction history
  - Set absolute point values
  - Track student performance over time

- **Attendance Management**
  - Mark daily attendance (Present/Absent)
  - Date-wise attendance tracking
  - View attendance summary with statistics
  - Export attendance reports to PDF
  - Delete attendance records by date
  - Automatic locking after marking

- **Feedback Management**
  - View student feedback by category
  - Mark feedback as read/reviewed
  - Delete inappropriate feedback
  - Filter by status (New/Reviewed)

- **Spin Wheel (Gamification)**
  - Randomly select students for activities
  - Animated wheel with confetti effects
  - Track winner history
  - Exclude/include students from selection pool
  - Reset functionality

- **Bulk Upload**
  - Import students via Excel/CSV
  - Auto-generate login credentials
  - Preview before confirmation
  - Detailed error reporting

### 👑 **Master Dashboard**
- Approve or reject admin registrations
- Manage all admin accounts
- Change admin passwords
- Cascade delete admins (removes all their students)
- Preview delete impact before confirmation
- View system-wide statistics
- Update master account credentials

### 🎓 **Student Portal**
- View current points and history
- View detailed point transaction log with reasons
- Submit feedback (General, Question, Concern, Suggestion)
- View submitted feedback status
- Check personal attendance history
- Change password (self-service)

### 🔐 **Authentication & Security**
- Role-based access control (Master, Admin, Student)
- Bcrypt password hashing (12 salt rounds)
- Admin approval workflow
- Session management
- Protected routes
- Password change for all roles

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 5.4.20
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI + shadcn/ui (New York style)
- **State Management**: TanStack Query (React Query) 5.90.2
- **Routing**: Wouter 3.7.1
- **PDF Generation**: jsPDF + jspdf-autotable
- **Excel Processing**: XLSX 0.18.5
- **Icons**: Lucide React 0.545.0

### **Backend**
- **Runtime**: Node.js 20
- **Framework**: Express 4.21.2
- **Database**: MongoDB Atlas (Mongoose 8.19.1)
- **Authentication**: bcryptjs 3.0.2
- **File Upload**: Multer 2.0.2
- **Language**: TypeScript 5.6.3

### **Development Tools**
- **Module System**: ESM (ES Modules)
- **Package Manager**: npm
- **Environment**: dotenv
- **Execution**: tsx for TypeScript

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/techub.git
cd techub
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install

# Or for a clean install (recommended)
npm ci
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Optional (defaults shown)
DB_NAME=techub
PORT=10000
NODE_ENV=development
```

**To get your MongoDB URI:**
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

### 4. Set Up MongoDB Database

The application will automatically create collections on first run. No manual setup required!

---

## 🏃 Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will open automatically at `http://localhost:10000`

**Alternative commands:**

```bash
# Clean start (kills existing processes on port 5000)
npm run dev:clean

# Windows users can also use:
start-dev.bat
# or
start-dev.ps1
```

### Production Build

Build the application for production:

```bash
npm run build
```

This creates optimized files in `dist/public/`

### Start Production Server

```bash
npm start
```

Serves both API and built frontend on `http://localhost:10000`

### Preview Production Build

```bash
npm run preview
```

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ Yes | - | MongoDB Atlas connection string |
| `DB_NAME` | ❌ No | `techub` | Database name |
| `PORT` | ❌ No | `10000` | Server port |
| `NODE_ENV` | ❌ No | `development` | Environment mode |

---

## 📁 Project Structure

```
Techub/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/          # shadcn/ui primitives
│   │   │   ├── AdminStats.tsx
│   │   │   ├── SpinWheel.tsx
│   │   │   ├── StudentTable.tsx
│   │   │   └── ...
│   │   ├── pages/           # Route pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── MasterDashboard.tsx
│   │   │   ├── StudentPortal.tsx
│   │   │   └── Login.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities
│   │   └── types/           # TypeScript types
│   └── index.html
│
├── server/                   # Express backend
│   ├── models/              # Mongoose schemas
│   │   ├── AdminUser.ts
│   │   ├── Student.ts
│   │   ├── Attendance.ts
│   │   ├── Feedback.ts
│   │   └── ...
│   ├── database/
│   │   └── connection.ts    # MongoDB setup
│   ├── storage/
│   │   └── mongodb.ts       # Data access layer
│   ├── routes.ts            # API endpoints
│   ├── index.ts             # Server entry
│   └── vite.ts              # Vite middleware
│
├── shared/
│   └── types.ts             # Shared TypeScript types
│
├── dist/                     # Build output
│   └── public/              # Frontend build
│
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── render.yaml              # Render deployment config
└── README.md
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:10000/api
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "role": "admin" | "master" | "student"
}
```

#### Change Password
```http
POST /api/auth/change-password
Content-Type: application/json

{
  "username": "admin",
  "oldPassword": "admin123",
  "newPassword": "newpass123",
  "role": "admin" | "student"
}
```

#### Register Admin
```http
POST /api/admins/register
Content-Type: application/json

{
  "username": "newadmin",
  "password": "password123"
}
```

### Student Endpoints

```http
GET    /api/students                    # List students (admin-scoped)
GET    /api/students/:id                # Get by MongoDB ID
GET    /api/students/by-id/:studentId   # Get by student ID
POST   /api/students                    # Create student
PUT    /api/students/:id/points         # Set points
POST   /api/students/:id/points/add     # Add points
POST   /api/students/:id/points/minus   # Subtract points
PATCH  /api/students/:id/password       # Update password
DELETE /api/students/:id                # Delete student
```

**Headers:**
```
x-admin-id: <admin-user-id>
```

### Feedback Endpoints

```http
GET    /api/feedback                      # Get admin's feedback
GET    /api/feedback/student/:studentId   # Get student's feedback
POST   /api/feedback                      # Submit feedback
PUT    /api/feedback/:id/status           # Update status
PUT    /api/feedback/:id/read             # Mark as read
DELETE /api/feedback/:id                  # Delete feedback
```

### Attendance Endpoints

```http
GET    /api/attendance?date=YYYY-MM-DD    # Get attendance for date
GET    /api/attendance/student/:id        # Get student's attendance
POST   /api/attendance                    # Mark attendance (bulk)
GET    /api/attendance/summary            # Get summary stats
GET    /api/attendance/export?dates=...   # Export to JSON
DELETE /api/attendance/by-date/:date      # Delete by date
```

### Point Transactions

```http
GET /api/transactions?studentId=<id>     # Get transaction history
```

### Spin Wheel Endpoints

```http
GET    /api/spin/eligible                 # Get eligible students
POST   /api/spin                          # Spin and select winner
GET    /api/spin/history                  # Get winner history
DELETE /api/spin                          # Reset spins
POST   /api/spin/exclusions               # Bulk exclude/include
DELETE /api/spin/history/:studentId       # Remove from history
```

### Master Endpoints

**Headers:**
```
x-master-key: master
```

```http
GET    /api/master/admins                  # List all admins
POST   /api/master/admins/:id/approve      # Approve admin
GET    /api/master/admins/:id/preview-delete  # Preview cascade delete
DELETE /api/master/admins/:id              # Delete admin (cascade)
PATCH  /api/master/users/admin/:id         # Update admin credentials
PATCH  /api/master/users/student/:id       # Update student credentials
GET    /api/master/stats                   # Get statistics
```

### File Upload

```http
POST /api/upload
Content-Type: multipart/form-data

file: <excel-or-csv-file>
```

**Headers:**
```
x-admin-id: <admin-user-id>
```

### Health Check

```http
GET /api/health
```

---

## 🚢 Deployment

### Deploy to Render

This project is pre-configured for [Render](https://render.com/) deployment.

#### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render Account**
   - Sign up at [render.com](https://render.com/)

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect settings from `render.yaml`

4. **Configure Environment Variables**
   - Add `MONGODB_URI` with your MongoDB Atlas connection string
   - (Optional) Add `DB_NAME` if different from default

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (usually 3-5 minutes)

#### Render Configuration

The project includes `render.yaml` with:
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 20
- **Health Check**: `/api/health`
- **Plan**: Free tier compatible

### Deploy to Other Platforms

The application can be deployed to:
- **Vercel** (requires serverless adaptation)
- **Heroku**
- **Railway**
- **DigitalOcean App Platform**
- **AWS/Azure/GCP** (Docker recommended)

---

## 🔐 Default Credentials

### Creating Master User

You'll need to manually create a master user in MongoDB:

1. Connect to MongoDB Atlas
2. Go to your database → Collections
3. Create a document in `adminusers` collection:

```json
{
  "username": "master",
  "password": "$2a$12$[bcrypt-hashed-password]",
  "role": "master",
  "approved": true,
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

Or use MongoDB Compass/Shell to insert the master user.

> **Note**: Password must be bcrypt hashed. You can use online tools or create via the API.

### Admin Registration

Admins can self-register via:
```http
POST /api/admins/register
```

They will require master approval before accessing the system.

### Student Credentials

Student credentials are auto-generated when:
- Created manually by admin
- Imported via Excel/CSV

**Password format**: `NAMEUPPERCASEBATCHDIGITS@#`

Example: 
- Name: "John Doe"
- Batch: "2023-2027"
- Password: `JOHNDOE2327@#`

---

## 📸 Screenshots

> _Add screenshots of your application here_

### Login Page
![Login](screenshots/login.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### Student Portal
![Student Portal](screenshots/student-portal.png)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [MongoDB](https://www.mongodb.com/) - Database
- [Express](https://expressjs.com/) - Backend framework

---

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

## 🗺️ Roadmap

- [ ] Add email notifications
- [ ] Implement real-time updates (WebSockets)
- [ ] Add more report types (PDF/Excel)
- [ ] Mobile application (React Native)
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with external LMS systems

---

Made with ❤️ by Your Team Name

---

**⚠️ Security Note**: The master key authentication (`x-master-key: master`) is for demo purposes only. Replace with proper JWT authentication in production environments.
