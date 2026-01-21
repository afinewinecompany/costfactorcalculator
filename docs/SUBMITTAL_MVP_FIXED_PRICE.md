# Project Submittal
## Connected Cost Factor Calculator - MVP Development

---

**Submitted To:** Connected
**Submitted By:** [Your Name / Company]
**Date:** January 7, 2026
**Valid Until:** February 7, 2026
**Document #:** CCFC-2026-001

---

## 1. Project Overview

### 1.1 Project Description

Development of a production-ready **Cost Factor Calculator** web application for Connected's internal use. This tool will enable the Business Development team to generate preliminary budget estimates for corporate interior fitout projects by adjusting cost factors across multiple categories including construction, FF&E, technology, signage, and design fees.

### 1.2 Business Objective

Provide Connected's Business Development team with a standardized, efficient tool to:

- Generate preliminary budget estimates during early client conversations
- Adjust cost projections in real-time based on project-specific factors
- **Present polished, client-ready budget presentations** during sales meetings
- Accelerate the sales cycle with on-the-spot pricing guidance
- Improve win rates with accurate, consistent preliminary budgets
- Share presentation links with prospective clients for follow-up

---

## 2. Scope of Work

### 2.1 Included in This Engagement

| Deliverable | Description |
|-------------|-------------|
| **Production Deployment** | Deploy application to Vercel (frontend) and AWS RDS (database) with proper environment configuration, SSL, and domain setup |
| **User Authentication** | Secure login system for Connected employees using industry-standard practices (session-based auth with encrypted passwords) |
| **Project Persistence** | Save, load, update, and delete project estimates with full database integration |
| **PDF Export** | Generate downloadable PDF reports from the client presentation view |
| **Security Hardening** | Input validation, CSRF protection, rate limiting, secure headers, and CORS configuration |
| **Error Handling** | Production-grade error boundaries, user-friendly error messages, and server-side logging |
| **Core Testing** | Unit tests for calculation engine to ensure accuracy |
| **Documentation** | User guide and technical documentation for administrators |
| **30-Day Warranty** | Bug fixes for defects discovered within 30 days of delivery |

### 2.2 Excluded from This Engagement

The following items are **not included** in this fixed-price engagement but may be added as change orders or future phases:

- Multi-tenant / role-based access (admin, estimator, viewer roles)
- Project templates and version history
- Advanced analytics dashboard
- API integrations with external systems (CRM, accounting)
- Mobile app development
- Custom branding / white-labeling
- Training sessions (available as add-on)
- Ongoing maintenance beyond 30-day warranty

### 2.3 Deliverables Checklist

| # | Deliverable | Format |
|---|-------------|--------|
| 1 | Production application URL | Live web application |
| 2 | Admin credentials | Secure credential transfer |
| 3 | Source code | GitHub repository access |
| 4 | User documentation | PDF / Markdown |
| 5 | Technical documentation | Markdown in repository |
| 6 | Database backup procedure | Documented process |

---

## 3. Technical Specifications

### 3.1 Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend** | React 19 + TypeScript | Modern, maintainable, type-safe |
| **Styling** | Tailwind CSS 4 | Rapid development, consistent design |
| **Backend** | Express.js + Node.js | Lightweight, scalable API |
| **Database** | PostgreSQL 16 | Reliable, industry-standard RDBMS |
| **ORM** | Drizzle | Type-safe database queries |
| **Hosting** | Vercel | Zero-config deployment, global CDN |
| **Database Hosting** | AWS RDS | Managed PostgreSQL, automated backups |

### 3.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION ENVIRONMENT                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌─────────────┐                    ┌─────────────────┐   │
│    │   VERCEL    │                    │    AWS RDS      │   │
│    │             │                    │                 │   │
│    │  React App  │◄──── HTTPS ───────►│  PostgreSQL     │   │
│    │  + Express  │                    │  (Encrypted)    │   │
│    │  API        │                    │                 │   │
│    └─────────────┘                    └─────────────────┘   │
│          │                                    │              │
│          │                                    │              │
│    ┌─────▼─────┐                    ┌────────▼────────┐    │
│    │  Vercel   │                    │  Automated      │    │
│    │  CDN      │                    │  Daily Backups  │    │
│    │  (Global) │                    │  (7-day retain) │    │
│    └───────────┘                    └─────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Security Measures

