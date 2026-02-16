# Rocketbase CMS - Master Implementation Plan

> **For Claude:** This is the master plan. Individual feature plans are in `docs/plans/features/`. Use superpowers:executing-plans for each feature plan.

## Project Vision

**Goal:** Build a state-of-the-art content management system for websites and email newsletters using inexpensive/free open-source technologies. Target audience: publications, small businesses, artists, creators, individuals.

**Platform:** Mobile-first Progressive Web App (PWA)

**Core Technologies:**

- Backend: PocketBase (SQLite, auth, file storage, real-time)
- Frontend: SvelteKit + Svelte 5
- Forms: sveltekit-superforms + Zod
- UI: shadcn-svelte + Tailwind CSS 4
- Utils: radashi, runed
- Dev Services: Zipkin (tracing), Mailpit (email testing)
- Background Jobs: Sidecar services (Node.js + tRPC)
- Tooling: CLI for setup and configuration

---

## Current State Assessment

### Completed Features ✅

- User authentication with email verification
- Password reset flow
- Account settings (profile, password, MFA)
- Pages CRUD with hierarchy and SEO
- Posts CRUD with tags and authors
- Admin page management with hierarchical display
- Dynamic page routing with SEO metadata
- Dark mode support
- Toast notifications
- Internationalization (Paraglide)
- Audit logging system
- PocketBase type generation
- Basic media management
- Portfolio management (mostly done)

### Partially Complete Features 🚧

- Media management (upload, captions, alt text - no multi-file upload)
- Posts + IndieWeb (structured data, microformats - no syndication)
- RSS feeds (XML/JSON - partial)
- Subscriber-only content (field exists - no paywall/subscription system)

### Not Started Features ❌

- Settings page (metadata/redirects admin UI)
- Harper.js grammar checking in editor
- User management dashboard
- Team collection + admin page
- Services collection + admin page
- Opportunities collection + admin page (employment, internship, volunteer)
- UI theming system for site color customization
- Web stats dashboard
- Activity audit dashboard
- Job queue dashboard
- Comments system
- Editorial kanban
- Todos system
- Event calendar
- Newsletters/transactional email
- Social media scheduler
- Short links
- Shop/e-commerce
- Subscription payments

---

## Implementation Phases

### Phase 0: Foundation & Core (Current → MVP)

**Priority:** CRITICAL - Complete before any other features
**Timeline:** 2-3 weeks

**Objective:** Finish core admin tools and content management features that every other feature depends on.

| Feature                                 | Status | Plan Reference                             |
| --------------------------------------- | ------ | ------------------------------------------ |
| Settings Admin UI                       | ❌     | `features/01-settings-admin-ui.md`         |
| Harper.js Editor Integration            | ❌     | `features/02-harper-editor-integration.md` |
| User Management Dashboard               | ❌     | `features/03-user-management.md`           |
| Team Admin (collection + UI)            | ❌     | `features/20-team-admin.md`                |
| Services Admin (collection + UI)        | ❌     | `features/21-services-admin.md`            |
| Opportunities Admin (collection + UI)   | ❌     | `features/22-opportunities-admin.md`       |
| UI Theming System                       | ❌     | `features/23-ui-theming-system.md`         |
| Media Management (complete)             | 🚧     | `features/04-media-management-complete.md` |
| Posts + IndieWeb (complete)             | 🚧     | `features/05-posts-indieweb-complete.md`   |
| RSS Feeds (complete)                    | 🚧     | `features/06-rss-feeds-complete.md`        |

**Dependencies:** None (foundation work)

**New Foundation Scope (Planned Additions):**

- **Team collection + admin page:** manage people profiles (name, role, bio, links, photo, ordering, visibility).
- **Services collection + admin page:** manage service offerings (title, summary, details, icon/media, pricing hints, ordering, visibility).
- **Opportunities collection + admin page:** manage opportunity postings with strict type options (`employment`, `internship`, `volunteer`), status, apply link, and publish windows.
- **UI theming system:** admin-configurable color themes (brand palette + semantic tokens), with safe contrast defaults and runtime switching.

