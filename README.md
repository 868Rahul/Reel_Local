# ReelLocal - Video Editing Platform

A comprehensive video editing platform that connects businesses with local video editors. Built with React, Node.js, and MongoDB.

## 🚀 Features

- **User Authentication** - JWT-based authentication with role-based access
- **Role-Based Access** - Business, Editor, and Admin dashboards
- **Video Upload & Management** - Cloudinary integration for media storage
- **Project Management** - Create, edit, and collaborate on video projects
- **Payment Integration** - Razorpay for secure payments
- **Real-time Features** - Socket.io for live updates
- **Reviews & Ratings** - User testimonials and project feedback

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, React Query

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, Cloudinary, Razorpay, Socket.io

## 📁 Project Structure

```
reel-local-spark/
├── frontend/               # React application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── backend/               # Node.js API
│   ├── config/           # Database & service configs
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth & validation
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── scripts/         # Database setup
│   └── server.js        # Main server
└── README.md            # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation

1. **Clone & Install Dependencies**
```bash
git clone <your-repo-url>
cd reel-local-spark
npm run install:all
```

2. **Environment Setup**

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reel-local-spark
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Setup Database**
```bash
npm run setup
```

4. **Start Development Servers**
```bash
npm run dev
```

5. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔧 Development Scripts

**Root Level (Recommended):**
- `npm run dev` - Start both servers
- `npm run dev:frontend` - Frontend only
- `npm run dev:backend` - Backend only
- `npm run install:all` - Install all dependencies
- `npm run setup` - Setup database
- `npm run build` - Build frontend
- `npm run lint` - Run ESLint

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### File Upload
- `POST /api/upload/video/:projectId` - Upload video
- `POST /api/upload/thumbnail/:projectId` - Upload thumbnail

### Payments
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment

## 🚀 Deployment

### Frontend
1. `cd frontend && npm run build`
2. Deploy to Vercel, Netlify, or static hosting
3. Update environment variables

### Backend
1. Set production environment variables
2. Deploy to Heroku, AWS, or DigitalOcean
3. Configure MongoDB Atlas

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

MIT License

---

**Built with ❤️ for the video editing community**