| Category | Implementation |
|----------|----------------|
| **Authentication** | Bcrypt password hashing, secure session tokens |
| **Data in Transit** | HTTPS/TLS encryption (enforced) |
| **Data at Rest** | AWS RDS encryption enabled |
| **Input Validation** | Server-side validation with Zod schemas |
| **Session Management** | HTTP-only cookies, secure flag, expiration |
| **Headers** | Helmet.js security headers (CSP, X-Frame, etc.) |
| **Rate Limiting** | API rate limiting to prevent abuse |

---

## 4. Pricing

### 4.1 Fixed Price

| Description | Amount |
|-------------|--------|
| **MVP Development (Complete)** | **$5,500.00** |

This fixed price includes all items listed in Section 2.1 "Included in This Engagement."

### 4.2 Payment Schedule

| Milestone | Amount | Due |
|-----------|--------|-----|
| **Deposit** | $2,750.00 (50%) | Upon contract signing |
| **Final Payment** | $2,750.00 (50%) | Upon delivery & acceptance |

### 4.3 Payment Terms

- Invoices are due **Net 15** from invoice date
- Accepted payment methods: ACH transfer, check, or credit card (+3% processing fee)
- Work will not commence until deposit is received
- Final deliverables released upon receipt of final payment

### 4.4 What's Included in the Price

| Item | Included |
|------|----------|
| Development labor (40-50 hours estimated) | Yes |
| Infrastructure setup and configuration | Yes |
| Code repository setup | Yes |
| Documentation | Yes |
| 30-day bug fix warranty | Yes |
| Project management & communication | Yes |

### 4.5 What's NOT Included in the Price

| Item | Notes |
|------|-------|
| Monthly infrastructure costs | ~$55/month (client responsibility) |
| Domain registration | If custom domain needed |
| Ongoing maintenance | Available via retainer |
| Feature additions | Change order required |
| Training sessions | $150/hour if requested |

---

## 5. Infrastructure Costs (Client Responsibility)

The following recurring costs will be billed directly to Connected by the service providers:

| Service | Provider | Estimated Monthly Cost |
|---------|----------|------------------------|
| Vercel Pro | Vercel | $20/month |
| AWS RDS PostgreSQL | Amazon Web Services | $20-25/month |
| AWS Backups & Monitoring | Amazon Web Services | $10-15/month |
| **Total Estimated** | | **$50-60/month** |

*Note: First month infrastructure will be set up during development. I will assist with account creation and configuration as part of the engagement.*

---

## 6. Timeline

### 6.1 Estimated Schedule

| Week | Phase | Deliverables |
|------|-------|--------------|
| **Week 1** | Setup & Auth | Production environment, user authentication system |
| **Week 2** | Persistence | Database schema, save/load projects, API endpoints |
| **Week 3** | Features | PDF export, security hardening |
| **Week 4** | Polish | Testing, documentation, bug fixes |
| **Week 5** | Delivery | UAT, final adjustments, handoff |

**Total Duration: 4-5 weeks** from deposit receipt

### 6.2 Schedule Assumptions

- Part-time engagement (~10-15 hours/week)
- Timely client feedback on UAT (within 3 business days)
- No major scope changes during development
- Infrastructure accounts created promptly

### 6.3 Milestones

| Milestone | Target | Acceptance Criteria |
|-----------|--------|---------------------|
| M1: Environment Ready | Week 1 | App deployed to staging URL |
| M2: Auth Complete | Week 1 | Users can register/login |
| M3: Persistence Complete | Week 2 | Projects save/load correctly |
| M4: PDF Export | Week 3 | PDF downloads work |
| M5: Security Review | Week 4 | All security measures in place |
| M6: Final Delivery | Week 5 | All acceptance criteria met |

---

## 7. Acceptance Criteria

The project will be considered complete when the following criteria are met:

### 7.1 Functional Requirements

- [ ] Users can register and log in securely
- [ ] Users can create new project estimates
- [ ] Users can save projects to the database
- [ ] Users can load and edit saved projects
- [ ] Users can delete projects
- [ ] All sliders adjust cost calculations correctly
- [ ] Client presentation view displays accurate data
- [ ] PDF export generates correctly formatted reports
- [ ] Shareable links work correctly

### 7.2 Non-Functional Requirements

- [ ] Application loads in under 3 seconds
- [ ] Application works in Chrome, Firefox, Safari, Edge
- [ ] All forms validate input before submission
- [ ] Error messages are user-friendly
- [ ] Application is accessible via HTTPS only
- [ ] Database backups are configured

