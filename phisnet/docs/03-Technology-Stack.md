# PhishNet - Technology Stack & Dependencies

## 🔧 Technology Stack Overview

PhishNet leverages modern, industry-standard technologies to deliver a robust, scalable, and secure phishing simulation platform.

## 🖥️ Frontend Technologies

### Core Framework
- **React 18.2.0**
  - Component-based architecture
  - Virtual DOM for optimal performance
  - Concurrent features for better UX
  - Strong ecosystem and community support

- **TypeScript 5.0+**
  - Static type checking
  - Enhanced developer experience
  - Better code documentation
  - Reduced runtime errors

- **Vite 5.0+**
  - Fast development server
  - Hot module replacement (HMR)
  - Optimized production builds
  - Plugin ecosystem

### UI Framework & Styling
- **Tailwind CSS 3.4+**
  - Utility-first CSS framework
  - Responsive design system
  - Custom design tokens
  - JIT compilation for optimal bundle size

- **shadcn/ui Components**
  - Modern, accessible UI components
  - Customizable design system
  - Built on Radix UI primitives
  - Consistent user experience

- **Lucide React**
  - Beautiful, customizable icons
  - Tree-shakable icon library
  - Consistent visual language
  - SVG-based for crisp rendering

### State Management & Data Fetching
- **React Query (TanStack Query)**
  - Server state management
  - Caching and synchronization
  - Background updates
  - Optimistic updates

- **Zustand (Planned)**
  - Lightweight state management
  - TypeScript-first approach
  - Minimal boilerplate
  - DevTools integration

### Form Handling & Validation
- **React Hook Form**
  - Performant form library
  - Minimal re-renders
  - Built-in validation
  - TypeScript support

- **Zod**
  - Runtime type validation
  - Schema-first validation
  - TypeScript inference
  - Composable validators

### Development Tools
- **ESLint**
  - Code quality enforcement
  - Custom rule configuration
  - TypeScript integration
  - Airbnb style guide

- **Prettier**
  - Code formatting
  - Consistent style
  - IDE integration
  - Pre-commit hooks

## 🔧 Backend Technologies

### Runtime & Framework
- **Node.js 18+**
  - JavaScript runtime
  - Event-driven architecture
  - NPM ecosystem
  - Excellent performance

- **Express.js 4.18+**
  - Web application framework
  - Middleware support
  - RESTful API design
  - Large ecosystem

- **TypeScript 5.0+**
  - Type safety on the server
  - Better developer experience
  - Enhanced tooling
  - Reduced bugs

### Database & ORM
- **PostgreSQL 15+**
  - Robust relational database
  - ACID compliance
  - Advanced data types (JSONB)
  - Excellent performance
  - Strong security features

- **Drizzle ORM**
  - TypeScript-first ORM
  - SQL-like syntax
  - Type-safe queries
  - Migration support
  - Excellent performance

### Authentication & Security
- **express-session**
  - Session management
  - Memory/Redis store support
  - Security options
  - Cookie configuration

- **bcrypt**
  - Password hashing
  - Salt generation
  - Secure password storage
  - Industry standard

- **Helmet.js**
  - Security headers
  - XSS protection
  - Content Security Policy
  - HTTPS enforcement

### Validation & Utilities
- **Zod**
  - Request validation
  - Type inference
  - Error handling
  - Schema composition

- **Multer**
  - File upload handling
  - Multiple storage options
  - File filtering
  - Size limits

### Email & Communication
- **Nodemailer**
  - Email sending
  - SMTP support
  - HTML emails
  - Attachment support

- **ioredis (Planned)**
  - Redis client
  - Session storage
  - Caching layer
  - Pub/sub messaging

## 🗄️ Database Technologies

### Primary Database
```sql
-- PostgreSQL Features Used
- JSONB for flexible data storage
- Full-text search capabilities
- Advanced indexing (B-tree, GIN, GiST)
- Row-level security
- Triggers and stored procedures
- Connection pooling
- Read replicas (planned)
```

