# PhishNet - API Documentation

## 🌐 API Overview

PhishNet provides a comprehensive RESTful API for managing phishing simulation campaigns, users, templates, and analytics. All API endpoints require authentication except for the login endpoint.

### Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

### Authentication
PhishNet uses session-based authentication with HTTP cookies. After successful login, the session cookie is automatically included in subsequent requests.

### Response Format
All API responses follow a consistent format:

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Additional error details (optional)
  }
}
```

### HTTP Status Codes
- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request data
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `422` - Unprocessable Entity: Validation error
- `500` - Internal Server Error: Server error

## 🔐 Authentication Endpoints

### POST /api/auth/login
Authenticate user and create session.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "organizationId": 1,
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Login successful"
}
```

#### Error Responses
```json
// Invalid credentials
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}

// Account locked
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account is locked due to too many failed login attempts"
  }
}
```

### POST /api/auth/logout
End user session.

#### Response
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /api/auth/me
Get current user information.

#### Headers
```
Cookie: session_id=...
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "organizationId": 1,
      "permissions": ["campaign:create", "campaign:read", "user:manage"],
      "organization": {
        "id": 1,
        "name": "ACME Corp",
        "domain": "acme.com"
      }
    }
  }
}
```

## 🎯 Campaign Endpoints

### GET /api/campaigns
Retrieve all campaigns for the authenticated user's organization.

#### Query Parameters
```
?page=1&limit=20&status=active&search=campaign%20name&sortBy=createdAt&sortOrder=desc
```

#### Response
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": 1,
        "name": "Q1 Security Awareness Campaign",
        "description": "Testing employee awareness for Q1",
        "status": "active",
        "templateId": 5,
        "template": {
          "id": 5,
          "name": "Generic Phishing Template",
          "subject": "Urgent: Verify Your Account"
        },
        "launchDate": "2024-01-15T09:00:00Z",
        "endDate": "2024-01-30T17:00:00Z",
        "targetCount": 150,
        "sentCount": 145,
        "openedCount": 87,
        "clickedCount": 23,
        "submittedCount": 8,
        "createdAt": "2024-01-10T14:30:00Z",
        "createdBy": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### POST /api/campaigns
Create a new campaign.

#### Request Body
```json
{
  "name": "New Security Test Campaign",
  "description": "Testing new employees",
  "templateId": 3,
  "groupIds": [1, 2, 3],
  "launchDate": "2024-02-01T09:00:00Z",
  "endDate": "2024-02-15T17:00:00Z",
  "sendingProfile": {
    "fromName": "IT Security",
    "fromEmail": "security@company.com",
    "smtpId": 1
  },
  "landingPage": {
    "redirectUrl": "https://company.com/security-training",
    "captureCredentials": true,
    "captureData": true
  },
  "settings": {
    "trackClicks": true,
    "trackOpens": true,
    "sendReport": true
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 15,
      "name": "New Security Test Campaign",
      "status": "draft",
      "targetCount": 45,
      "createdAt": "2024-01-20T15:45:00Z"
    }
  },
  "message": "Campaign created successfully"
}
```

### GET /api/campaigns/:id
Get campaign details by ID.

#### Response
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "name": "Q1 Security Awareness Campaign",
      "description": "Testing employee awareness for Q1",
      "status": "active",
      "template": {
        "id": 5,
        "name": "Generic Phishing Template",
        "subject": "Urgent: Verify Your Account",
        "htmlContent": "<html>...</html>",
        "textContent": "Plain text version..."
      },
      "groups": [
        {
          "id": 1,
          "name": "Marketing Team",
          "userCount": 25
        }
      ],
      "stats": {
        "totalTargets": 150,
        "emailsSent": 145,
        "emailsOpened": 87,
        "linksClicked": 23,
        "dataSubmitted": 8,
        "reportedByUsers": 5
      },
      "timeline": [
        {
          "event": "campaign_created",
          "timestamp": "2024-01-10T14:30:00Z",
          "user": "John Doe"
        },
        {
          "event": "campaign_launched",
          "timestamp": "2024-01-15T09:00:00Z",
          "user": "John Doe"
        }
      ]
    }
  }
}
```

### PUT /api/campaigns/:id
Update campaign details.

#### Request Body
```json
{
  "name": "Updated Campaign Name",
  "description": "Updated description",
  "endDate": "2024-02-28T17:00:00Z"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "name": "Updated Campaign Name",
      "updatedAt": "2024-01-20T16:00:00Z"
    }
  },
  "message": "Campaign updated successfully"
}
```

### POST /api/campaigns/:id/launch
Launch a campaign.

#### Response
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "status": "active",
      "launchedAt": "2024-01-20T16:15:00Z"
    }
  },
  "message": "Campaign launched successfully"
}
```

