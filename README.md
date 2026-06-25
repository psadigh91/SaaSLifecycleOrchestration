# SaaS Lifecycle Orchestration Platform - Hybrid Next.js Version

A hybrid Next.js 14 application combining frontend and backend for enterprise customer lifecycle orchestration, optimized for AWS Amplify deployment.

## Features

- **Authentication**: JWT-based authentication with secure httpOnly cookies
- **Customer Management**: CRUD operations for customer records
- **Deal Tracking**: Manage sales deals and opportunities
- **Escalation Management**: Track and prioritize support escalations with intelligent scoring
- **Responsive UI**: Built with TailwindCSS and shadcn/ui components
- **Serverless API**: Next.js API routes optimized for serverless deployment
- **Type-Safe**: Full TypeScript coverage across frontend and backend

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, React Query, Zustand
- **Backend**: Next.js API Routes, PostgreSQL, JWT Authentication
- **Database**: PostgreSQL with pg driver
- **Deployment**: AWS Amplify (or any Node.js platform)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials and JWT secrets.

### 3. Set Up Database

Run migrations from the backend project to create database tables, or manually create the schema in your PostgreSQL database.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
hybrid-amplify-version/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (serverless functions)
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── customers/            # Customer CRUD endpoints
│   │   ├── deals/                # Deal CRUD endpoints
│   │   └── escalations/          # Escalation CRUD endpoints
│   ├── (auth)/                   # Auth pages (login, register)
│   ├── (dashboard)/              # Dashboard pages (protected)
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # React Query & Theme providers
│   └── globals.css               # Global styles
├── lib/                          # Shared utilities
│   ├── db.ts                     # Database connection & queries
│   ├── auth.ts                   # Authentication utilities
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # Utility functions
│   ├── error.ts                  # Error handling
│   └── escalation-scoring.ts    # Escalation scoring logic
├── components/                   # React components (to be added)
├── stores/                       # Zustand stores (to be added)
├── middleware.ts                 # Next.js middleware (route protection)
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # TailwindCSS configuration
├── amplify.yml                   # AWS Amplify build configuration
└── HYBRID-DEPLOYMENT-GUIDE.md   # Detailed deployment guide
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers` - List customers (paginated)
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer by ID
- `PATCH /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Soft delete customer

### Deals
- `GET /api/deals` - List deals (paginated, filterable)
- `POST /api/deals` - Create deal
- `GET /api/deals/[id]` - Get deal by ID with feature gaps
- `PATCH /api/deals/[id]` - Update deal
- `DELETE /api/deals/[id]` - Delete deal

### Escalations
- `GET /api/escalations` - List escalations (paginated, filterable)
- `POST /api/escalations` - Create escalation
- `GET /api/escalations/[id]` - Get escalation by ID
- `PATCH /api/escalations/[id]` - Update escalation
- `POST /api/escalations/[id]/recalculate-score` - Recalculate priority score
- `DELETE /api/escalations/[id]` - Delete escalation

## Authentication

The application uses JWT-based authentication with the following flow:

1. User logs in via `/api/auth/login`
2. Server generates JWT token and sets httpOnly cookie
3. Middleware protects routes requiring authentication
4. Frontend automatically includes cookie in requests

## Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Code Formatting

```bash
npm run format
```

## Deployment

See [HYBRID-DEPLOYMENT-GUIDE.md](./HYBRID-DEPLOYMENT-GUIDE.md) for detailed deployment instructions.

### Quick Deploy to AWS Amplify

1. Push code to Git repository
2. Connect repository to AWS Amplify Console
3. Configure environment variables
4. Deploy

## Next Steps

To complete the full application:

1. **Copy UI Components**: Copy components from `../frontend/components/` to `./components/`
2. **Copy Pages**: Copy page components from `../frontend/app/(dashboard)/` to `./app/(dashboard)/`
3. **Copy Stores**: Copy Zustand stores from `../frontend/stores/` to `./stores/`
4. **Add Features**: Implement WebSocket, AI agents, background jobs as needed
5. **Testing**: Add unit tests and e2e tests
6. **Monitoring**: Set up logging, monitoring, and alerting

## Database Schema

The application expects the following tables in PostgreSQL:

- `users` - User accounts
- `customers` - Customer records
- `deals` - Sales deals
- `support_escalations` - Support escalations
- `feature_gaps` - Feature gap requests
- `product_tickets` - Product backlog items
- `scoping_specs` - Implementation specifications
- `handoff_packages` - Cross-team handoffs
- `notifications` - User notifications
- `audit_logs` - Audit trail

Run migrations from the backend project to create these tables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For questions and support, refer to:
- [Deployment Guide](./HYBRID-DEPLOYMENT-GUIDE.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
