# Facility Service Request Agent — Technical Architecture

**City Wide Facility Solutions | Dynamics 365 + Agentic AI**
**Prepared by:** Andrew Thurlow | 528 Labs
**Date:** March 31, 2026

---

## Executive Summary

This document outlines a production architecture for an AI-powered facility service request triage agent built on Microsoft Dynamics 365 for Sales Online and the Power Platform. The system enables property managers to describe maintenance issues in natural language, which are then automatically classified, routed to the optimal independent contractor, and converted into work orders — all within the Dynamics 365 environment.

This architecture specifically targets City Wide's migration from on-premise Dynamics CRM to Dynamics 365 Online, demonstrating capabilities that become possible post-migration: Copilot Studio agents, Power Automate cloud flows with AI Builder, and Dataverse Web API integrations.

---

## Problem Statement

City Wide Facility Solutions manages 20+ building maintenance service types through independent contractors for commercial building owners and property managers across 100+ franchise locations. The core operational challenge is **service request triage and contractor routing** — taking an unstructured problem description from a property manager and turning it into a correctly classified, properly prioritized, and optimally assigned work order.

Today this process is manual: a Facility Solutions Manager (FSM) reads the request, determines the service type, checks contractor availability, and creates the work order in CRM. With 400+ million square feet under management nightly, this doesn't scale.

---

## Solution Architecture

### High-Level Flow

```
Property Manager              Dynamics 365 / Power Platform           Contractors
─────────────────           ──────────────────────────────           ──────────────
                            ┌─────────────────────────────┐
  "Water pooling in  ────►  │  Model-Driven App           │
   the parking garage"      │  (Custom Service Request     │
                            │   Page with text input)      │
                            └──────────┬──────────────────┘
                                       │
                            ┌──────────▼──────────────────┐
                            │  Power Automate Cloud Flow   │
                            │  ┌────────────────────────┐  │
                            │  │ Step 1: AI Builder /    │  │
                            │  │ Copilot Studio Agent    │  │
                            │  │ - Classify service type │  │
                            │  │ - Assess priority       │  │
                            │  │ - Generate scope desc   │  │
                            │  └──────────┬─────────────┘  │
                            │  ┌──────────▼─────────────┐  │
                            │  │ Step 2: Dataverse Query │  │
                            │  │ - Filter contractors by │  │
                            │  │   service + availability│  │
                            │  │ - Rank by performance   │  │
                            │  └──────────┬─────────────┘  │
                            │  ┌──────────▼─────────────┐  │
                            │  │ Step 3: Create Work     │  │
                            │  │ Order record            │  │
                            │  │ - Auto-assign contractor│  │
                            │  │ - Set SLA timers        │  │
                            │  └──────────┬─────────────┘  │
                            │  ┌──────────▼─────────────┐  │
                            │  │ Step 4: Bundle Check    │  │
                            │  │ - Query scheduled svcs  │  │  ┌────────────────┐
                            │  │ - Suggest combinations  │──┼─►│ Email / Teams   │
                            │  └────────────────────────┘  │  │ Notification to │
                            └──────────────────────────────┘  │ assigned IC     │
                                                              └────────────────┘
```

### Component Breakdown

#### 1. Dataverse Custom Tables (Entity Model)

| Table (Logical Name) | Display Name | Purpose | Key Columns |
|---|---|---|---|
| `cw_facility` | Facility | Client buildings | Name, Address (composite), Type (option set), Square Footage, Contract Lookup, Primary FSM |
| `cw_servicecategory` | Service Category | 22 service types | Name, Description, Default SLA (hours), Typical Duration, Safety Requirements |
| `cw_contractor` | Contractor | Independent contractor profiles | Name, Services (N:N to cw_servicecategory), Performance Rating (calculated), Jobs Completed (rollup), Is Available (yes/no), Response Time SLA, Hourly Rate Range, Certifications |
| `cw_servicerequest` | Service Request | Inbound requests | Facility (lookup), Raw Description (multiline text), AI Classification JSON (multiline), Classified Category (lookup), Status (option set: New/Classified/Assigned/In Progress/Complete) |
| `cw_workorder` | Work Order | Generated work orders | Service Request (lookup), Facility (lookup), Category (lookup), Assigned Contractor (lookup), Priority (option set), Scope Description, Estimated Duration, Created On, Due Date, Safety Notes |
| `cw_scheduledservice` | Scheduled Service | Recurring service schedule | Facility (lookup), Category (lookup), Contractor (lookup), Next Service Date, Frequency (option set), Last Completed |