### POST /api/campaigns/:id/pause
Pause an active campaign.

#### Response
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "status": "paused",
      "pausedAt": "2024-01-20T16:30:00Z"
    }
  },
  "message": "Campaign paused successfully"
}
```

### DELETE /api/campaigns/:id
Delete a campaign.

#### Response
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

### GET /api/campaigns/:id/results
Get detailed campaign results.

#### Query Parameters
```
?page=1&limit=50&status=clicked&export=csv
```

#### Response
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": 1,
        "user": {
          "id": 25,
          "email": "john.smith@company.com",
          "firstName": "John",
          "lastName": "Smith",
          "department": "Marketing",
          "position": "Manager"
        },
        "status": "clicked",
        "emailSent": true,
        "emailOpened": true,
        "linkClicked": true,
        "dataSubmitted": false,
        "reportedPhishing": false,
        "events": [
          {
            "type": "email_sent",
            "timestamp": "2024-01-15T09:15:00Z"
          },
          {
            "type": "email_opened",
            "timestamp": "2024-01-15T10:30:00Z",
            "details": {
              "ipAddress": "192.168.1.100",
              "userAgent": "Mozilla/5.0..."
            }
          },
          {
            "type": "link_clicked",
            "timestamp": "2024-01-15T10:32:00Z",
            "details": {
              "ipAddress": "192.168.1.100",
              "userAgent": "Mozilla/5.0..."
            }
          }
        ]
      }
    ],
    "summary": {
      "totalTargets": 150,
      "sent": 145,
      "opened": 87,
      "clicked": 23,
      "submitted": 8,
      "reported": 5
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

## 👥 User Management Endpoints

### GET /api/users
Get all users in the organization.

#### Query Parameters
```
?page=1&limit=20&role=user&department=marketing&status=active&search=john
```

#### Response
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "john.doe@company.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "admin",
        "department": "IT",
        "position": "Security Manager",
        "phone": "+1-555-0123",
        "status": "active",
        "lastLogin": "2024-01-20T14:30:00Z",
        "createdAt": "2024-01-01T09:00:00Z",
        "campaignStats": {
          "totalCampaigns": 5,
          "clickedCampaigns": 1,
          "reportedCampaigns": 2
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 245,
      "totalPages": 13
    }
  }
}
```

### POST /api/users
Create a new user.

#### Request Body
```json
{
  "email": "new.user@company.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "user",
  "department": "Marketing",
  "position": "Marketing Specialist",
  "phone": "+1-555-0124",
  "groupIds": [1, 3]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 246,
      "email": "new.user@company.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "status": "active",
      "createdAt": "2024-01-20T16:45:00Z"
    }
  },
  "message": "User created successfully"
}
```

### GET /api/users/:id
Get user details by ID.

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "department": "IT",
      "position": "Security Manager",
      "phone": "+1-555-0123",
      "status": "active",
      "lastLogin": "2024-01-20T14:30:00Z",
      "groups": [
        {
          "id": 1,
          "name": "IT Department"
        }
      ],
      "campaignHistory": [
        {
          "campaignId": 1,
          "campaignName": "Q1 Security Test",
          "status": "reported",
          "timestamp": "2024-01-15T10:30:00Z"
        }
      ]
    }
  }
}
```

### PUT /api/users/:id
Update user information.

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "department": "IT Security",
  "position": "Senior Security Manager",
  "phone": "+1-555-0125"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "department": "IT Security",
      "updatedAt": "2024-01-20T17:00:00Z"
    }
  },
  "message": "User updated successfully"
}
```

### DELETE /api/users/:id
Delete a user.

#### Response
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### POST /api/users/bulk-import
Import users from CSV file.

#### Request Body (multipart/form-data)
```
file: users.csv
```

#### CSV Format
```csv
email,firstName,lastName,department,position,phone
john.doe@company.com,John,Doe,IT,Manager,+1-555-0123
jane.smith@company.com,Jane,Smith,Marketing,Specialist,+1-555-0124
```

#### Response
```json
{
  "success": true,
  "data": {
    "imported": 45,
    "failed": 2,
    "errors": [
      {
        "row": 15,
        "email": "invalid-email",
        "error": "Invalid email format"
      }
    ]
  },
  "message": "Bulk import completed"
}
```

## 📧 Template Endpoints

### GET /api/templates
Get all email templates.

#### Query Parameters
```
?page=1&limit=20&category=phishing&difficulty=medium&search=banking
```

#### Response
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": 1,
        "name": "Banking Phishing Template",
        "subject": "Urgent: Verify Your Account",
        "category": "banking",
        "difficulty": "medium",
        "language": "en",
        "isActive": true,
        "usage": {
          "totalCampaigns": 15,
          "successRate": 0.23
        },
        "createdAt": "2024-01-01T09:00:00Z",
        "updatedAt": "2024-01-10T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

