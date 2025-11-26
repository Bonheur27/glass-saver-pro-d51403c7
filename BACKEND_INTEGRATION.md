# Backend Integration Guide

This document explains how to integrate and use the Express.js backend with the Cutting Optimizer frontend.

## Architecture Overview

The application is split into two parts:
- **Frontend**: React + Vite (runs in Lovable or locally on port 8080)
- **Backend**: Express.js + MySQL (runs separately on port 5000)

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Create a MySQL database:
```sql
CREATE DATABASE cutting_optimizer;
```

Run the schema:
```bash
mysql -u root -p cutting_optimizer < schema.sql
```

### 4. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and update:
```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=cutting_optimizer
PORT=5000
JWT_SECRET=your_random_secret_key_here
FRONTEND_URL=http://localhost:8080
```

### 5. Start the Backend
Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Frontend Configuration

### 1. Create Environment File
In the root directory, create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Start Frontend
The frontend will automatically connect to your backend API.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/export` - Export project data
- `POST /api/projects/:id/share` - Share project

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/trends` - Efficiency trends
- `GET /api/analytics/summary` - Summary statistics

## Features

### 1. User Authentication
- Sign up with email/password
- Login with JWT tokens
- Token stored in localStorage
- Auto-logout on invalid token

### 2. Project Management
- Save optimization projects with all data
- Load saved projects
- Update existing projects
- Delete projects
- Export project data as JSON

### 3. Analytics & Dashboard
- View project statistics
- Track efficiency trends over time
- Analyze sheet usage patterns
- Generate reports

### 4. Sharing
- Share projects with other users via email
- Set permissions (view/edit)

## Security Notes

1. **JWT Secret**: Always use a strong, random JWT_SECRET in production
2. **Database**: Use strong passwords for MySQL
3. **CORS**: Configure FRONTEND_URL correctly
4. **HTTPS**: Use HTTPS in production
5. **Rate Limiting**: Consider adding rate limiting for production

## Testing the Integration

1. Start the backend server
2. Start the frontend
3. Navigate to http://localhost:8080
4. Click "Login" and create an account
5. Add some sheets and pieces
6. Run optimization
7. Click "Save Project"
8. View saved projects in the Dashboard

## Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials in .env
- Ensure port 5000 is not in use

### Frontend can't connect
- Verify VITE_API_URL in .env
- Check backend is running
- Check browser console for CORS errors

### Authentication issues
- Clear localStorage
- Check JWT_SECRET is set
- Verify token hasn't expired (7 day expiry)

### Database errors
- Run schema.sql again
- Check table permissions
- Verify foreign key constraints

## Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use a process manager (PM2, systemd)
3. Set up SSL/TLS certificates
4. Configure firewall rules
5. Set up database backups
6. Enable logging
7. Add rate limiting

### Frontend
1. Build for production: `npm run build`
2. Deploy to hosting (Vercel, Netlify, etc.)
3. Set VITE_API_URL to production backend URL
4. Enable HTTPS

### Database
1. Use a managed MySQL service (AWS RDS, Google Cloud SQL)
2. Enable automated backups
3. Set up replication for high availability
4. Monitor performance

## Next Steps

- Add email verification
- Implement password reset
- Add file upload for bulk imports
- Create project templates
- Add collaborative editing
- Implement real-time updates with WebSockets
