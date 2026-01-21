# Technical Business Case
## Connected Cost Factor Calculator

**Prepared For:** Connected
**Prepared By:** [Your Name]
**Date:** January 2026
**Document Version:** 1.0

---

## Executive Summary

This document outlines the costs, scope, and investment required to build and maintain the **Connected Cost Factor Calculator** - a production-ready internal tool for estimating construction costs for corporate interior fitout projects.

| Metric | Value |
|--------|-------|
| **MVP Development Cost** | $4,800 - $7,200 |
| **Full Vision Development Cost** | $14,400 - $24,000 |
| **Monthly Infrastructure (Production)** | $45 - $85/month |
| **Monthly Maintenance Retainer** | $400 - $800/month |
| **Recommended PM/Developer Rate** | $120 - $150/hour |

---

## 1. Product Overview

### 1.1 What It Does

The Cost Factor Calculator is a Business Development tool for design-build construction firms that:

- Calculates preliminary budget estimates for corporate interior fitouts during sales conversations
- Adjusts costs based on 15+ configurable factors (program requirements, finishes, technology, etc.)
- Accounts for project size, floor count, and geographic location
- **Generates polished, client-ready presentation reports** for sales meetings and follow-ups
- Provides real-time cost projections as parameters change
- Enables shareable links to send budget presentations to prospective clients

### 1.2 Current State

| Aspect | Status |
|--------|--------|
| Frontend | React 19 + TypeScript + Tailwind CSS |
| Backend | Express.js + Node.js |
| Database | PostgreSQL (Drizzle ORM) |
| UI Components | Radix UI + shadcn/ui |
| Charts | Recharts |
| State Management | URL-based (shareable presentations) |
| Development Hours Invested | ~2 hours |

### 1.3 Key Features (Current MVP)

- **Project Input Configuration**: Name, RSF, floors, location
- **Base Cost Settings**: Adjustable per-RSF rates for 7 cost categories
- **Factor Sliders**: 15 adjustable criteria across 6 categories
- **Real-time Calculations**: Instant cost projections
- **Client Presentation Mode**: Clean, printable reports
- **Shareable Links**: URL-encoded state for sharing estimates

---

## 2. Scope Definition

### 2.1 MVP Scope (Phase 1)

**Goal:** Production-ready internal tool for Connected estimators

| Feature | Description | Est. Hours |
|---------|-------------|------------|
| Production Deployment | Vercel + AWS RDS setup, environment config | 4-6 |
| User Authentication | Login system for Connected employees | 6-8 |
| Project Persistence | Save/load projects to database | 8-10 |
| PDF Export | Generate downloadable PDF reports | 4-6 |
| Error Handling | Production-grade error boundaries, logging | 3-4 |
| Security Hardening | Input validation, rate limiting, CORS | 4-6 |
| Testing | Core calculation logic tests | 4-6 |
| Documentation | User guide, admin documentation | 3-4 |

**MVP Total: 36-50 hours**

### 2.2 Full Vision Scope (Phase 2+)

| Feature | Description | Est. Hours |
|---------|-------------|------------|
| Multi-tenancy | Multiple user roles (admin, estimator, viewer) | 12-16 |
| Project Templates | Save/reuse common project configurations | 8-10 |
| Version History | Track changes to estimates over time | 10-14 |
| Comparison View | Side-by-side project comparisons | 8-12 |
| Advanced Analytics | Dashboard with historical data, trends | 16-24 |
| Custom Branding | White-label presentation mode | 6-8 |
| API Integration | Connect to external systems (CRM, accounting) | 12-20 |
| Mobile Optimization | Responsive design improvements | 8-12 |
| Audit Logging | Track who changed what and when | 6-8 |
| Bulk Operations | Import/export multiple projects | 8-12 |

**Full Vision Total: 94-136 additional hours**

---

## 3. Infrastructure Costs

### 3.1 Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      PRODUCTION                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────────┐         ┌──────────────────────┐     │
│   │   Vercel     │         │    AWS RDS           │     │
│   │   (Frontend) │◄───────►│    (PostgreSQL)      │     │
│   │   + API      │         │                      │     │
│   └──────────────┘         └──────────────────────┘     │
│         │                                                │
│         ▼                                                │
│   ┌──────────────┐                                      │
│   │   Vercel     │                                      │
│   │   Analytics  │                                      │
│   └──────────────┘                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Monthly Infrastructure Costs