### POST /api/templates
Create a new email template.

#### Request Body
```json
{
  "name": "New Phishing Template",
  "subject": "Action Required: Update Your Information",
  "category": "general",
  "difficulty": "easy",
  "language": "en",
  "htmlContent": "<html><body>...</body></html>",
  "textContent": "Plain text version of the email...",
  "tags": ["urgent", "account", "verification"]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "template": {
      "id": 26,
      "name": "New Phishing Template",
      "subject": "Action Required: Update Your Information",
      "createdAt": "2024-01-20T18:00:00Z"
    }
  },
  "message": "Template created successfully"
}
```

### GET /api/templates/:id
Get template details by ID.

#### Response
```json
{
  "success": true,
  "data": {
    "template": {
      "id": 1,
      "name": "Banking Phishing Template",
      "subject": "Urgent: Verify Your Account",
      "category": "banking",
      "difficulty": "medium",
      "language": "en",
      "htmlContent": "<html><body>...</body></html>",
      "textContent": "Plain text version...",
      "tags": ["banking", "urgent", "verification"],
      "attachments": [
        {
          "id": 1,
          "filename": "account_statement.pdf",
          "size": 245760,
          "mimetype": "application/pdf"
        }
      ],
      "usage": {
        "totalCampaigns": 15,
        "successRate": 0.23,
        "recentCampaigns": [
          {
            "id": 1,
            "name": "Q1 Banking Test",
            "launchDate": "2024-01-15T09:00:00Z"
          }
        ]
      }
    }
  }
}
```

### PUT /api/templates/:id
Update template details.

#### Request Body
```json
{
  "name": "Updated Template Name",
  "subject": "Updated Subject Line",
  "htmlContent": "<html><body>Updated content...</body></html>",
  "textContent": "Updated plain text content..."
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "template": {
      "id": 1,
      "name": "Updated Template Name",
      "updatedAt": "2024-01-20T18:15:00Z"
    }
  },
  "message": "Template updated successfully"
}
```

### DELETE /api/templates/:id
Delete a template.

#### Response
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

## 🏢 Group Management Endpoints

### GET /api/groups
Get all user groups.

#### Response
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": 1,
        "name": "Marketing Department",
        "description": "All marketing team members",
        "userCount": 25,
        "createdAt": "2024-01-01T09:00:00Z"
      }
    ]
  }
}
```

### POST /api/groups
Create a new group.

#### Request Body
```json
{
  "name": "Sales Team",
  "description": "Sales department members",
  "userIds": [1, 2, 3, 4, 5]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "group": {
      "id": 5,
      "name": "Sales Team",
      "userCount": 5,
      "createdAt": "2024-01-20T19:00:00Z"
    }
  },
  "message": "Group created successfully"
}
```

## 📊 Analytics & Reporting Endpoints

### GET /api/analytics/dashboard
Get dashboard analytics data.

#### Query Parameters
```
?timeRange=30d&organizationId={organizationId}
```

#### Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCampaigns": 25,
      "activeCampaigns": 3,
      "totalUsers": 450,
      "totalEmailsSent": 12500,
      "averageClickRate": 0.18,
      "averageOpenRate": 0.65
    },
    "recentActivity": [
      {
        "type": "campaign_launched",
        "campaignName": "Q1 Security Test",
        "timestamp": "2024-01-20T09:00:00Z",
        "user": "John Doe"
      }
    ],
    "clickRateTrend": [
      {
        "date": "2024-01-01",
        "clickRate": 0.25
      },
      {
        "date": "2024-01-02",
        "clickRate": 0.22
      }
    ],
    "topRiskyUsers": [
      {
        "userId": 123,
        "name": "Jane Smith",
        "department": "Finance",
        "riskScore": 0.85,
        "failedCampaigns": 4
      }
    ]
  }
}
```

### GET /api/analytics/campaigns/:id
Get detailed campaign analytics.