**Exit Criteria:**

- Admins can manage all site settings via UI
- Admins can manage users, roles, permissions
- Media library supports multi-file upload
- Posts have complete IndieWeb support
- RSS feeds are fully functional
- Editor has grammar/spell checking

---

### Phase 1: Content Creation & Editorial Workflow

**Priority:** HIGH - Core value proposition
**Timeline:** 3-4 weeks

**Objective:** Enable professional content creation workflows with collaboration tools.

| Feature                  | Status | Plan Reference                    |
| ------------------------ | ------ | --------------------------------- |
| Comments System          | ❌     | `features/07-comments-system.md`  |
| Editorial Kanban         | ❌     | `features/08-editorial-kanban.md` |
| Todos System             | ❌     | `features/09-todos-system.md`     |
| Activity Audit Dashboard | ❌     | `features/10-audit-dashboard.md`  |

**Dependencies:**

- User Management (Phase 0)
- Posts + IndieWeb (Phase 0)

**Exit Criteria:**

- Readers can comment on posts (with moderation)
- Editors can track story progress via kanban
- Team members can assign and manage todos
- Admins can audit all system activity

---

### Phase 2: Audience & Monetization

**Priority:** HIGH - Revenue generation
**Timeline:** 4-6 weeks

**Objective:** Enable paid subscriptions, newsletters, and audience engagement.

| Feature                 | Status | Plan Reference                      |
| ----------------------- | ------ | ----------------------------------- |
| Subscriptions (Stripe)  | ❌     | `features/11-subscriptions.md`      |
| Subscriber-Only Content | 🚧     | `features/12-subscriber-content.md` |
| Newsletters/Email       | ❌     | `features/13-newsletters.md`        |
| Job Queue Dashboard     | ❌     | `features/14-queue-dashboard.md`    |

**Dependencies:**

- User Management (Phase 0)
- Posts + IndieWeb (Phase 0)
- Sidecar services (background jobs)

**Exit Criteria:**

- Users can subscribe with Stripe payments
- Content can be locked to subscription tiers
- Automated newsletters send to subscribers
- Email queue can be monitored and managed

---

### Phase 3: Distribution & Analytics

**Priority:** MEDIUM - Growth and insights
**Timeline:** 3-4 weeks

**Objective:** Expand content distribution and understand audience behavior.

| Feature                | Status | Plan Reference                  |
| ---------------------- | ------ | ------------------------------- |
| Social Media Scheduler | ❌     | `features/15-social-media.md`   |
| Short Links            | ❌     | `features/16-short-links.md`    |
| Web Stats              | ❌     | `features/17-web-stats.md`      |
| Event Calendar         | ❌     | `features/18-event-calendar.md` |

**Dependencies:**

- Posts + IndieWeb (Phase 0)
- Job Queue Dashboard (Phase 2)
- Sidecar services

**Exit Criteria:**

- Posts auto-syndicate to social platforms
- Short links track click-through rates
- Privacy-friendly analytics dashboard
- Events can be published with iCal downloads

---

### Phase 4: E-Commerce (Future)

**Priority:** LOW - Optional revenue stream
**Timeline:** TBD

**Objective:** Enable product sales, digital goods, and invoicing.

| Feature         | Status | Plan Reference                  |
| --------------- | ------ | ------------------------------- |
| Shop/E-commerce | ❌     | `features/19-shop-ecommerce.md` |

**Dependencies:**

- Subscriptions (Phase 2)
- Media Management (Phase 0)

**Exit Criteria:** TBD (requires detailed planning)

---

## Cross-Cutting Concerns

### CLI Development

**Status:** Barely started
**Ongoing Priority:** MEDIUM

**Objectives:**

- Prep PocketBase DB and configuration
- Scaffold new features
- Enable/disable features via dashboard
- npx executable

**Key Decisions:**

- Use `commander` or `yargs` for CLI framework
- Use `inquirer` for interactive prompts
- Support both interactive and non-interactive modes

### Sidecar Services