### Database Tools
- **pgAdmin** - Database administration
- **pg_dump/pg_restore** - Backup and restore
- **Database migrations** - Schema versioning
- **Connection pooling** - Performance optimization

### Data Storage Strategy
```typescript
// Multi-tenant Data Isolation
interface TenantData {
  organizationId: number;
  isolationLevel: 'schema' | 'row';
  encryptionKey?: string;
}

// JSONB Usage Examples
interface CampaignSettings {
  emailSettings: {
    fromName: string;
    fromEmail: string;
    trackingEnabled: boolean;
  };
  landingPageSettings: {
    redirectUrl: string;
    captureData: boolean;
    showWarning: boolean;
  };
}
```

## 🔨 Development Tools

### Build & Development
- **Vite** - Fast build tool and dev server
- **TypeScript Compiler** - Type checking and compilation
- **tsx** - TypeScript execution for Node.js
- **Concurrently** - Run multiple commands
- **Nodemon** - Auto-restart development server

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **lint-staged** - Run linters on staged files
- **husky** - Git hooks management

### Testing (Planned)
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **React Testing Library** - Component testing
- **Supertest** - API testing

## 📦 Package.json Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-hook-form": "^7.43.0",
    "@hookform/resolvers": "^2.9.10",
    "zod": "^3.20.6",
    "@tanstack/react-query": "^4.28.0",
    "lucide-react": "^0.344.0",
    "clsx": "^1.2.1",
    "tailwind-merge": "^1.10.0",
    "@radix-ui/react-slot": "^1.0.1",
    "@radix-ui/react-dialog": "^1.0.3",
    "@radix-ui/react-dropdown-menu": "^2.0.4",
    "@radix-ui/react-select": "^1.2.1",
    "@radix-ui/react-toast": "^1.1.3"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.2.0",
    "typescript": "^4.9.3",
    "tailwindcss": "^3.2.7",
    "postcss": "^8.4.21",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.36.0",
    "prettier": "^2.8.7"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.3",
    "express-session": "^1.17.3",
    "bcrypt": "^5.1.0",
    "helmet": "^6.1.5",
    "cors": "^2.8.5",
    "zod": "^3.20.6",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.1",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "@types/node": "^18.15.11",
    "@types/express": "^4.17.17",
    "@types/express-session": "^1.17.7",
    "@types/bcrypt": "^5.0.0",
    "@types/multer": "^1.4.7",
    "@types/nodemailer": "^6.4.7",
    "typescript": "^4.9.5",
    "tsx": "^3.12.6",
    "nodemon": "^2.0.22",
    "drizzle-kit": "^0.20.4"
  }
}
```

## 🏗️ Architecture Patterns

### Design Patterns Used

#### Frontend Patterns
1. **Component Composition Pattern**
```typescript
// Reusable component with composition
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}) => {
  const className = cn(
    'btn',
    `btn-${variant}`,
    `btn-${size}`
  );
  
  return <button className={className} {...props}>{children}</button>;
};
```

2. **Custom Hook Pattern**
```typescript
// Reusable logic with custom hooks
function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(endpoint);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  return { data, loading, error, fetchData };
}
```

#### Backend Patterns
1. **Repository Pattern**
```typescript
// Data access abstraction
interface CampaignRepository {
  create(campaign: CreateCampaignDto): Promise<Campaign>;
  findById(id: number): Promise<Campaign | null>;
  findByOrganization(orgId: number): Promise<Campaign[]>;
  update(id: number, data: UpdateCampaignDto): Promise<Campaign>;
  delete(id: number): Promise<void>;
}

class PostgresCampaignRepository implements CampaignRepository {
  constructor(private db: DrizzleDatabase) {}
  
