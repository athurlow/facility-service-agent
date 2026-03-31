# Facility Service Request Agent

An AI-powered facility service request triage agent demonstrating how **Dynamics 365 / Dataverse** patterns integrate with **agentic AI** for commercial facility management workflows.

**[Live Demo →](https://athurlow.github.io/facility-service-agent)**

## What It Does

A property manager describes a maintenance issue in natural language, and the agent:

1. **Classifies** the request into one or more of 22+ facility service categories using NLP
2. **Matches** the best independent contractor based on service type, availability, rating, and response time from Dataverse records
3. **Drafts** a work order with auto-assigned priority and estimated response timeline
4. **Detects bundling opportunities** by cross-referencing upcoming scheduled services at the same facility

## Business Context

Built to demonstrate AI/automation patterns for [City Wide Facility Solutions](https://gocitywide.com), the largest management company in the building maintenance industry. City Wide acts as a single point of contact coordinating 20+ facility service types through independent contractors for building owners and property managers — making intelligent triage and vendor routing a core operational challenge.

## Dataverse Entity Model

The demo simulates queries against these custom Dataverse tables:

| Entity | Purpose |
|---|---|
| `cw_facility` | Client buildings with address, type, square footage |
| `cw_servicecategory` | 22 service types City Wide manages |
| `cw_contractor` | Independent contractor profiles, ratings, availability |
| `cw_servicerequest` | Inbound requests with NLP classification |
| `cw_workorder` | Generated work orders with priority and scope |
| `cw_scheduledservice` | Upcoming service visits for bundling detection |

## Tech Stack

- **React 18** + **Vite** — fast SPA with no backend required
- **GitHub Pages** — static hosting via Actions CI/CD
- Designed to map onto **Dynamics 365 Model-Driven Apps**, **Power Automate**, and **Dataverse Web API**

## Local Development

```bash
npm install
npm run dev
```

## Deployment

Pushes to `main` auto-deploy via GitHub Actions. Or manually:

```bash
npm run deploy
```

---

Built by [Andrew Thurlow](https://github.com/athurlow) / [528 Labs](https://528labs.com)
