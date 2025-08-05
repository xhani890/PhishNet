# PhishNet - File Structure & Code Organization

## 📁 Project Structure Overview

PhishNet follows a monorepo structure with clear separation between frontend, backend, and shared components:

```
phisnet/
├── 📄 README.md                    # Project documentation
├── 📄 package.json                 # Root package configuration
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .env.example                 # Environment template
├── 📄 components.json              # shadcn/ui configuration
├── 📄 tailwind.config.ts           # Tailwind CSS configuration
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 vite.config.ts               # Vite build configuration
├── 📄 playwright.config.ts         # E2E testing configuration
├── 📄 postcss.config.js            # PostCSS configuration
├── 📄 drizzle.config.ts            # Database ORM configuration
│
├── 📂 client/                      # Frontend React application
├── 📂 server/                      # Backend Node.js application
├── 📂 shared/                      # Shared types and utilities
├── 📂 docs/                        # Project documentation
├── 📂 migrations/                  # Database migrations
├── 📂 uploads/                     # File upload storage
├── 📂 scripts/                     # Build and utility scripts
├── 📂 tests/                       # Test files
├── 📂 e2e/                        # End-to-end tests
└── 📂 attached_assets/            # Project assets and resources
```

## 🖥️ Frontend Structure (client/)

### Main Directories
```
client/
├── 📄 index.html                   # HTML entry point
├── 📄 package.json                 # Frontend dependencies
├── 📄 vite.config.ts               # Vite configuration
├── 📄 tailwind.config.ts           # Tailwind configuration
├── 📄 tsconfig.json                # TypeScript configuration
│
├── 📂 public/                      # Static assets
│   ├── 🖼️ favicon.ico              # App favicon
│   ├── 🖼️ logo.png                 # App logo
│   └── 📄 manifest.json            # PWA manifest
│
├── 📂 src/                         # Source code
│   ├── 📄 main.tsx                 # Application entry point
│   ├── 📄 App.tsx                  # Root component
│   ├── 📄 App.css                  # Global styles
│   ├── 📄 index.css                # Base CSS with Tailwind
│   │
│   ├── 📂 components/              # Reusable UI components
│   │   ├── 📂 ui/                  # Base UI components (shadcn/ui)
│   │   │   ├── 📄 button.tsx       # Button component
│   │   │   ├── 📄 input.tsx        # Input component
│   │   │   ├── 📄 dialog.tsx       # Dialog/Modal component
│   │   │   ├── 📄 table.tsx        # Table component
│   │   │   ├── 📄 toast.tsx        # Toast notification
│   │   │   ├── 📄 dropdown-menu.tsx # Dropdown menu
│   │   │   ├── 📄 select.tsx       # Select component
│   │   │   ├── 📄 card.tsx         # Card component
│   │   │   ├── 📄 badge.tsx        # Badge component
│   │   │   └── 📄 ...              # Other UI components
│   │   │
│   │   ├── 📂 forms/               # Form components
│   │   │   ├── 📄 LoginForm.tsx    # Login form
│   │   │   ├── 📄 CampaignForm.tsx # Campaign creation form
│   │   │   ├── 📄 UserForm.tsx     # User management form
│   │   │   └── 📄 TemplateForm.tsx # Template creation form
│   │   │
│   │   ├── 📂 layout/              # Layout components
│   │   │   ├── 📄 Header.tsx       # App header
│   │   │   ├── 📄 Sidebar.tsx      # Navigation sidebar
│   │   │   ├── 📄 Footer.tsx       # App footer
│   │   │   ├── 📄 Layout.tsx       # Main layout wrapper
│   │   │   └── 📄 AuthLayout.tsx   # Authentication layout
│   │   │
│   │   ├── 📂 charts/              # Data visualization
│   │   │   ├── 📄 CampaignChart.tsx # Campaign analytics chart
│   │   │   ├── 📄 PieChart.tsx     # Pie chart component
│   │   │   ├── 📄 LineChart.tsx    # Line chart component
│   │   │   └── 📄 BarChart.tsx     # Bar chart component
│   │   │
│   │   └── 📂 common/              # Common components
│   │       ├── 📄 Loading.tsx      # Loading spinner
│   │       ├── 📄 ErrorBoundary.tsx # Error boundary
│   │       ├── 📄 NotFound.tsx     # 404 page
│   │       └── 📄 ProtectedRoute.tsx # Route protection
│   │
│   ├── 📂 pages/                   # Page components
│   │   ├── 📄 Dashboard.tsx        # Main dashboard
│   │   ├── 📄 Login.tsx            # Login page
│   │   ├── 📄 Register.tsx         # Registration page
│   │   │
│   │   ├── 📂 campaigns/           # Campaign pages
│   │   │   ├── 📄 CampaignList.tsx # Campaign listing
│   │   │   ├── 📄 CampaignCreate.tsx # Create campaign
│   │   │   ├── 📄 CampaignDetail.tsx # Campaign details
│   │   │   └── 📄 CampaignEdit.tsx # Edit campaign
│   │   │
│   │   ├── 📂 users/               # User management pages
│   │   │   ├── 📄 UserList.tsx     # User listing
│   │   │   ├── 📄 UserCreate.tsx   # Create user
│   │   │   ├── 📄 UserDetail.tsx   # User details
│   │   │   └── 📄 UserEdit.tsx     # Edit user
│   │   │
│   │   ├── 📂 templates/           # Template pages
│   │   │   ├── 📄 TemplateList.tsx # Template listing
│   │   │   ├── 📄 TemplateCreate.tsx # Create template
│   │   │   ├── 📄 TemplateDetail.tsx # Template details
│   │   │   └── 📄 TemplateEdit.tsx # Edit template
│   │   │
│   │   ├── 📂 settings/            # Settings pages
│   │   │   ├── 📄 GeneralSettings.tsx # General settings
│   │   │   ├── 📄 ProfileSettings.tsx # User profile
│   │   │   ├── 📄 SecuritySettings.tsx # Security settings
│   │   │   └── 📄 NotificationSettings.tsx # Notifications
│   │   │
│   │   └── 📂 reports/             # Reporting pages
│   │       ├── 📄 CampaignReports.tsx # Campaign reports
│   │       ├── 📄 UserReports.tsx  # User reports
│   │       └── 📄 AnalyticsDashboard.tsx # Analytics
│   │
│   ├── 📂 hooks/                   # Custom React hooks
│   │   ├── 📄 use-auth.tsx         # Authentication hook
│   │   ├── 📄 use-api.tsx          # API interaction hook
│   │   ├── 📄 use-permissions.tsx  # Permission checking hook
│   │   ├── 📄 use-campaigns.tsx    # Campaign data hook
│   │   ├── 📄 use-users.tsx        # User data hook
│   │   ├── 📄 use-templates.tsx    # Template data hook
│   │   ├── 📄 use-notifications.tsx # Notifications hook
│   │   └── 📄 use-debounce.tsx     # Debounce utility hook
│   │
│   ├── 📂 services/                # API service layer
│   │   ├── 📄 api.ts               # Base API configuration
│   │   ├── 📄 auth.ts              # Authentication API
│   │   ├── 📄 campaigns.ts         # Campaign API calls
│   │   ├── 📄 users.ts             # User API calls
│   │   ├── 📄 templates.ts         # Template API calls
│   │   ├── 📄 notifications.ts     # Notification API calls
│   │   └── 📄 reports.ts           # Reporting API calls
│   │
│   ├── 📂 stores/                  # State management
│   │   ├── 📄 auth-store.ts        # Authentication state
│   │   ├── 📄 campaign-store.ts    # Campaign state
│   │   ├── 📄 user-store.ts        # User state
│   │   └── 📄 notification-store.ts # Notification state
│   │
│   ├── 📂 utils/                   # Utility functions
│   │   ├── 📄 constants.ts         # App constants
│   │   ├── 📄 formatting.ts        # Data formatting utilities
│   │   ├── 📄 validation.ts        # Validation schemas
│   │   ├── 📄 helpers.ts           # General helper functions
│   │   ├── 📄 date.ts              # Date utilities
│   │   └── 📄 export.ts            # Data export utilities
│   │
│   ├── 📂 types/                   # TypeScript type definitions
│   │   ├── 📄 index.ts             # Main type exports
│   │   ├── 📄 api.ts               # API response types
│   │   ├── 📄 auth.ts              # Auth-related types
│   │   ├── 📄 campaign.ts          # Campaign types
│   │   ├── 📄 user.ts              # User types
│   │   └── 📄 common.ts            # Common types
│   │
│   └── 📂 assets/                  # Static assets
│       ├── 📂 images/              # Image files
│       ├── 📂 icons/               # Icon files
│       └── 📂 fonts/               # Font files
```

