# Reel Local Spark - Project Documentation

## Overview
A full-stack video editing platform that connects business owners with video editors. Business owners can upload raw content and editors can accept projects, edit videos, and deliver final products.

## Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB + Socket.IO
- **File Storage**: Cloudinary
- **Payment**: Razorpay
- **Real-time**: Socket.IO for chat

## Project Structure

### Frontend (`/frontend/`)
```
frontend/
├── src/
│   ├── api/
│   │   └── api.ts                 # API client with all HTTP methods
│   ├── components/
│   │   ├── dashboard/             # Dashboard-specific components
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── ProjectCard.tsx    # Individual project display
│   │   │   ├── ProjectsSection.tsx # Projects listing
│   │   │   ├── StatsCard.tsx      # Statistics display
│   │   │   └── StatsSection.tsx   # Stats overview
│   │   ├── payment/
│   │   │   └── RazorpayPayment.tsx # Payment integration
│   │   ├── ui/                    # Reusable UI components (shadcn/ui)
│   │   └── ProtectedRoute.tsx     # Route protection
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication state management
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Mobile detection hook
│   │   └── use-toast.ts           # Toast notifications
│   ├── lib/
│   │   └── utils.ts               # Utility functions
│   ├── pages/
│   │   ├── BusinessDashboard.tsx  # Business user dashboard
│   │   ├── EditorDashboard.tsx    # Editor dashboard
│   │   ├── Index.tsx              # Landing page
│   │   ├── Login.tsx              # Login page
│   │   ├── ProjectDetail.tsx      # Project details with chat
│   │   ├── ProjectEdit.tsx        # Project editing
│   │   ├── Profile.tsx            # User profile
│   │   ├── Signup.tsx             # Registration
│   │   ├── Support.tsx            # Support page
│   │   └── Upload.tsx             # Project creation
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles
├── public/                        # Static assets
├── dist/                          # Build output (gitignored)
├── package.json                   # Dependencies and scripts
├── vite.config.ts                 # Vite configuration
├── tailwind.config.ts             # Tailwind CSS config
└── vercel.json                    # Vercel deployment config
```

### Backend (`/backend/`)
```
backend/
├── config/
│   ├── cloudinary.js              # Cloudinary configuration
│   └── database.js                # MongoDB connection
├── controllers/
│   ├── authController.js          # Authentication logic
│   ├── notificationController.js  # Notifications management
│   ├── paymentController.js       # Razorpay integration
│   ├── projectController.js       # Project CRUD operations
│   ├── statsController.js         # Statistics generation
│   ├── templateController.js      # Template management
│   └── testimonialController.js   # Testimonials management
├── middleware/
│   ├── auth.js                    # JWT authentication middleware
│   └── cloudinaryStorage.js       # File upload configuration
├── models/
│   ├── Message.js                 # Chat messages schema
│   ├── Notification.js            # Notifications schema
│   ├── Project.js                 # Projects schema
│   ├── SupportRequest.js          # Support requests schema
│   ├── Template.js                # Templates schema
│   ├── Testimonial.js             # Testimonials schema
│   └── User.js                    # Users schema
├── routes/
│   ├── auth.js                    # Authentication routes
│   ├── notifications.js           # Notification routes
│   ├── payment.js                 # Payment routes
│   ├── projects.js                # Project routes
│   ├── stats.js                   # Statistics routes
│   ├── templates.js               # Template routes
│   ├── testimonials.js            # Testimonial routes
│   └── upload.js                  # File upload routes
├── scripts/
│   ├── add-sample-reviews.js      # Add sample data
│   ├── seed-data.js               # Database seeding
│   ├── setup-database.js          # Database setup
│   └── test-rating.js             # Rating system test
├── uploads/                       # Local file storage (gitignored)
├── server.js                      # Main server file
└── package.json                   # Dependencies and scripts
```

## Key Features

### 1. User Authentication
- **Registration**: Business owners and editors can sign up
- **Login**: JWT-based authentication
- **Role-based access**: Different dashboards for business and editor users

### 2. Project Management
- **Project Creation**: Business owners upload raw content and create projects
- **Project Acceptance**: Editors can browse and accept available projects
- **Status Tracking**: Draft → In Progress → Completed → Delivered
- **File Management**: Raw files and final deliverables

### 3. Real-time Communication
- **Project Chat**: Socket.IO-based messaging between business owners and editors
- **File Sharing**: Upload files within chat
- **Typing Indicators**: Real-time typing status

### 4. Payment Integration
- **Razorpay Integration**: Secure payment processing
- **Payment History**: Track all transactions
- **Editor Earnings**: Calculate and display earnings

### 5. File Storage
- **Cloudinary Integration**: Cloud-based file storage
- **Multiple File Types**: Support for video and image files
- **File Size Limits**: 100MB maximum per file

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/collaborators` - Add collaborator (project acceptance)
- `GET /api/projects/available-jobs` - Get available jobs for editors
- `GET /api/projects/editor-projects` - Get editor's assigned projects

### File Upload
- `POST /api/upload/raw/:projectId` - Upload raw files
- `POST /api/upload/final/:projectId` - Upload final video
- `POST /api/upload/video/:projectId` - Upload video file
- `POST /api/upload/thumbnail/:projectId` - Upload thumbnail

### Chat
- `GET /api/projects/:projectId/messages` - Get project messages
- `POST /api/projects/:projectId/messages` - Send message

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['business', 'editor', 'admin']),
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  title: String,
  description: String,
  owner: ObjectId (ref: User),
  collaborators: [{
    user: ObjectId (ref: User),
    role: String (enum: ['viewer', 'editor', 'admin']),
    addedAt: Date
  }],
  status: String (enum: ['draft', 'in-progress', 'review', 'completed', 'archived']),
  category: String,
  tags: [String],
  rawFiles: [{
    url: String,
    public_id: String,
    originalname: String,
    resource_type: String,
    size: Number,
    uploadedAt: Date
  }],
  finalFile: {
    url: String,
    public_id: String,
    originalname: String,
    resource_type: String,
    size: Number,
    uploadedAt: Date
  },
  shopDetails: {
    name: String,
    tagline: String,
    address: String,
    offer: String
  },
  addons: {
    voiceover: Boolean,
    script: Boolean,
    subtitles: Boolean
  },
  budget: Number,
  deadline: String,
  industry: String,
  totalPrice: Number,
  payments: [{
    orderId: String,
    paymentId: String,
    amount: Number,
    status: String,
    date: Date
  }],
  reviews: [{
    user: ObjectId (ref: User),
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Backend (.env)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb://localhost:27017/reellocal
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set build directory to `frontend`
3. Set environment variable `VITE_API_URL`
4. Deploy

### Backend (Render)
1. Connect GitHub repository
2. Set root directory to `backend`
3. Set all environment variables
4. Deploy

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Cloudinary account
- Razorpay account

### Installation
1. Clone repository
2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Set up environment variables
4. Start development servers:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

## Security Features
- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- File type validation
- File size limits
- Input validation and sanitization

## Performance Optimizations
- Image optimization with Cloudinary
- Code splitting in frontend
- Lazy loading
- Caching strategies
- Database indexing

## Monitoring & Logging
- Console logging for development
- Error handling middleware
- Request/response logging
- Database query optimization

## Future Enhancements
- Video preview functionality
- Advanced project templates
- Automated quality checks
- Advanced analytics
- Mobile app
- AI-powered editing suggestions