### 7.3 Documentation Requirements

- [ ] User guide delivered
- [ ] Technical documentation in repository
- [ ] Environment variables documented
- [ ] Deployment process documented

---

## 8. Terms & Conditions

### 8.1 Change Orders

Any work outside the scope defined in Section 2.1 requires a written change order. Change orders will be quoted at **$125/hour** and must be approved before work begins.

### 8.2 Warranty

A **30-day warranty** period begins upon final delivery. During this period, defects (bugs where functionality does not meet the acceptance criteria) will be fixed at no additional charge. This warranty does not cover:
- New feature requests
- Changes to requirements
- Issues caused by client modifications
- Third-party service outages

### 8.3 Intellectual Property

Upon receipt of final payment, Connected will own all rights to the custom code developed for this project. Third-party libraries remain under their respective open-source licenses (MIT, Apache, etc.).

### 8.4 Confidentiality

All project information, business data, and proprietary methods will be kept confidential. Source code will not be shared or reused for other clients.

### 8.5 Limitation of Liability

Total liability is limited to the amount paid under this agreement. Neither party is liable for indirect, incidental, or consequential damages.

---

## 9. Ongoing Support Options

After the 30-day warranty period, the following support options are available:

| Plan | Hours/Month | Monthly Rate | Response Time |
|------|-------------|--------------|---------------|
| **Basic** | 4 hours | $400/month | 48 hours |
| **Standard** | 8 hours | $800/month | 24 hours |
| **Premium** | 16 hours | $1,500/month | 4 hours |

Support retainers include:
- Bug fixes and troubleshooting
- Minor enhancements and updates
- Security patches
- Infrastructure monitoring
- Priority support access

*Unused hours do not roll over. Hours beyond allocation billed at $125/hour.*

---

## 10. Authorization

By signing below, both parties agree to the terms outlined in this submittal.

### Client Authorization

| | |
|---|---|
| **Company:** | Connected |
| **Authorized Representative:** | _________________________________ |
| **Title:** | _________________________________ |
| **Signature:** | _________________________________ |
| **Date:** | _________________________________ |

### Consultant Authorization

| | |
|---|---|
| **Company:** | [Your Company Name] |
| **Authorized Representative:** | [Your Name] |
| **Title:** | Product Manager / Developer |
| **Signature:** | _________________________________ |
| **Date:** | _________________________________ |

---

## 11. Contact Information

### Consultant

| | |
|---|---|
| **Name:** | [Your Name] |
| **Email:** | [your.email@example.com] |
| **Phone:** | [Your Phone Number] |

### Client

| | |
|---|---|
| **Company:** | Connected |
| **Primary Contact:** | [Client Contact Name] |
| **Email:** | [client@connected.com] |
| **Phone:** | [Client Phone] |

---

## Appendix A: Feature Specifications

### A.1 User Authentication

| Feature | Specification |
|---------|---------------|
| Registration | Email + password with validation |
| Login | Email + password with session creation |
| Logout | Session destruction, redirect to login |
| Session Duration | 24 hours, sliding expiration |
| Password Requirements | Minimum 8 characters |

### A.2 Project Management

| Feature | Specification |
|---------|---------------|
| Create Project | New project with default values |
| Save Project | Persist all inputs, sliders, base values |
| Load Project | Restore complete project state |
| Update Project | Modify and save changes |
| Delete Project | Soft delete with confirmation |
| List Projects | User's projects with name, date, size |

### A.3 PDF Export

| Feature | Specification |
|---------|---------------|
| Content | Full presentation view |
| Format | Letter size, portrait |
| Includes | Project details, cost breakdown, chart, summary |
| Filename | `{ProjectName}_Estimate_{Date}.pdf` |

---

## Appendix B: Assumptions & Dependencies

### Assumptions

1. Client will provide timely feedback during UAT (within 3 business days)
2. Client will create/provide AWS and Vercel accounts for deployment
3. No changes to core calculation logic are required
4. Single-user or small team usage (< 20 concurrent users)
5. English language only

### Dependencies

1. Vercel account with Pro plan activated
2. AWS account with RDS access
3. Client availability for acceptance testing
4. Stable internet connection for deployment

---

*This submittal supersedes all previous proposals and is valid for 30 days from the date above.*