  async create(campaign: CreateCampaignDto): Promise<Campaign> {
    const [result] = await this.db
      .insert(campaigns)
      .values(campaign)
      .returning();
    return result;
  }
  
  // ... other methods
}
```

2. **Service Layer Pattern**
```typescript
// Business logic encapsulation
class CampaignService {
  constructor(
    private campaignRepo: CampaignRepository,
    private emailService: EmailService,
    private analyticsService: AnalyticsService
  ) {}

  async createCampaign(data: CreateCampaignDto): Promise<Campaign> {
    // Validation
    const validatedData = campaignSchema.parse(data);
    
    // Business logic
    const campaign = await this.campaignRepo.create(validatedData);
    
    // Side effects
    await this.analyticsService.trackEvent('campaign_created', {
      campaignId: campaign.id,
      organizationId: campaign.organizationId
    });
    
    return campaign;
  }
}
```

3. **Middleware Pattern**
```typescript
// Cross-cutting concerns
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const organizationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = await getUserById(req.session.userId);
  req.organizationId = user.organizationId;
  next();
};
```

## 🚅 Performance Optimizations

### Frontend Optimizations
1. **Code Splitting**
```typescript
// Lazy loading components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Campaigns = lazy(() => import('./pages/Campaigns'));

// Route-based code splitting
const routes = [
  {
    path: '/dashboard',
    element: <Suspense fallback={<Loading />}><Dashboard /></Suspense>
  }
];
```

2. **Memoization**
```typescript
// Expensive calculations
const expensiveValue = useMemo(() => {
  return calculateComplexData(data);
}, [data]);

// Component memoization
const OptimizedComponent = memo(({ data, onAction }) => {
  return <ComplexComponent data={data} onAction={onAction} />;
});
```

### Backend Optimizations
1. **Database Query Optimization**
```typescript
// Efficient queries with Drizzle
const campaignsWithStats = await db
  .select({
    id: campaigns.id,
    name: campaigns.name,
    sentCount: sql<number>`count(${events.id})`.as('sent_count'),
    clickCount: sql<number>`count(case when ${events.type} = 'click' then 1 end)`.as('click_count')
  })
  .from(campaigns)
  .leftJoin(events, eq(campaigns.id, events.campaignId))
  .groupBy(campaigns.id)
  .where(eq(campaigns.organizationId, organizationId));
```

2. **Caching Strategy**
```typescript
// Memory caching for frequently accessed data
const cache = new Map();

const getCachedData = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetcher();
  cache.set(key, data);
  
  // Cache expiration
  setTimeout(() => cache.delete(key), 5 * 60 * 1000); // 5 minutes
  
  return data;
};
```

## 🔧 Configuration Management

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/phishnet
DB_HOST=localhost
DB_PORT=5432
DB_NAME=phishnet
DB_USER=username
DB_PASSWORD=password

# Server
PORT=3001
NODE_ENV=development
SESSION_SECRET=your-secret-key-here

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif

# Security
BCRYPT_ROUNDS=12
SESSION_MAX_AGE=86400000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": [
    "src/**/*",
    "vite.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

## 📈 Future Technology Considerations

### Planned Upgrades
1. **React 19** - When released, for improved performance
2. **Next.js** - For server-side rendering and better SEO
3. **tRPC** - Type-safe API calls
4. **Prisma** - Alternative ORM consideration
5. **Redis** - Caching and session storage
6. **Redis** - Caching and session storage
7. **GraphQL** - Alternative API approach (evaluation)
8. **GraphQL** - Alternative API approach

### Monitoring & Analytics
1. **Sentry** - Error tracking and monitoring
2. **LogRocket** - Session replay and debugging
3. **Google Analytics** - Usage analytics
4. **Prometheus** - Application metrics
5. **Grafana** - Metrics visualization

---

**Document Version:** 1.0
**Last Updated:** July 25, 2025
**Author:** PhishNet Project Team
**Project:** PhishNet Advanced Phishing Simulation Platform