**Status:** Barely started
**Ongoing Priority:** MEDIUM

**Objectives:**

- Process background job queues
- Send emails via SMTP
- Syndicate to social media
- Scheduled task execution

**Key Dependencies:**

- Needs job queue collections (exists in schema)
- Needs tRPC API (basic structure exists)
- Needs integration with PocketBase queue

### Testing Strategy

**Ongoing Priority:** CRITICAL

**Test Coverage Requirements:**

- Unit tests: All utility functions, helpers, validation logic
- Integration tests: API routes, form actions, PocketBase hooks
- E2E tests: Critical user journeys (auth, content creation, subscriptions)
- Browser tests: Component behavior, accessibility

**Test Tooling:**

- Vitest (unit + browser tests)
- Playwright (E2E tests)
- vitest-browser-svelte (component tests)

### Documentation

**Ongoing Priority:** HIGH

**Documentation Deliverables:**

- API reference (auto-generated from types)
- Admin user guide
- Developer setup guide
- Deployment guide
- Feature documentation (per feature plan)
- Inline documentation for all functions, components, and routes
- External markdown documentation for every implemented feature

### Implementation Review Track (Ongoing)

**Ongoing Priority:** HIGH

To reduce regressions and keep implementation quality high while shipping features, each phase includes a review pass across existing code before and after major feature delivery.

**Review Areas:**

- **Best Practices Review**
  - Validate framework/library usage against official guidance.
  - Check consistency with repo conventions and architecture decisions.
- **Code Quality Review**
  - Identify readability/maintainability issues and fragile patterns.
  - Prioritize clear naming, bounded module responsibilities, and error handling quality.
- **Security Compliance Review**
  - Apply OWASP-focused checks (authz, injection, secret handling, insecure defaults).
  - Verify secure configuration and dependency hygiene for new and existing paths.
- **Complexity Reduction Review**
  - Identify high-complexity hotspots and refactor opportunities.
  - Prefer simpler data flow and composable utilities over deeply nested logic.
- **Missing Tests Review**
  - Detect uncovered critical paths and risk-prone branches.
  - Add/extend unit, integration, and e2e tests where gaps materially increase risk.

**Review Cadence:**

- Pre-implementation review for each phase start.
- Post-implementation review before phase exit criteria sign-off.
- Follow-up remediation tasks tracked as beans and prioritized in the next sprint window.

**Definition of Done Addendum (for every feature):**

- Feature passes functional acceptance criteria.
- Review findings are either fixed or explicitly tracked in follow-up beans.
- Security and test-gap findings are never silently deferred without owner and target phase.
- New/updated functions, components, and routes include inline documentation.
- External markdown documentation for the feature is created or updated before completion.

---

## Feature Plan Structure

Each feature will have its own detailed implementation plan in `docs/plans/features/<feature-name>.md` following this structure:

### Template Structure

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** Use superpowers:executing-plans to implement this plan.

## Overview

- Goal
- User Stories
- Success Criteria

## Research Phase

- Documentation review
- API exploration
- Existing patterns analysis
- Third-party library evaluation

## Development Phase

- Database schema changes
- Backend implementation (TDD)
- Frontend implementation (TDD)
- Integration
- Inline docs pass (functions, components, routes)

## Testing Phase

- Unit tests
- Integration tests
- E2E tests
- Manual testing checklist

## Documentation

- User documentation
- Developer documentation
- API documentation
- External markdown feature documentation (one doc per feature)
```

---

## Critical Dependencies Map

```text
Phase 0 (Foundation)
├── Settings Admin UI (no deps)
├── User Management (no deps)
├── Media Management (no deps)
├── Posts + IndieWeb (no deps)
├── RSS Feeds (Posts)
└── Harper.js (no deps)

Phase 1 (Editorial)
├── Comments (User Mgmt, Posts)
├── Editorial Kanban (User Mgmt, Posts)
├── Todos (User Mgmt)
└── Audit Dashboard (no deps)

