# PhishNet AI Coding Agent Instructions

## Project Overview
PhishNet is a comprehensive phishing simulation platform with multi-tenant architecture, built using Express.js/TypeScript backend, React frontend, and PostgreSQL database. The platform enables cybersecurity professionals to conduct realistic phishing campaigns for security awareness training.

## Core Architecture

### Backend Structure (Server-side)
- **Entry Point**: `server/index.ts` - Express server with custom middleware for logging and error handling
- **Database**: PostgreSQL with Drizzle ORM, schema defined in `shared/schema.ts`
- **Authentication**: Session-based auth with Passport.js in `server/auth.ts`
- **API Routes**: Centralized in `server/routes.ts` (1400+ lines) with middleware guards
- **Multi-tenancy**: Organization-based isolation throughout all entities

### Frontend Structure (Client-side)
- **Framework**: React 18 + TypeScript with Wouter routing
- **UI**: Radix UI components + TailwindCSS with shadcn/ui patterns
- **State**: React Query (@tanstack/react-query) for server state, local state with hooks
- **Auth Flow**: Context-based authentication with protected routes

### Key Patterns

#### Database Schema (shared/schema.ts)
```typescript
// All entities follow multi-tenant pattern with organizationId foreign key
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' })
  // ... other fields
});
```

#### API Route Structure
```typescript
// Standard pattern: middleware chaining with error handling
app.get("/api/campaigns", isAuthenticated, hasOrganization, async (req, res) => {
  const user = assertUser(req);
  // Organization filtering is mandatory for all queries
  const results = await db.select().from(campaigns)
    .where(eq(campaigns.organizationId, user.organizationId));
});
```

#### Frontend Component Pattern
```typescript
// Pages use query hooks + components directory structure
function CampaignsPage() {
  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => fetch("/api/campaigns").then(res => res.json())
  });
}
```

## Development Workflow

### Essential Commands
```bash
# Development (uses tsx for TypeScript execution)
npm run dev              # Starts server at localhost:5000 with Vite dev server
npm run dev:win         # Windows-specific development mode
npm run check           # TypeScript compilation check (no build)

# Database Management
npm run db:push         # Push schema changes to database (Drizzle)
npm run import-data     # Import default data/templates
npm run setup          # Complete database setup (push + import)

# Production Build
npm run build          # Vite build + esbuild server bundle
npm run start         # Production server from dist/index.js
```

### Database Development
- **ORM**: Drizzle with `drizzle.config.ts` pointing to `shared/schema.ts`
- **Migrations**: Uses `drizzle-kit push` (not traditional migrations)
- **Seeding**: `scripts/import-data.ts` contains default templates and organizations
- **Multi-tenancy**: Every query MUST filter by organizationId

### Authentication Guards
```typescript
// Required middleware chain for protected routes
isAuthenticated    // Validates session
hasOrganization   // Ensures user has valid organization
isAdmin          // Admin-only routes (user.isAdmin === true)
```

## Critical Integration Points

### File Upload System
- **Storage**: `server/storage.ts` with multer configuration
- **Endpoints**: `/api/uploads/*` for template assets and CSV imports
- **CSV Processing**: Papa Parse for target/user imports in routes.ts

### Email System
- **SMTP Profiles**: Multi-tenant SMTP configurations in database
- **Templates**: Rich HTML templates with variable substitution
- **Campaign Engine**: Async email sending with result tracking

### Landing Pages
- **Dynamic Serving**: HTML content stored in database, served via `/api/landing/*`
- **Tracking**: Click/interaction analytics linked to campaign results
- **Security**: Sandboxed execution environment for user-generated HTML

## Environment Configuration

### Required Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/phishnet
NODE_ENV=development|production
SESSION_SECRET=random-secret-key
PORT=5000  # Server port (client served from same server in production)
```

### Development Setup (Codespaces/Local)
1. **Database**: PostgreSQL required, connection via DATABASE_URL
2. **Client Dev Server**: Vite runs on port 3000, proxies API to port 5000
3. **Session Storage**: Uses database sessions (connect-pg-simple)

## Common Development Patterns

### Adding New API Endpoints
1. Add route to `server/routes.ts` with proper middleware
2. Include organization filtering for multi-tenancy
3. Use `assertUser(req)` helper for typed user access
4. Add corresponding React Query hooks in frontend

### Database Schema Changes
1. Modify `shared/schema.ts` (single source of truth)
2. Run `npm run db:push` to apply changes
3. Update TypeScript types (auto-generated from schema)
4. Ensure organizationId foreign keys on new tables

### Frontend Component Development
- Components in `client/src/components/` follow shadcn/ui patterns
- Pages in `client/src/pages/` with corresponding routes in App.tsx
- Use React Query for all server state management
- Form validation with react-hook-form + Zod schemas from shared/schema.ts

## Security Considerations
- **CSRF Protection**: Built into session middleware
- **SQL Injection**: Prevented by Drizzle ORM parameterized queries
- **Multi-tenancy**: Organization isolation enforced at database level
- **Authentication**: Session-based with secure httpOnly cookies
- **File Uploads**: Validated file types and size limits in storage.ts

## Testing & Debugging
- **Development Logs**: Server logs API requests with timing in console
- **Database Debug**: PostgreSQL client accessible via `server/db.ts` pool
- **Error Handling**: Centralized error middleware in `server/error-handler.ts`
- **Type Safety**: Strict TypeScript with shared schema types