### Key Frontend Files

#### Main Entry Point
```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

#### App Component
```typescript
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
// ... other imports

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="campaigns/*" element={<CampaignRoutes />} />
          <Route path="users/*" element={<UserRoutes />} />
          {/* ... other routes */}
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
```

## 🔧 Backend Structure (server/)

### Main Directories
```
server/
├── 📄 package.json                 # Backend dependencies
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 .env                         # Environment variables
├── 📄 app.ts                       # Application entry point
├── 📄 routes.ts                    # API route definitions
├── 📄 storage.ts                   # Database operations
│
├── 📂 middleware/                  # Express middleware
│   ├── 📄 auth.ts                  # Authentication middleware
│   ├── 📄 validation.ts            # Request validation
│   ├── 📄 rate-limit.ts            # Rate limiting
│   ├── 📄 cors.ts                  # CORS configuration
│   ├── 📄 error-handler.ts         # Error handling
│   └── 📄 logging.ts               # Request logging
│
├── 📂 services/                    # Business logic services
│   ├── 📄 auth-service.ts          # Authentication service
│   ├── 📄 campaign-service.ts      # Campaign management
│   ├── 📄 user-service.ts          # User management
│   ├── 📄 template-service.ts      # Template service
│   ├── 📄 email-service.ts         # Email sending service
│   ├── 📄 notification-service.ts  # Notification service
│   ├── 📄 analytics-service.ts     # Analytics service
│   ├── 📄 file-service.ts          # File upload service
│   └── 📄 report-service.ts        # Report generation
│
├── 📂 controllers/                 # Route controllers
│   ├── 📄 auth-controller.ts       # Auth endpoints
│   ├── 📄 campaign-controller.ts   # Campaign endpoints
│   ├── 📄 user-controller.ts       # User endpoints
│   ├── 📄 template-controller.ts   # Template endpoints
│   ├── 📄 notification-controller.ts # Notification endpoints
│   └── 📄 report-controller.ts     # Report endpoints
│
├── 📂 models/                      # Data models
│   ├── 📄 User.ts                  # User model
│   ├── 📄 Campaign.ts              # Campaign model
│   ├── 📄 Template.ts              # Template model
│   ├── 📄 Organization.ts          # Organization model
│   └── 📄 Event.ts                 # Event model
│
├── 📂 utils/                       # Utility functions
│   ├── 📄 database.ts              # Database utilities
│   ├── 📄 encryption.ts            # Encryption helpers
│   ├── 📄 validation.ts            # Validation schemas
│   ├── 📄 email-templates.ts       # Email templates
│   ├── 📄 file-upload.ts           # File handling
│   ├── 📄 logger.ts                # Logging utility
│   └── 📄 helpers.ts               # General helpers
│
├── 📂 config/                      # Configuration files
│   ├── 📄 database.ts              # Database configuration
│   ├── 📄 email.ts                 # Email configuration
│   ├── 📄 session.ts               # Session configuration
│   └── 📄 security.ts              # Security configuration
│
└── 📂 types/                       # TypeScript definitions
    ├── 📄 index.ts                 # Main type exports
    ├── 📄 express.ts               # Express extensions
    ├── 📄 database.ts              # Database types
    └── 📄 api.ts                   # API types
