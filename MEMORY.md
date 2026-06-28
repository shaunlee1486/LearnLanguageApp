# Project Memory Log

## Phase 1 — Project Scaffolding & Infrastructure
- **Status:** Completed
- **Achievements:** 
  - Scaffolding of all backend layers (Domain, Application, Infrastructure, Presentation, API, Migration, Common).
  - Configured Next.js frontend scaffolding inside `yk-frontend`.
  - Tested standard CORS configuration, Swagger, and API response envelope and exception middleware.

## Phase 2 — Domain Layer & Database
- **Status:** Completed
- **Achievements:**
  - Defined all 5 Domain Enums and 19 Domain Entities inside `YK.Domain`.
  - Configured Entity Framework Core (`AppDbContext`, configurations, query filters, audit interceptors).
  - Wrote generic Repository and Unit of Work patterns.
  - Implemented DbUp migration runner containing:
    - Tables, indexes, and constraints DDL.
    - Default languages seeds (English, Chinese, Japanese).
    - Chinese Kangxi radicals seeds.
    - Development environment sample users (admin/student) and vocabulary words.
  - Successfully ran database migrations and verified containerized database connectivity.
