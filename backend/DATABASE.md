# MongoDB Database Setup - Reel Local Spark

## Overview
This document describes the MongoDB database setup for the Reel Local Spark video editing platform.

## Database Configuration
- **Database Name**: `reel-local-spark`
- **Connection URI**: `mongodb://localhost:27017/reel-local-spark`
- **MongoDB Service**: Running on Windows as a service

## Collections

### 1. Users
Stores user account information including authentication details.

**Schema**: See `backend/models/User.js`

**Indexes**:
- `email_1` (unique) - For login and user lookup
- `role_1` - For role-based queries
- `isActive_1` - For filtering active users
- `createdAt_-1` - For sorting by registration date
- `lastLogin_-1` - For activity tracking

### 2. Projects
Stores video project information, collaborations, and metadata.

**Schema**: See `backend/models/Project.js`

**Indexes**:
- Text search index on `title`, `description`, `tags`
- `owner_1` - For user's projects
- `collaborators.user_1` - For collaborative projects
- `status_1` - For filtering by project status
- `category_1` - For filtering by category
- `isPublic_1` - For public/private filtering
- `createdAt_-1`, `updatedAt_-1` - For sorting
- `views_-1` - For popularity sorting
- `tags_1` - For tag-based filtering

**Compound Indexes** (for optimized queries):
- `owner_1, status_1` - User's projects by status
- `isPublic_1, status_1` - Public projects by status
- `category_1, isPublic_1` - Public projects by category
- `owner_1, createdAt_-1` - User's projects by date

### 3. Uploads
Tracks file uploads and metadata.

**Indexes**:
- `projectId_1` - For project-related uploads
- `uploadedBy_1` - For user upload history
- `uploadedAt_-1` - For sorting by upload date
- `fileType_1` - For filtering by file type

### 4. Sessions
Manages user sessions with automatic expiration.

**Indexes**:
- `userId_1` - For user session lookup
- `createdAt_1` (TTL: 24 hours) - Auto-expires old sessions

## Sample Data

### Test Users
| Role | Email | Password |
|------|--------|----------|
| Admin | admin@reellocalspark.com | password123 |
| Business | business@example.com | password123 |
| Editor | editor@example.com | password123 |
| User | user@example.com | password123 |

### Sample Projects
- **Marketing Campaign Video** (Business Owner, In Progress)
- **Educational Tutorial** (Admin, Completed, Public)
- **Company Introduction** (Business Owner, Draft)

## Scripts

### Database Setup
```bash
cd backend
npm run setup-db
```
Creates all necessary indexes and collections.

### Seed Sample Data
```bash
cd backend
npm run seed
```
Adds sample users and projects for testing.

## Database Operations

### Manual MongoDB Commands
```bash
# Connect to database
mongosh reel-local-spark

# Check collections
show collections

# View indexes
db.users.getIndexes()
db.projects.getIndexes()

# Count documents
db.users.countDocuments()
db.projects.countDocuments()
```

### Backup & Restore
```bash
# Backup
mongodump --db reel-local-spark --out backup/

# Restore
mongorestore backup/reel-local-spark
```

## Performance Considerations

1. **Text Search**: Full-text search is enabled on project titles, descriptions, and tags
2. **Compound Indexes**: Optimized for common query patterns
3. **TTL Indexes**: Automatic cleanup of expired sessions
4. **Unique Constraints**: Email uniqueness for users

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **Index Security**: No sensitive data in indexes
3. **Connection Security**: Local development setup (extend for production)

## Monitoring

Check database status:
```bash
mongosh reel-local-spark --eval "
console.log('Users:', db.users.countDocuments());
console.log('Projects:', db.projects.countDocuments());
console.log('Uploads:', db.uploads.countDocuments());
console.log('Sessions:', db.sessions.countDocuments());
"
```

## Troubleshooting

### Common Issues

1. **Connection Failed**: Ensure MongoDB service is running
   ```bash
   sc query MongoDB
   ```

2. **Index Conflicts**: Drop and recreate conflicting indexes
   ```javascript
   db.collection.dropIndex("index_name")
   ```

3. **Permission Issues**: Ensure proper MongoDB permissions

### Health Check
The backend provides a health endpoint that includes database connectivity:
```bash
curl http://localhost:5001/api/health
```