```

### Key Backend Files

#### Application Entry Point
```typescript
// app.ts
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import { routes } from './routes';
import { errorHandler } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Route Definitions
```typescript
// routes.ts
import { Router } from 'express';
import { authController } from './controllers/auth-controller';
import { campaignController } from './controllers/campaign-controller';
import { userController } from './controllers/user-controller';
import { authMiddleware } from './middleware/auth';
import { validateInput } from './middleware/validation';

const router = Router();

// Authentication routes
router.post('/auth/login', validateInput(loginSchema), authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authMiddleware, authController.getMe);

// Campaign routes
router.get('/campaigns', authMiddleware, campaignController.list);
router.post('/campaigns', authMiddleware, validateInput(campaignSchema), campaignController.create);
router.get('/campaigns/:id', authMiddleware, campaignController.getById);
router.put('/campaigns/:id', authMiddleware, validateInput(campaignSchema), campaignController.update);
router.delete('/campaigns/:id', authMiddleware, campaignController.delete);

// User routes
router.get('/users', authMiddleware, userController.list);
router.post('/users', authMiddleware, validateInput(userSchema), userController.create);
// ... more routes

export { router as routes };
```

## 🔄 Shared Structure (shared/)

```
shared/
├── 📄 schema.ts                    # Database schema definitions
├── 📄 types.ts                     # Shared TypeScript types
├── 📄 constants.ts                 # Shared constants
├── 📄 validation.ts                # Shared validation schemas
└── 📄 utils.ts                     # Shared utility functions
```

