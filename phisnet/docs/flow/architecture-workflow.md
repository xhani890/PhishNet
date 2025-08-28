# PhishNet Architecture & Workflow Documentation

## 📊 Complete Application Architecture

### System Overview
PhishNet is a comprehensive phishing simulation platform designed to help organizations test and improve their cybersecurity awareness through controlled phishing campaigns.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────┐    ┌────────────┐    ┌─────────────┐    ┌─────────────────┐     │
│  │ Dashboard │    │ Campaign   │    │ Template    │    │ Analytics &     │     │
│  │ UI        │    │ Management │    │ Editor      │    │ Reporting       │     │
│  └───────────┘    └────────────┘    └─────────────┘    └─────────────────┘     │
│          │              │                 │                    │               │
│          └──────────────┴─────────────────┴────────────────────┘               │
│                                   │                                            │
│                     React + Vite + TailwindCSS Frontend                        │
└────────────────────────────┬────────────────────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS API Requests (RESTful + WebSocket)
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MIDDLEWARE LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │ Rate Limiter │   │ CORS Handler │   │ Auth Guard   │   │ Request Logger  │  │
│  └──────────────┘   └──────────────┘   └──────────────┘   └─────────────────┘  │
└────────────────────────────┬────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             SERVER LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────┐    ┌────────────┐    ┌─────────────┐    ┌─────────────────┐     │
│  │ Auth      │    │ Campaign   │    │ Email       │    │ Analytics       │     │
│  │ Service   │◄──►│ Service    │◄──►│ Service     │◄──►│ Service         │     │
│  └───────────┘    └────────────┘    └─────────────┘    └─────────────────┘     │
│          │                │                │                      │            │
│          ▼                ▼                ▼                      ▼            │
│  ┌───────────┐    ┌────────────┐    ┌─────────────┐    ┌─────────────────┐     │
│  │ User Mgmt │    │ Template   │    │ SMTP        │    │ Reporting       │     │
│  │ Service   │    │ Service    │    │ Handler     │    │ Service         │     │
│  └───────────┘    └────────────┘    └─────────────┘    └─────────────────┘     │
│                                                                                │
│                     Express/Node.js + TypeScript API Layer                     │
└────────────────────────────┬────────────────────────────────────────────────────┘
                             │
                             │ Database Operations (Drizzle ORM)
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐       │
│  │                         PostgreSQL Database                          │       │
│  │                                                                      │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌────────────┐ ┌────────────────┐  │       │
│  │  │ Users &     │ │ Campaigns & │ │ Templates  │ │ Analytics &    │  │       │
│  │  │ Roles       │ │ Targets     │ │ & Assets   │ │ Results        │  │       │
│  │  └─────────────┘ └─────────────┘ └────────────┘ └────────────────┘  │       │
│  │                                                                      │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌────────────┐ ┌────────────────┐  │       │
│  │  │ Sessions &  │ │ Organizations│ │ Email      │ │ Audit Logs &   │  │       │
│  │  │ Tokens      │ │ & Groups    │ │ Templates  │ │ Activity       │  │       │
│  │  └─────────────┘ └─────────────┘ └────────────┘ └────────────────┘  │       │
│  └──────────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐      ┌───────────────────┐      ┌─────────────────────────┐ │
│  │ SMTP Server   │      │ Click Tracking    │      │ Landing Pages &         │ │
│  │ • Gmail SMTP  │      │ • Webhook Handler │      │ • Dynamic Templates    │ │
│  │ • Custom SMTP │      │ • Analytics       │      │ • Secure Hosting       │ │
│  │ • SendGrid    │      │ • Real-time Stats │      │ • SSL/TLS Support      │ │
│  └───────────────┘      └───────────────────┘      └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Complete User Journey Flow

```
┌───────────────┐      ┌────────────────┐      ┌─────────────────┐      ┌────────────────┐
│ 1. USER LOGIN │ ───► │ 2. DASHBOARD   │ ───► │ 3. CREATE       │ ───► │ 4. TARGET      │
│ • Username    │      │ • Campaign     │      │ CAMPAIGN        │      │ SELECTION      │
│ • Password    │      │   Overview     │      │ • Name & Desc   │      │ • Import CSV   │
│ • 2FA (opt)   │      │ • Recent Stats │      │ • Schedule      │      │ • Manual Entry │
└───────────────┘      └────────────────┘      └─────────────────┘      └────────────────┘
                                                                                │
                                                                                ▼
┌───────────────┐      ┌────────────────┐      ┌─────────────────┐      ┌────────────────┐
│ 8. REPORTING  │ ◄─── │ 7. MONITORING  │ ◄─── │ 6. EMAIL        │ ◄─── │ 5. TEMPLATE    │
│ • Success Rate│      │ • Real-time    │      │ DELIVERY        │      │ SELECTION      │
│ • Click Rate  │      │   Tracking     │      │ • SMTP Send     │      │ • Pre-built    │
│ • User Scores │      │ • Live Updates │      │ • Delivery      │      │ • Custom       │
│ • Export Data │      │ • Notifications│      │   Status        │      │ • Preview      │
└───────────────┘      └────────────────┘      └─────────────────┘      └────────────────┘
```