| Service | Tier | Monthly Cost | Notes |
|---------|------|--------------|-------|
| **Vercel Pro** | Pro Plan | $20/month | 1TB bandwidth, serverless functions |
| **AWS RDS PostgreSQL** | db.t3.micro | $15-20/month | 20GB storage, single-AZ |
| **AWS RDS Backups** | Automated | $5-10/month | Point-in-time recovery |
| **Domain (annual)** | Custom domain | ~$1/month | If needed |
| **Monitoring** | Basic CloudWatch | $5-10/month | Alerts, metrics |
| **SSL/Security** | Included | $0 | Via Vercel |

**Low Usage Total: ~$45/month**
**Medium Usage Total: ~$65/month**
**High Usage Total: ~$85/month**

### 3.3 Scaling Considerations

| Users | Bandwidth | RDS Instance | Est. Monthly |
|-------|-----------|--------------|--------------|
| 1-10 | < 100GB | db.t3.micro | $45-55 |
| 10-50 | 100-500GB | db.t3.small | $65-85 |
| 50-200 | 500GB-1TB | db.t3.medium | $120-160 |
| 200+ | > 1TB | db.t3.large + Multi-AZ | $250+ |

---

## 4. Pricing & Rate Justification

### 4.1 Market Rate Analysis

Based on 2025-2026 market data for Product Managers / Technical Consultants:

| Role Level | National Average | Northeast Premium | Construction Tech |
|------------|------------------|-------------------|-------------------|
| Associate PM | $38/hr | $45-55/hr | $50-65/hr |
| Product Manager | $72/hr | $85-100/hr | $95-120/hr |
| Senior PM | $106/hr | $120-140/hr | $130-160/hr |
| PM Consultant | $58/hr avg | $75-95/hr | $100-150/hr |

### 4.2 Your Value Proposition

Your unique combination of skills commands a premium rate:

| Factor | Value Add | Rate Impact |
|--------|-----------|-------------|
| **10 years accounting experience** | Financial domain expertise | +15-20% |
| **10 years IT experience** | Technical implementation capability | +15-20% |
| **Construction industry expertise** | Understands client business deeply | +20-25% |
| **Full-stack capability** | Can both specify AND build | +25-30% |
| **Northeast market** | Higher cost of living adjustment | +10-15% |

### 4.3 Recommended Hourly Rate

**Your recommended rate: $120 - $150/hour**

| Engagement Type | Rate | Justification |
|-----------------|------|---------------|
| **Strategy/PM Work** | $150/hr | High-value product decisions, roadmap planning |
| **Development Work** | $120/hr | Hands-on implementation, technical tasks |
| **Maintenance/Support** | $100/hr | Ongoing retainer work, lower complexity |
| **Blended Rate** | $125/hr | Mixed strategy + development |

This rate reflects:
- Northeast US market rates for technical consultants
- Specialized construction industry knowledge (rare combination)
- Dual role as both Product Manager AND Developer
- Production-quality deliverable expectations

---

## 5. Engagement Options

### Option A: Fixed-Price MVP

| Deliverable | Price |
|-------------|-------|
| MVP (36-50 hours @ $120/hr blended) | **$4,800 - $6,000** |
| Infrastructure setup (included) | - |
| 30-day warranty period | Included |
| Documentation | Included |

**Payment Terms:** 50% upfront, 50% on delivery

### Option B: Time & Materials

| Phase | Estimated Hours | Rate | Estimated Cost |
|-------|-----------------|------|----------------|
| MVP Development | 40-50 | $125/hr | $5,000 - $6,250 |
| Full Vision (Phase 2) | 95-135 | $125/hr | $11,875 - $16,875 |
| **Total Development** | 135-185 | - | **$16,875 - $23,125** |

**Payment Terms:** Bi-weekly invoicing, Net 15

### Option C: Retainer Model