Phase 2 (Monetization)
├── Subscriptions (User Mgmt)
├── Subscriber Content (Subscriptions, Posts)
├── Newsletters (User Mgmt, Posts, Sidecar)
└── Queue Dashboard (Sidecar)

Phase 3 (Distribution)
├── Social Media (Posts, Queue, Sidecar)
├── Short Links (no deps)
├── Web Stats (no deps)
└── Events (no deps)

Phase 4 (E-Commerce)
└── Shop (Subscriptions, Media)
```

---

## Risk Assessment

### High Risk Items

1. **Stripe Integration** - Payment processing has security and compliance requirements
2. **Email Delivery** - Deliverability, spam filters, DKIM/SPF setup
3. **Social Media APIs** - Rate limits, OAuth complexity, API changes
4. **Performance at Scale** - SQLite limits, need caching strategy

### Mitigation Strategies

1. Use established libraries (stripe-node, etc.)
2. Use transactional email service (not raw SMTP)
3. Implement robust error handling and retry logic
4. Add caching layer, consider read replicas

### Technical Debt

- **PocketBase migration to custom Go binary** - May need custom build for advanced features
- **Sidecar architecture** - May need containerization/orchestration
- **Frontend state management** - May need Svelte stores refactor as complexity grows

---

## Next Steps

### Immediate Actions

1. **Review and approve this master plan**
2. **Confirm implementation order for Phase 1 features**
3. **Create beans for each Phase 1 feature plan and assign owners**
4. **Set milestone dates for Phase 1 and Phase 2 handoff**

### Implementation Start Order (Recommended)

1. Comments System (`07-comments-system.md`)
2. Editorial Kanban (`08-editorial-kanban.md`)
3. Todos System (`09-todos-system.md`)
4. Activity Audit Dashboard (`10-audit-dashboard.md`)
5. Move to Phase 2 after Phase 1 exit criteria is satisfied

---

## Measurement & Success Criteria

### Phase 0 Success Metrics

- All admin UIs have CRUD operations
- All settings configurable via UI (not DB)
- Team, Services, and Opportunities admin CRUD flows are functional
- Opportunities support type filtering for employment/internship/volunteer
- Theming system can update site colors from admin-controlled configuration
- Media library supports batch upload
- Posts have complete microformats/JSON-LD
- Editor has real-time grammar checking

### Phase 1 Success Metrics

- Comments can be moderated
- Editorial workflow reduces time-to-publish by 30%
- Team collaboration features used weekly

### Phase 2 Success Metrics

- Subscription payments processing
- Newsletter open rate >20%
- Job queue processing <1min latency

### Phase 3 Success Metrics

- Social media posts auto-syndicate
- Analytics dashboard shows 7d/30d trends
- Events have iCal downloads

---

## Resources & References

### Further Documentation

- PocketBase: <https://pocketbase.io/docs/>
- SvelteKit: <https://svelte.dev/docs/kit>
- shadcn-svelte: <https://www.shadcn-svelte.com/>
- sveltekit-superforms: <https://superforms.rocks/>
- Stripe API: <https://stripe.com/docs/api>
- Harper.js: <https://writewithharper.com/docs/harperjs/>

### Project Files

- Main Instructions: `/Users/daniel/Developer/rocketbase/CLAUDE.md`
- Schema Migrations: `/Users/daniel/Developer/rocketbase/db/pb_migrations/`
- App Routes: `/Users/daniel/Developer/rocketbase/app/src/routes/`
- Components: `/Users/daniel/Developer/rocketbase/app/src/lib/components/`

---

## Plan Status

- **Created:** 2026-02-15
- **Last Updated:** 2026-02-16
- **Status:** Draft (awaiting approval)
- **Current Phase:** Phase 0 (Foundation)
- **Next Review:** After Phase 0 completion

---

## Notes

- This is a living document - update as priorities shift
- Each phase can run in parallel worktrees
- Use beans for issue tracking: `beans create "Feature X" -t feature`
- All commits must reference beans: `git commit -m "feat: add X (bean-Y)"`
- Run quality gates before pushing: `pnpm lint && pnpm test && pnpm build`