## 🗂️ Data Flow Architecture

### 1. Authentication Flow
```
User Input → Frontend Validation → API Request → Auth Service → JWT Generation → Response
    ↓
Database Check → Password Verification → Session Creation → Token Storage
```

### 2. Campaign Creation Flow
```
Campaign Data → Frontend Form → API Validation → Campaign Service → Database Storage
    ↓
Template Association → Target List Processing → Schedule Setup → Queue Creation
```

### 3. Email Delivery Flow
```
Campaign Trigger → Email Service → Template Rendering → SMTP Configuration → Send Queue
    ↓
Delivery Status → Tracking Links → Analytics Collection → Database Update
```

### 4. Analytics & Reporting Flow
```
User Interaction → Click Tracking → Event Processing → Data Aggregation → Report Generation
    ↓
Real-time Updates → Dashboard Refresh → Notification System → Export Options
```

## 🏗️ Technical Architecture Details

### Frontend Components (React + TypeScript)
```typescript
// Component Structure
src/
├── components/
│   ├── Dashboard/
│   │   ├── OverviewCards.tsx
│   │   ├── RecentCampaigns.tsx
│   │   └── QuickStats.tsx
│   ├── Campaigns/
│   │   ├── CampaignForm.tsx
│   │   ├── CampaignList.tsx
│   │   └── CampaignDetails.tsx
│   ├── Templates/
│   │   ├── TemplateEditor.tsx
│   │   ├── TemplatePreview.tsx
│   │   └── TemplateLibrary.tsx
│   └── Analytics/
│       ├── ChartComponents.tsx
│       ├── ReportGenerator.tsx
│       └── DataExporter.tsx
```

### Backend Services (Node.js + Express)
```typescript
// Service Architecture
server/
├── auth/
│   ├── authController.ts
│   ├── authService.ts
│   └── authMiddleware.ts
├── campaigns/
│   ├── campaignController.ts
│   ├── campaignService.ts
│   └── campaignValidator.ts
├── email/
│   ├── emailController.ts
│   ├── emailService.ts
│   └── smtpConfig.ts
└── analytics/
    ├── analyticsController.ts
    ├── analyticsService.ts
    └── reportGenerator.ts
```

### Database Schema (PostgreSQL)
```sql
-- Core Tables
users (id, email, password_hash, role, created_at)
organizations (id, name, domain, settings, created_at)
campaigns (id, name, description, status, scheduled_at, created_by)
templates (id, name, type, content, metadata, created_by)
targets (id, campaign_id, email, first_name, last_name, status)
results (id, target_id, event_type, timestamp, metadata)
```

## 🚀 Git Workflow & Branching Strategy

### Branch Structure
```
main (production-ready)
├── develop (integration branch)
│   ├── feature/dashboard-redesign
│   ├── feature/email-templates
│   ├── feature/analytics-dashboard
│   └── feature/user-management
├── release/v1.2.0 (release preparation)
└── hotfix/security-patch (emergency fixes)
```

### Development Workflow
1. **Feature Development**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature-name
   # Development work
   git commit -m "feat: add new feature"
   git push origin feature/new-feature-name
   # Create Pull Request to develop
   ```

2. **Code Review Process**
   - Minimum 2 reviewers required
   - Automated tests must pass
   - Security scan must pass
   - Documentation updated

3. **Release Process**
   ```bash
   git checkout develop
   git checkout -b release/v1.2.0
   # Version bump, final testing
   git checkout main
   git merge release/v1.2.0
   git tag v1.2.0
   git push origin main --tags
   ```

## 🔐 Security Architecture

### Security Layers
1. **Frontend Security**
   - Input validation
   - XSS protection
   - CSRF tokens
   - Secure storage

2. **API Security**
   - JWT authentication
   - Rate limiting
   - Input sanitization
   - SQL injection prevention

3. **Database Security**
   - Encrypted connections
   - Row-level security
   - Audit logging
   - Backup encryption

4. **Infrastructure Security**
   - HTTPS enforcement
   - Environment isolation
   - Secrets management
   - Network security

## 📊 Performance Optimization

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies

### Backend Optimization
- Database indexing
- Query optimization
- Connection pooling
- Response caching

### Monitoring & Observability
- Application performance monitoring
- Error tracking and logging
- Real-time metrics
- Health checks

## 🚀 Deployment Architecture

### Development Environment (Updated)
Native local services only (former devcontainer variant removed Aug 2025).

### Production Environment (Updated)
Deployment recommendations (post-container removal):
1. Native systemd units for app, PostgreSQL, Redis
2. Reverse proxy (Nginx/Traefik) configured manually
3. Managed DB (RDS) optional; update DATABASE_URL accordingly

## 📈 Scalability Considerations

### Horizontal Scaling
- Load balancer configuration
- Database read replicas
- Microservices architecture
- Container orchestration

### Vertical Scaling
- Resource monitoring
- Auto-scaling policies
- Performance tuning
- Capacity planning

This comprehensive architecture documentation provides a complete overview of PhishNet's system design, workflows, and technical implementation details.