#### Response
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "name": "Q1 Security Test",
      "stats": {
        "totalTargets": 150,
        "emailsSent": 145,
        "emailsOpened": 87,
        "linksClicked": 23,
        "dataSubmitted": 8,
        "reportedByUsers": 5
      },
      "timeline": [
        {
          "timestamp": "2024-01-15T09:00:00Z",
          "event": "emails_sent",
          "count": 145
        }
      ],
      "geographicData": [
        {
          "country": "United States",
          "clicks": 15
        }
      ],
      "deviceData": [
        {
          "device": "Desktop",
          "clicks": 18
        },
        {
          "device": "Mobile",
          "clicks": 5
        }
      ]
    }
  }
}
```

### POST /api/reports/generate
Generate a custom report.

#### Request Body
```json
{
  "type": "campaign_summary",
  "campaignIds": [1, 2, 3],
  "dateRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "format": "pdf",
  "includeUserDetails": true,
  "includeCharts": true
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "reportId": "report_12345",
    "downloadUrl": "/api/reports/download/report_12345",
    "generatedAt": "2024-01-20T20:00:00Z",
    "expiresAt": "2024-01-27T20:00:00Z"
  },
  "message": "Report generation started"
}
```

## 🔔 Notification Endpoints

### GET /api/notifications
Get notifications for the current user.

#### Query Parameters
```
?page=1&limit=20&unreadOnly=true&type=campaign
```

#### Response
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "campaign_completed",
        "title": "Campaign Completed",
        "message": "Your campaign 'Q1 Security Test' has completed",
        "data": {
          "campaignId": 1,
          "campaignName": "Q1 Security Test"
        },
        "isRead": false,
        "createdAt": "2024-01-20T16:30:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### PUT /api/notifications/:id/read
Mark notification as read.

#### Response
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### PUT /api/notifications/read-all
Mark all notifications as read.

#### Response
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

## 🔧 System Configuration Endpoints

### GET /api/config/smtp
Get SMTP configuration profiles.

#### Response
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": 1,
        "name": "Primary SMTP",
        "host": "smtp.company.com",
        "port": 587,
        "username": "noreply@company.com",
        "isDefault": true,
        "isActive": true
      }
    ]
  }
}
```

### POST /api/config/smtp
Create SMTP profile.

#### Request Body
```json
{
  "name": "Backup SMTP",
  "host": "smtp.backup.com",
  "port": 587,
  "username": "backup@company.com",
  "password": "smtp_password",
  "encryption": "tls"
}
```

## 🚨 Error Handling

### Common Error Codes

#### Authentication Errors
- `INVALID_CREDENTIALS` - Wrong email/password
- `ACCOUNT_LOCKED` - Too many failed attempts
- `SESSION_EXPIRED` - Session timeout
- `INSUFFICIENT_PERMISSIONS` - Access denied

#### Validation Errors
- `VALIDATION_ERROR` - Request validation failed
- `MISSING_REQUIRED_FIELD` - Required field missing
- `INVALID_EMAIL_FORMAT` - Email format invalid
- `PASSWORD_TOO_WEAK` - Password requirements not met

#### Resource Errors
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RESOURCE_CONFLICT` - Resource already exists
- `RESOURCE_IN_USE` - Cannot delete, resource in use

#### System Errors
- `DATABASE_ERROR` - Database operation failed
- `FILE_UPLOAD_ERROR` - File upload failed
- `EMAIL_SEND_ERROR` - Email sending failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

### Error Response Examples

#### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "password": "Password must be at least 8 characters"
      }
    }
  }
}
```

#### Rate Limit Error
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 900,
      "limit": 100,
      "remaining": 0
    }
  }
}
```

## 📝 Request/Response Examples

### Complete Campaign Creation Flow

#### 1. Create Campaign
```bash
POST /api/campaigns
Content-Type: application/json
Cookie: session_id=...

{
  "name": "New Security Training",
  "templateId": 3,
  "groupIds": [1, 2]
}
```

#### 2. Launch Campaign
```bash
POST /api/campaigns/15/launch
Cookie: session_id=...
```

#### 3. Monitor Progress
```bash
GET /api/campaigns/15
Cookie: session_id=...
```

#### 4. Get Results
```bash
GET /api/campaigns/15/results?page=1&limit=50
Cookie: session_id=...
```

### Bulk User Import
```bash
POST /api/users/bulk-import
Content-Type: multipart/form-data
Cookie: session_id=...

[CSV file with user data]
```

## 🔐 Security Considerations

### API Security Features
1. **Session-based Authentication**: Secure session management
2. **CSRF Protection**: Cross-site request forgery prevention
3. **Rate Limiting**: Prevent abuse and DoS attacks
4. **Input Validation**: Comprehensive request validation
5. **SQL Injection Prevention**: Parameterized queries
6. **XSS Protection**: Output encoding and CSP headers

### Best Practices
1. **Always use HTTPS** in production
2. **Validate all inputs** on both client and server
3. **Handle errors gracefully** without exposing sensitive data
4. **Implement proper logging** for audit trails
5. **Use strong session management** with secure cookies
6. **Implement rate limiting** for all endpoints

---

**Document Version:** 1.0
**Last Updated:** July 25, 2025
**Author:** PhishNet Project Team
**Project:** PhishNet Advanced Phishing Simulation Platform