### Database Schema
```typescript
// shared/schema.ts
import { pgTable, serial, varchar, timestamp, integer, text, boolean, jsonb } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }).unique(),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user'),
  department: varchar('department', { length: 255 }),
  position: varchar('position', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  lastLogin: timestamp('last_login'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// ... other table definitions
```

## 📚 Documentation Structure (docs/)

```
docs/
├── 📄 01-Project-Overview.md       # Project overview and goals
├── 📄 02-Technical-Architecture.md # System architecture
├── 📄 03-Technology-Stack.md       # Tech stack details
├── 📄 04-Installation-Setup-Guide.md # Setup instructions
├── 📄 05-File-Structure.md         # This document
├── 📄 06-API-Documentation.md      # API reference
├── 📄 07-User-Manual.md            # User guide
├── 📄 08-Development-Guide.md      # Developer guide
├── 📄 09-Database-Schema.md        # Database documentation
└── 📄 10-Deployment-Guide.md       # Deployment instructions
```

## 🗃️ Database Migrations (migrations/)

```
migrations/
├── 📄 0001_initial_schema.sql      # Initial database setup
├── 📄 0002_add_organizations.sql   # Add organizations table
├── 📄 0003_add_user_fields.sql     # Add user fields
├── 📄 0004_add_notifications.sql   # Add notifications
└── 📄 meta/                        # Migration metadata
    ├── 📄 _journal.json            # Migration journal
    └── 📄 0001_snapshot.json       # Schema snapshots
```

## 🧪 Testing Structure (tests/)

```
tests/
├── 📂 unit/                        # Unit tests
│   ├── 📂 services/                # Service tests
│   ├── 📂 utils/                   # Utility tests
│   └── 📂 components/              # Component tests
│
├── 📂 integration/                 # Integration tests
│   ├── 📄 auth.test.ts            # Auth integration tests
│   ├── 📄 campaigns.test.ts       # Campaign tests
│   └── 📄 users.test.ts           # User tests
│
├── 📂 e2e/                        # End-to-end tests
│   ├── 📄 login.spec.ts           # Login flow tests
│   ├── 📄 campaign-creation.spec.ts # Campaign creation
│   └── 📄 user-management.spec.ts  # User management
│
└── 📂 fixtures/                   # Test data
    ├── 📄 users.json              # User test data
    ├── 📄 campaigns.json          # Campaign test data
    └── 📄 templates.json          # Template test data
```