**Key Relationships:**
- `cw_facility` 1:N `cw_servicerequest` (a facility has many requests)
- `cw_servicerequest` 1:1 `cw_workorder` (each request becomes one work order)
- `cw_contractor` N:N `cw_servicecategory` (contractors serve multiple categories)
- `cw_facility` 1:N `cw_scheduledservice` (recurring services per facility)

#### 2. AI Classification Agent

**Production approach:** Copilot Studio custom agent or AI Builder custom prompt action within Power Automate.

**Input:** Natural language facility issue description
**Output:** Structured JSON with service classification, priority, scope, and safety notes

**Implementation options (ranked by preference for D365 Online):**

1. **Copilot Studio Agent** — Native to Power Platform, deployable as a custom page in Model-Driven Apps, supports structured output, can directly query Dataverse
2. **AI Builder Custom Prompt** — Callable from Power Automate, supports GPT-4o via Azure OpenAI connection, returns structured JSON
3. **Azure OpenAI Direct** — Custom connector in Power Automate calling Azure OpenAI endpoint with system prompt for classification
4. **Custom Plugin (C#)** — Server-side plugin registered on `cw_servicerequest` Create message, calls external AI API, updates classification fields

**System prompt engineering:** The classification prompt includes all 22 service categories with descriptions, priority assessment rubric, and output schema. This ensures deterministic classification that maps directly to Dataverse option sets.

#### 3. Contractor Matching Logic

**Dataverse Web API query pattern:**

```
GET /api/data/v9.2/cw_contractors
  ?$filter=cw_ServiceCategories/any(sc: sc/cw_servicecategoryid eq '{classifiedCategoryId}')
    and cw_isavailable eq true
  &$orderby=cw_performancerating desc
  &$top=3
  &$select=cw_name,cw_performancerating,cw_responsetime,cw_jobscompleted,cw_hourlyrate
```

**Matching criteria (weighted):**
- Service category match (required)
- Availability status (required)
- Performance rating (40% weight)
- Historical response time vs. SLA (30% weight)
- Jobs completed at this specific facility — relationship continuity (20% weight)
- Rate competitiveness (10% weight)

#### 4. Bundle Detection

**FetchXML query against `cw_scheduledservice`:**

```xml
<fetch top="10">
  <entity name="cw_scheduledservice">
    <attribute name="cw_servicecategoryid" />
    <attribute name="cw_nextservicedate" />
    <attribute name="cw_contractorid" />
    <filter>
      <condition attribute="cw_facilityid" operator="eq" value="{currentFacilityId}" />
      <condition attribute="cw_nextservicedate" operator="next-x-days" value="14" />
    </filter>
    <link-entity name="cw_servicecategory" from="cw_servicecategoryid" to="cw_servicecategoryid">
      <attribute name="cw_name" />
    </link-entity>
  </entity>
</fetch>
```

If results exist, the agent suggests bundling to reduce visit costs and presents the option to the FSM before finalizing the work order.

---

## Migration Considerations: On-Prem → D365 Online

This solution specifically leverages capabilities available only in Dynamics 365 Online:

| Capability | On-Prem | D365 Online | Impact |
|---|---|---|---|
| Copilot Studio agents | ❌ | ✅ | Core AI classification engine |
| AI Builder | ❌ | ✅ | Custom prompt actions in flows |
| Power Automate cloud flows | Limited | ✅ Full | Orchestration layer |
| Dataverse Web API v9.2 | Partial | ✅ Full | Real-time contractor queries |
| Azure OpenAI connectors | ❌ | ✅ | Fallback AI classification |
| Power BI embedded dashboards | Limited | ✅ | Real-time ops analytics |
| Model-Driven App custom pages | ❌ | ✅ | Custom React UI for request input |

**Data migration path:**
1. Export on-prem entities using Data Migration Utility
2. Map custom entities to new Dataverse schema
3. Transform option sets and lookups to match online schema
4. Validate with parallel run period before cutover
5. Migrate SSRS reports to Power BI (phased)

---

## Reporting & Analytics Layer

**Power BI dashboards (replacing SSRS):**

- **Service Request Volume** — Requests by category, facility, priority over time
- **Contractor Performance Scorecard** — Rating trends, SLA compliance, jobs completed
- **AI Classification Accuracy** — Comparison of AI classification vs. FSM override rate
- **Bundling Savings** — Cost reduction from bundled service visits
- **Franchise Benchmarking** — Cross-location performance comparison

**Key metrics:**
- Mean time from request to work order creation
- AI classification accuracy (% not overridden by FSM)
- Contractor assignment acceptance rate
- SLA compliance by priority tier

---

## Security Model

| Security Role | Dataverse Access |
|---|---|
| Property Manager | Create service requests for their facilities only |
| Facility Solutions Manager (FSM) | Full CRUD on requests/work orders for assigned facilities; override AI classification |
| Franchise Admin | Read all; manage contractors and scheduled services |
| System Admin | Full access; manage AI prompt configuration |

Row-level security implemented via Dataverse business units aligned to franchise locations.

---

## Implementation Roadmap

| Phase | Timeline | Deliverables |
|---|---|---|
| **1. Schema & Migration** | Weeks 1-3 | Dataverse tables, relationships, option sets; data migration from on-prem |
| **2. Core CRUD** | Weeks 3-5 | Model-Driven App for facilities, contractors, service categories; basic request → work order flow |
| **3. AI Agent** | Weeks 5-7 | Copilot Studio agent or AI Builder prompt; Power Automate classification flow; contractor matching logic |
| **4. Bundle Intelligence** | Weeks 7-8 | Scheduled service tracking; bundle detection query; notification flow |
| **5. Reporting** | Weeks 8-10 | Power BI dashboards; SSRS migration for existing reports |
| **6. Pilot & Iterate** | Weeks 10-12 | Deploy to 2-3 franchise locations; measure AI accuracy; tune classification prompt |

---

## Technology Stack Summary

- **CRM Platform:** Dynamics 365 for Sales Online
- **Data Layer:** Microsoft Dataverse
- **AI/ML:** Copilot Studio / AI Builder / Azure OpenAI (GPT-4o)
- **Orchestration:** Power Automate (cloud flows)
- **UI:** Model-Driven Apps with custom pages (React via PCF)
- **Reporting:** Power BI (replacing SSRS)
- **Integration:** Dataverse Web API v9.2, FetchXML
- **Development:** C# plugins (server-side logic), TypeScript (PCF controls), JavaScript (form scripts)

---

## About the Author

**Andrew Thurlow** is the founder of 528 Labs, a software development consultancy based in Olathe, KS, specializing in full-stack application development, data engineering, and AI/automation. Recent work includes building a $65K case management platform (Next.js/TypeScript/Supabase), a real-time commission visibility SaaS for invoice factoring, and a HubSpot-integrated partner portal with bidirectional API sync handling 6,000+ records.

**Live Demo:** [athurlow.github.io/facility-service-agent](https://athurlow.github.io/facility-service-agent)
**GitHub:** [github.com/athurlow/facility-service-agent](https://github.com/athurlow/facility-service-agent)
