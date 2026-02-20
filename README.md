# Fullstack MERN Application

Complete MERN stack application with Backend (Node.js + Express + MongoDB) and Frontend (React + Vite).

## 📁 Project Structure

```
Fullstackmern/
├── Backend/              # Node.js + Express API
│   ├── config/           # Database configuration
│   │   └── db.js
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   └── Otp.js
│   ├── routes/           # API routes
│   │   ├── userRoutes.js
│   │   └── authRoutes.js
│   ├── controllers/      # Route controllers
│   │   ├── userController.js
│   │   └── authController.js
│   ├── Services/         # Business logic
│   │   ├── authServices.js
│   │   └── Otpservices.js
│   ├── middleware/       # Custom middleware
│   │   └── authMiddleware.js
│   ├── server.js         # Main server file
│   └── .env              # Environment variables
│
└── Frontend/             # React + Vite application
    ├── src/              # Source files
    ├── index.html        # Entry HTML
    └── vite.config.js    # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running locally
- npm or yarn

### Backend Setup

1. Navigate to Backend folder:
```bash
cd Backend
```

2. Environment variables already configured in `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fullstackmern
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Note:** For OTP email functionality, update `EMAIL_USER` and `EMAIL_PASS` with your Gmail credentials. Use [App Password](https://support.google.com/accounts/answer/185833) for Gmail.

3. Start MongoDB (in a separate terminal):
```bash
mongod
```

4. Start Backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to Frontend folder:
```bash
cd Frontend
```

2. Start Frontend development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔧 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📦 Dependencies

### Backend
- express - Fast, unopinionated web framework
- mongoose - MongoDB object modeling
- cors - Enable CORS
- dotenv - Environment variables management
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- nodemailer - Email sending for OTP
- nodemon - Auto-restart server (dev)

### Frontend
- react - UI library
- react-dom - React DOM rendering
- vite - Fast build tool
- @vitejs/plugin-react - React plugin for Vite

## 🌐 API Endpoints

### General
- `GET /` - Server status

### User Routes
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Authentication Routes
- `POST /api/auth/register` - Register new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `POST /api/auth/send-otp` - Send OTP to email
  ```json
  {
    "email": "john@example.com"
  }
  ```
- `POST /api/auth/verify-otp` - Verify OTP
  ```json
  {
    "email": "john@example.com",
    "otp": "123456"
  }
  ```

## 💡 Tips

- Make sure MongoDB is running before starting the Backend
- Frontend proxies API requests to Backend automatically
- Both servers should run simultaneously for full functionality

## 🎯 Next Steps

- Add authentication (JWT)
- Add more models and routes
- Implement form validation
- Add error handling middleware
- Deploy to production

Happy Coding! 🚀