## 🚀 Scripts Structure (scripts/)

```
scripts/
├── 📄 build.js                    # Build script
├── 📄 deploy.js                   # Deployment script
├── 📄 seed-database.js            # Database seeding
├── 📄 backup-database.js          # Database backup
├── 📄 migrate.js                  # Migration runner
└── 📄 generate-docs.js            # Documentation generator
```

## 🔧 Configuration Files

### Root Configuration Files
```
phisnet/
├── 📄 .gitignore                  # Git ignore patterns
├── 📄 .env.example                # Environment template
├── 📄 .eslintrc.json              # ESLint configuration
├── 📄 .prettierrc                 # Prettier configuration
├── 📄 components.json             # shadcn/ui config
├── 📄 tailwind.config.ts          # Tailwind config
├── 📄 tsconfig.json               # TypeScript config
├── 📄 vite.config.ts              # Vite config
├── 📄 playwright.config.ts        # Playwright config
├── 📄 drizzle.config.ts           # Drizzle ORM config
└── 📄 package.json                # Project dependencies
```

### Important Configuration Examples

#### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@/components/*": ["./client/src/components/*"],
      "@/hooks/*": ["./client/src/hooks/*"],
      "@/services/*": ["./client/src/services/*"],
      "@/utils/*": ["./client/src/utils/*"]
    }
  },
  "include": ["client/src", "shared"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@/components': path.resolve(__dirname, './client/src/components'),
      '@/hooks': path.resolve(__dirname, './client/src/hooks'),
      '@/services': path.resolve(__dirname, './client/src/services'),
      '@/utils': path.resolve(__dirname, './client/src/utils'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

## 📦 File Upload Structure (uploads/)

```
uploads/
├── 📂 avatars/                    # User profile pictures
├── 📂 templates/                  # Template assets
├── 📂 campaigns/                  # Campaign files
├── 📂 imports/                    # CSV imports
└── 📂 exports/                    # Generated reports
```

## 🔐 Security Considerations

### File Structure Security
1. **Environment Files**: Never commit `.env` files
2. **Uploads Directory**: Validate file types and sizes
3. **Database Files**: Exclude from version control
4. **Log Files**: Rotate and secure log files
5. **Backup Files**: Encrypt and secure backups

### Code Organization Security
1. **Separation of Concerns**: Clear boundaries between layers
2. **Input Validation**: Validate at route and service levels
3. **Error Handling**: Centralized error handling
4. **Logging**: Comprehensive audit trails
5. **Access Control**: Role-based permissions

## 📈 Scalability Considerations

### File Structure Scalability
1. **Modular Architecture**: Easy to add new features
2. **Service Layer**: Business logic isolation
3. **API Versioning**: Future API changes
4. **Database Migrations**: Schema evolution
5. **Asset Management**: CDN-ready structure

### Performance Optimization
1. **Code Splitting**: Route-based splitting
2. **Lazy Loading**: Component lazy loading
3. **Bundle Optimization**: Tree shaking and minification
4. **Caching Strategy**: Static asset caching
5. **Database Indexing**: Optimized queries

---

**Naming Conventions:**
- **Files**: kebab-case for files, PascalCase for React components
- **Directories**: lowercase with hyphens
- **Variables**: camelCase in TypeScript/JavaScript
- **Constants**: UPPER_SNAKE_CASE
- **Database**: snake_case for tables and columns

**Code Organization Principles:**
- **Single Responsibility**: Each file has one clear purpose
- **Dependency Injection**: Services depend on abstractions
- **Layer Separation**: Clear boundaries between layers
- **Type Safety**: Strong typing throughout the application
- **Consistent Structure**: Similar patterns across modules

---

**Document Version:** 1.0
**Last Updated:** July 25, 2025
**Author:** PhishNet Project Team
**Project:** PhishNet Advanced Phishing Simulation Platform
