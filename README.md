# StudyPro - Educational Platform

A modern, feature-rich educational platform designed to help students manage their learning effectively. StudyPro combines a responsive frontend with a robust backend to provide a complete learning management experience.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Tools & Technologies](#tools--technologies)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Acknowledgments](#acknowledgments)

---

## 🎯 Project Overview

StudyPro is an educational web application built to empower students with tools for goal setting, study session tracking, profile management, and real-time notifications. The platform emphasizes ease of use, responsive design, and data security through modern web technologies.

### Key Goals
- Provide an intuitive interface for students to manage learning goals
- Track study sessions and visualize progress
- Enable secure user authentication and profile management
- Deliver real-time notifications and feedback
- Support both light and dark themes for better accessibility

---

## ✨ Features

### Authentication & User Management
- **User Registration & Login**: Secure sign-up with email validation
- **Password Recovery**: Forgot password functionality with email-based reset
- **JWT Authentication**: Secure token-based authentication system
- **User Profiles**: Personalized user profiles with customizable information

### Study Management
- **Goal Setting & Tracking**: Create, update, and track learning goals
- **Study Sessions**: Log study sessions with duration tracking
- **Progress Visualization**: Dashboard with charts displaying weekly study hours and subject performance
- **Goal Completion**: Mark goals as completed and monitor progress

### User Profile Features
- **Profile Customization**: Update personal information including name, email, interests, and skill levels
- **Interest Management**: Select from multiple areas of interest (Web Dev, AI, Data Science, Mobile, DevOps, UI/UX, Blockchain, Cybersecurity)
- **Skill Level Selection**: Specify proficiency levels (Beginner, Intermediate, Advanced)
- **Profile Picture**: Upload profile pictures using Cloudinary

### Notifications
- **Real-time Notifications**: Receive updates and reminders
- **Notification Status**: Mark notifications as read
- **Notification History**: View past notifications

### Dashboard
- **Weekly Study Analytics**: Visual representation of daily study hours
- **Subject Performance**: Track performance across different subjects
- **Motivational Quotes**: Daily inspirational quotes to keep users motivated
- **Recommended Skills**: Personalized skill recommendations based on interests
- **Theme Support**: Toggle between light and dark modes

---

## 🏗️ Architecture

### Backend Architecture

The backend follows a **layered architecture** pattern with clear separation of concerns:

```
server/src/
├── controllers/     # Request handlers and business logic
├── models/          # MongoDB schemas and data models
├── routes/          # API endpoint definitions
├── middlewares/     # Express middleware (auth, logging, error handling)
├── db/              # Database connection and initialization
├── config/          # Configuration management (environment variables)
├── utils/           # Utility functions (API responses, error handling, logger)
└── server.ts        # Application entry point
```

#### Key Layers

1. **Controllers Layer**: Handles request processing and response generation
   - `auth.controller.ts`: Authentication logic (signup, login, password reset)
   - `goals.controller.ts`: Goal management operations
   - `sessions.controller.ts`: Study session tracking
   - `profile.controller.ts`: User profile management
   - `notifications.controller.ts`: Notification handling
   - `health.controller.ts`: Health check endpoint

2. **Models Layer**: MongoDB data models with validation
   - User schema with encrypted passwords
   - Goal schema linked to users
   - StudySession schema for tracking
   - Notification schema for user alerts

3. **Middleware Layer**: Cross-cutting concerns
   - Authentication middleware for route protection
   - Request logging with Pino
   - Error handling middleware
   - Request ID tracking
   - CORS and security headers (Helmet)

4. **Routes Layer**: API endpoint definitions
   - `/api/v1/auth`: Authentication endpoints
   - `/api/v1/goals`: Goal management endpoints
   - `/api/v1/sessions`: Study session endpoints
   - `/api/v1/profile`: User profile endpoints
   - `/api/v1/notifications`: Notification endpoints
   - `/api/v1/health`: Health check endpoint

### Frontend Architecture

The frontend uses a **state-driven architecture** with vanilla JavaScript:

```
client/
├── src/
│   ├── lib/
│   │   ├── state/      # State management and async actions
│   │   ├── ui/         # UI utilities (toasts, theme)
│   │   └── api/        # API client functions
│   ├── router/         # Routing and route guards
│   └── views/          # Page renderers
├── script.js           # Main application logic and render functions
├── index.html          # HTML entry point
└── style.css           # Global styles
```

#### Frontend Flow

1. **State Management**: Centralized state store for managing app state
2. **Async Actions**: Asynchronous action handlers for API calls
3. **Router**: Client-side routing with auth guards
4. **Render Engine**: Dynamic HTML rendering based on state changes
5. **UI Components**: Toast notifications, theme management, form handling

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.19.2
- **Language**: TypeScript 5.5.3
- **Database**: MongoDB with Mongoose 8.5.0
- **Authentication**: 
  - JWT (jsonwebtoken 9.0.2)
  - bcryptjs 2.4.3 for password hashing
- **Security**:
  - Helmet 7.1.0 for HTTP security headers
  - CORS 2.8.5 for cross-origin requests
- **Logging**: Pino 9.3.2 with HTTP logging
- **Email**: Nodemailer 8.0.5
- **File Storage**: Cloudinary 2.7.0
- **Utilities**: UUID 10.0.0 for unique ID generation

### Frontend
- **Framework**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS 4 (via CDN)
- **Icons**: Lucide Icons
- **Charts**: Chart.js for data visualization
- **HTTP Client**: Fetch API

### Development Tools
- **Build Tool**: TypeScript Compiler (tsc)
- **Dev Server**: tsx for hot reload during development
- **Package Manager**: npm

---

## 📦 Tools & Technologies

### Testing & Quality
- **Type Checking**: TypeScript with strict mode for type safety
- **Logging**: Pino for structured JSON logging with log rotation

### Database
- **MongoDB**: NoSQL database for flexible schema
- **Mongoose**: ODM library for MongoDB with schema validation

### Deployment & DevOps
- **Node.js**: JavaScript runtime
- **npm**: Package management

### Security Features
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Stateless authentication
- **CORS**: Controlled cross-origin requests
- **Helmet**: Security headers protection
- **Input Validation**: Request body validation in controllers

### External Services
- **Cloudinary**: Image hosting and management
- **Nodemailer**: Email sending for password recovery

---

## 📂 Project Structure

```
Edutech-Web-1-BG-112/
├── server/                           # Backend application
│   ├── src/
│   │   ├── controllers/              # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── goals.controller.ts
│   │   │   ├── sessions.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── notifications.controller.ts
│   │   │   └── health.controller.ts
│   │   ├── models/                   # MongoDB schemas
│   │   │   ├── user.model.ts
│   │   │   ├── goal.model.ts
│   │   │   ├── studySession.model.ts
│   │   │   ├── notification.model.ts
│   │   │   └── index.ts
│   │   ├── routes/                   # API routes
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── goals.routes.ts
│   │   │   ├── sessions.routes.ts
│   │   │   ├── profile.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── middlewares/              # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   ├── requestId.ts
│   │   │   └── requestLogger.ts
│   │   ├── db/                       # Database setup
│   │   │   └── connectDB.ts
│   │   ├── config/                   # Configuration
│   │   │   └── env.ts
│   │   ├── utils/                    # Utility functions
│   │   │   ├── ApiResponse.ts
│   │   │   ├── ApiError.ts
│   │   │   └── logger.ts
│   │   ├── app.ts                    # Express app setup
│   │   └── server.ts                 # Entry point
│   ├── dist/                         # Compiled JavaScript (generated)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env (not in repo)
│
├── client/                           # Frontend application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── state/                # State management
│   │   │   │   ├── store.js
│   │   │   │   └── asyncActions.js
│   │   │   ├── ui/                   # UI utilities
│   │   │   │   └── toast.js
│   │   │   ├── api/                  # API client
│   │   │   │   └── client.js
│   │   │   └── router/               # Routing logic
│   │   │       ├── routeGuards.js
│   │   │       └── sections.js
│   │   └── main.js                   # App initialization
│   ├── script.js                     # Main app logic
│   ├── index.html                    # HTML template
│   ├── style.css                     # Global styles
│   └── package.json
│
├── README.md                         # This file
└── package.json (root)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Edutech-Web-1-BG-112
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies (if using npm for client)**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server/` directory:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/studypro
   JWT_SECRET=your-secret-key-here
   CORS_ORIGIN=http://localhost:5173
   CLOUDINARY_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-1.5-flash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:3000`

6. **Open the frontend**
   - Open `client/index.html` in a web browser or serve it using a local server
   - Or build and serve the client through your preferred web server

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Initiate password reset
- `POST /auth/reset-password` - Reset password with token

### Goal Endpoints
- `GET /goals` - List all user goals
- `POST /goals` - Create a new goal
- `PUT /goals/:id` - Update a goal
- `DELETE /goals/:id` - Delete a goal

### Session Endpoints
- `GET /sessions` - List all study sessions
- `POST /sessions` - Create a new study session
- `PUT /sessions/:id` - Update a session
- `DELETE /sessions/:id` - Delete a session

### Practice Endpoints
- `POST /practice/chat` - Generate topic-based practice coaching with profile-aware evaluation

Example request:
```json
{
  "topic": "JavaScript",
  "customTopic": "",
  "userAnswer": "A closure remembers variables from outer scope.",
  "conversation": [
    { "role": "assistant", "content": "What is a closure?" }
  ]
}
```

Example response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Practice response generated",
  "data": {
    "topic": "JavaScript",
    "assistantMessage": "Good start! You identified lexical scope correctly.",
    "evaluation": {
      "score": 78,
      "strengths": ["Correctly mentions outer scope"],
      "improvements": ["Explain retained bindings after parent function returns"],
      "idealAnswer": "A closure is a function bundled with references to its lexical environment.",
      "difficulty": "intermediate"
    },
    "nextQuestion": "Can you give one real-world closure use case?",
    "contextUsed": {
      "skillLevel": "Intermediate",
      "interests": ["Web Dev", "AI"],
      "streak": 7,
      "totalHours": 142
    }
  }
}
```

### Profile Endpoints
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /profile/upload-picture` - Upload profile picture

### Notification Endpoints
- `GET /notifications` - List all notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/mark-all-read` - Mark all notifications as read

### Health Check
- `GET /health` - API health status

---

## 💻 Development

### Development Scripts

**Backend**
```bash
cd server

# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Type checking
npm run typecheck
```

### Code Structure Best Practices
- Controllers handle HTTP request/response logic
- Models define data schemas with validation
- Middlewares are used for cross-cutting concerns
- API utilities provide consistent response formatting
- Environment variables manage configuration
- Error handling is centralized in middleware

### Error Handling
The application uses custom error classes for different HTTP status codes:
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `InternalServerError` (500)

### Logging
Structured logging using Pino provides:
- Request/response logging
- Error logging with stack traces
- Performance metrics
- Log rotation for file storage

---

## 🤝 Acknowledgments

This project was developed with the assistance of **Claude** (Anthropic's AI assistant) and **GitHub Copilot** for code generation, debugging, and implementation support.

### Technologies & Libraries Used
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - JavaScript charting library
- **Lucide Icons** - Icon library
- **JWT** - Secure token-based authentication
- **Pino** - Structured logging
- **Helmet** - Security middleware
- **Cloudinary** - Image hosting service

---

## 📄 License

This project is open source and available for educational purposes.

---

## 📞 Support

For issues, questions, or contributions, please open an issue in the repository or contact the development team.

---

**Happy Learning with StudyPro! 🎓**