| Tier | Hours/Month | Monthly Rate | Best For |
|------|-------------|--------------|----------|
| **Basic** | 4 hours | $400/month | Bug fixes, minor updates |
| **Standard** | 8 hours | $800/month | Ongoing enhancements |
| **Premium** | 16 hours | $1,500/month | Active development |

---

## 6. Total Cost of Ownership (Year 1)

### Scenario: MVP + Basic Maintenance

| Category | Cost |
|----------|------|
| MVP Development | $5,500 |
| Infrastructure (12 months @ $55/mo) | $660 |
| Maintenance Retainer (12 months @ $400/mo) | $4,800 |
| **Year 1 Total** | **$10,960** |

### Scenario: Full Vision + Standard Maintenance

| Category | Cost |
|----------|------|
| MVP Development | $5,500 |
| Full Vision Development | $14,000 |
| Infrastructure (12 months @ $75/mo) | $900 |
| Maintenance Retainer (12 months @ $800/mo) | $9,600 |
| **Year 1 Total** | **$30,000** |

---

## 7. Risk Mitigation

| Risk | Mitigation | Owner |
|------|------------|-------|
| Scope creep | Defined MVP scope, change request process | Both parties |
| Technical debt | Code reviews, testing requirements | Developer |
| Data loss | Automated backups, disaster recovery | Infrastructure |
| Security breach | Auth best practices, encryption, auditing | Developer |
| Knowledge transfer | Documentation, training sessions | Developer |

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **System Uptime** | 99.5% | Vercel/AWS monitoring |
| **Page Load Time** | < 2 seconds | Vercel Analytics |
| **Calculation Accuracy** | 100% | Unit tests |
| **User Adoption** | 80% of estimators within 90 days | Usage analytics |
| **Time Savings** | 50% reduction in estimate creation time | User feedback |

---

## 9. Timeline

### MVP Timeline (No Hard Deadline)

| Week | Milestone |
|------|-----------|
| 1 | Infrastructure setup, authentication |
| 2-3 | Project persistence, core refinements |
| 4 | PDF export, testing |
| 5 | Security hardening, documentation |
| 6 | UAT, bug fixes, deployment |

**Estimated MVP Delivery: 4-6 weeks** (part-time engagement)

---

## 10. Next Steps

1. **Review & Approve** this business case
2. **Select Engagement Model** (Fixed, T&M, or Retainer)
3. **Sign Agreement** with scope, rates, and payment terms
4. **Kick-off Meeting** to align on priorities
5. **Begin Development** with weekly status updates

---

## Appendix A: Technology Stack Details

| Layer | Technology | Version | License |
|-------|------------|---------|---------|
| Frontend Framework | React | 19.2.0 | MIT |
| Build Tool | Vite | 7.1.9 | MIT |
| Styling | Tailwind CSS | 4.1.14 | MIT |
| UI Components | Radix UI | Various | MIT |
| Backend | Express.js | 4.21.2 | MIT |
| Database | PostgreSQL | 16+ | PostgreSQL License |
| ORM | Drizzle | 0.39.3 | MIT |
| Charts | Recharts | 2.15.4 | MIT |
| Animations | Framer Motion | 12.23.24 | MIT |

---

## Appendix B: References

### Market Rate Sources
- [PayScale - Product Management Hourly Rate](https://www.payscale.com/research/US/Skill=Product_Management/Hourly_Rate)
- [ZipRecruiter - Product Manager Salary](https://www.ziprecruiter.com/Salaries/Product-Manager-Salary)
- [Glassdoor - Product Manager Salary Trends 2026](https://www.glassdoor.com/Salaries/product-manager-salary-SRCH_KO0,15.htm)
- [Upwork - Product Manager Rates](https://www.upwork.com/hire/product-managers/cost/)

### Infrastructure Pricing Sources
- [Vercel Pricing](https://vercel.com/pricing)
- [Vercel Pro Plan Documentation](https://vercel.com/docs/plans/pro-plan)
- [AWS RDS PostgreSQL Pricing](https://aws.amazon.com/rds/postgresql/pricing/)
- [AWS RDS Pricing Overview](https://aws.amazon.com/rds/pricing/)

---

*This document is confidential and intended solely for Connected and the engaged consultant.*
