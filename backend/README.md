# Cutting Optimizer Backend

Express.js backend with MySQL database for the cutting optimization application.

## Features
- User authentication (signup/login)
- Save and load optimization projects
- Project history and analytics
- Export and sharing capabilities

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
- Create a MySQL database named `cutting_optimizer`
- Run the SQL schema from `schema.sql`:
```bash
mysql -u root -p cutting_optimizer < schema.sql
```

### 3. Environment Variables
- Copy `.env.example` to `.env`
- Update the values with your database credentials
```bash
cp .env.example .env
```

### 4. Run the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all user projects
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/export` - Export project data
- `POST /api/projects/:id/share` - Share project with others

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/trends` - Get efficiency trends
- `GET /api/analytics/summary` - Get summary statistics

## Security Notes
- Always change the JWT_SECRET in production
- Use strong database passwords
- Enable HTTPS in production
- Implement rate limiting for production use
