# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Git (optional, for version control)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages (~50 dependencies). It may take 2-3 minutes.

### 2. Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and update these critical values:

```bash
# Update with your PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/saas_lifecycle

# Generate strong secrets (32+ characters)
JWT_SECRET=generate-a-strong-random-secret-key-here
JWT_REFRESH_SECRET=generate-another-strong-random-secret-key-here
```

**Generate strong secrets:**
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Set Up Database

Option A: Use existing backend migrations
```bash
cd ../backend
npm install
npm run migrate
npm run seed  # Optional: adds sample data
```

Option B: Manual setup
- Connect to your PostgreSQL database
- Run the SQL schema files from `../backend/src/database/migrations/`

Required tables:
- users
- customers
- deals
- support_escalations
- feature_gaps
- product_tickets
- scoping_specs
- handoff_packages
- notifications
- audit_logs

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create Your First User

Use curl or Postman:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword123",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }'
```

### 6. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword123"
  }'
```

Save the returned `token` for authenticated requests.

### 7. Test API Endpoints

**Get current user:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create a customer:**
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "domain": "acme.com",
    "industry": "Technology",
    "company_size": "201-1000",
    "arr": 500000,
    "icp_fit": "high",
    "status": "active"
  }'
```

**List customers:**
```bash
curl http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. **Add UI Components**: Copy components from `../frontend/components/` to `./components/`
2. **Add Pages**: Copy pages from `../frontend/app/(dashboard)/` to `./app/(dashboard)/`
3. **Add Stores**: Copy Zustand stores from `../frontend/stores/` to `./stores/`
4. **Customize**: Modify the application to fit your needs

## Troubleshooting

### Database Connection Fails
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### JWT Token Errors
- Ensure JWT_SECRET is set (32+ characters)
- Check token hasn't expired (default: 1 hour)
- Verify cookie is being sent (check browser DevTools)

### TypeScript Errors
```bash
npm run type-check
```

### Build Fails
```bash
rm -rf .next
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types
- `npm run format` - Format code with Prettier

## Default Port

The application runs on port 3000 by default. To use a different port:

```bash
PORT=3001 npm run dev
```

## Production Deployment

See [HYBRID-DEPLOYMENT-GUIDE.md](./HYBRID-DEPLOYMENT-GUIDE.md) for AWS Amplify deployment instructions.

## Need Help?

1. Check [README.md](./README.md) for overview
2. Review [HYBRID-DEPLOYMENT-GUIDE.md](./HYBRID-DEPLOYMENT-GUIDE.md) for deployment
3. Check [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) for technical details
