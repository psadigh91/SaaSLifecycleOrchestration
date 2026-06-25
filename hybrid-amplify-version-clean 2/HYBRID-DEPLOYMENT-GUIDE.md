# Hybrid Next.js 14 Deployment Guide

## Overview

This is a hybrid Next.js 14 application that combines frontend and backend into a single deployable package optimized for AWS Amplify. The application uses serverless functions for API routes and PostgreSQL for data persistence.

## Architecture

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18, TailwindCSS, shadcn/ui components
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL with pg driver (serverless-optimized connection pooling)
- **Authentication**: JWT-based with httpOnly cookies
- **Deployment**: AWS Amplify (or any Node.js hosting platform)

## Prerequisites

1. Node.js 18+ and npm 9+
2. PostgreSQL database (RDS, Supabase, or similar)
3. AWS account (for Amplify deployment)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=SaaS Lifecycle Orchestration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database Schema

You need to run the database migrations from the backend project to create the necessary tables:

```bash
cd ../backend
npm run migrate
npm run seed  # Optional: populate with sample data
```

Or manually execute the SQL schema files in your PostgreSQL database.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment to AWS Amplify

### Option 1: Deploy via Amplify Console (Recommended)

1. **Push Code to Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Amplify Console**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" > "Host web app"
   - Connect your Git repository (GitHub, GitLab, Bitbucket)
   - Select your repository and branch

3. **Configure Build Settings**
   - Amplify should auto-detect the `amplify.yml` configuration
   - If not, use the provided `amplify.yml` in the root directory

4. **Set Environment Variables**
   In the Amplify Console, go to App Settings > Environment variables and add:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   JWT_SECRET=your-production-jwt-secret
   JWT_REFRESH_SECRET=your-production-refresh-secret
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-amplify-app.amplifyapp.com
   ```

5. **Deploy**
   - Click "Save and deploy"
   - Amplify will build and deploy your application
   - The app will be available at your Amplify domain

### Option 2: Deploy via Amplify CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in your project
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

## Database Configuration for Production

### Using Amazon RDS PostgreSQL

1. Create an RDS PostgreSQL instance in the same region as your Amplify app
2. Configure security groups to allow connections from Amplify
3. Use the connection string in your environment variables

### Using Supabase (Recommended for simplicity)

1. Create a [Supabase](https://supabase.com/) project
2. Get your connection string from Project Settings > Database
3. Enable connection pooling for serverless optimization
4. Use the pooler connection string in `DATABASE_URL`

## API Routes Structure

All API routes are located in `app/api/`:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer by ID
- `PATCH /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

- `GET /api/deals` - List deals
- `POST /api/deals` - Create deal
- `GET /api/deals/[id]` - Get deal by ID
- `PATCH /api/deals/[id]` - Update deal
- `DELETE /api/deals/[id]` - Delete deal

- `GET /api/escalations` - List escalations
- `POST /api/escalations` - Create escalation
- `GET /api/escalations/[id]` - Get escalation by ID
- `PATCH /api/escalations/[id]` - Update escalation
- `POST /api/escalations/[id]/recalculate-score` - Recalculate escalation score
- `DELETE /api/escalations/[id]` - Delete escalation

## Authentication Flow

1. User logs in via `/api/auth/login`
2. Server returns JWT token and sets httpOnly cookie
3. Middleware checks authentication on protected routes
4. Frontend can use the cookie automatically or pass token in Authorization header

## Testing

### Testing API Endpoints

Use curl or Postman to test API endpoints:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Get current user (with token)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Performance Optimization

### Database Connection Pooling

The application uses connection pooling optimized for serverless:
- Max connections: 10 (lower for serverless)
- Idle timeout: 30 seconds
- Connection timeout: 5 seconds

### Caching Strategy

React Query is configured with:
- Stale time: 5 minutes
- Cache time: 10 minutes
- No refetch on window focus

## Monitoring and Logs

### Amplify Logs

View logs in Amplify Console:
- Go to your app
- Click "Monitoring" tab
- View build logs, function logs, and access logs

### Database Logs

Enable query logging in development by checking console output. For production, consider using AWS CloudWatch or your database provider's logging.

## Security Considerations

1. **JWT Secrets**: Use strong, random secrets (min 32 characters)
2. **Database**: Use SSL connections in production
3. **Environment Variables**: Never commit `.env` files
4. **CORS**: Configure allowed origins in production
5. **Rate Limiting**: Consider adding rate limiting middleware for API routes

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible from your deployment environment
- Ensure SSL is properly configured for production databases
- Check security groups/firewall rules

### JWT Token Issues

- Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Check token expiration times
- Clear browser cookies if testing locally

### Build Failures

- Check Node.js version (must be 18+)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run type-check`

## Scaling Considerations

1. **Database**: Use connection pooling and read replicas for high traffic
2. **CDN**: Amplify automatically uses CloudFront CDN
3. **Serverless Functions**: Each API route is a separate Lambda function
4. **Database Indices**: Add indices on frequently queried columns

## Next Steps

1. Copy UI components from `frontend/components/` to `components/`
2. Copy page components from `frontend/app/(dashboard)/` to `app/(dashboard)/`
3. Copy stores from `frontend/stores/` to `stores/`
4. Implement missing features (WebSocket, AI agents, etc.)
5. Add comprehensive error handling and logging
6. Set up monitoring and alerting
7. Configure CI/CD pipeline
8. Add automated tests

## Support

For issues and questions:
1. Check this deployment guide
2. Review Next.js 14 documentation
3. Check AWS Amplify documentation
4. Review backend API documentation

## License

MIT
