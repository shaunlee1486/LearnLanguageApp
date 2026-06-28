# Memory Log

## Phase Completed
- **Phase 1 — Project Scaffolding & Infrastructure**

## What Was Built
- Created solution file `YK.LanguageLearn.slnx` using new XML format.
- Set up 7 backend projects:
  - `YK.Domain`
  - `YK.Application`
  - `YK.Infrastructure`
  - `YK.Presentation`
  - `YK.Common`
  - `YK.API`
  - `YK.Migration`
- Linked all projects with Clean Architecture references.
- Installed NuGet packages for CQRS (MediatR), validation (FluentValidation), database (EF Core, Npgsql), mapping (AutoMapper), and migration (DbUp).
- Created shared foundation classes in `YK.Common`:
  - `BaseEntity.cs` (uses native UUIDv7 generator `Guid.CreateVersion7()`)
  - `ApiResponse.cs` (uniform JSON envelope format)
  - `PaginationMeta.cs` (uniform metadata structure)
- Created global exception handler middleware in `YK.Presentation`.
- Configured CORS, Swagger, and endpoints registry in `YK.API/Program.cs`.
- Created temporary `TestController.cs` in `YK.Presentation` to verify routing and exception mapping.
- Scaffolded Next.js 16 App Router frontend (`yk-frontend`) with TypeScript, Tailwind CSS, and Zustand.
- Configured custom fetch-based API client wrapper (`yk-frontend/lib/api.ts`) supporting JWT authorization header mapping and automatic session clear on `401 Unauthorized`.
- Built and local-tested a premium home page landing page in `yk-frontend/app/page.tsx` styled in Vietnamese.

## Known Issues Found and Fixed
1. **Package Downgrade Conflict:** Direct conflict between `Microsoft.AspNetCore.OpenApi` (requires Microsoft.OpenApi >= 2.0.0) and `Swashbuckle.AspNetCore` (requires Microsoft.OpenApi ~ 1.x) resulted in build failures. 
   - *Fix:* Removed `Microsoft.AspNetCore.OpenApi` package and consolidated OpenApi generation using standard self-contained `Swashbuckle.AspNetCore` 6.6.2.
2. **Nullability Warnings:** Warning CS8604 detected in `ExceptionMiddleware.cs` for potential null parameters.
   - *Fix:* Added null-coalescing fallbacks to exception message variables.
3. **npm package case-sensitivity:** Next.js scaffolding failed with folder name `YK.FrontEnd` because npm restricts package names containing capital letters.
   - *Fix:* Scaffolded as `yk-frontend` in lowercase. Since Windows is case-insensitive, we referenced this lowercase folder directly.

## Outstanding Items for the Next Phase
- **Phase 2 — Domain Layer & Database**
  - Implement domain models (User, Role, Language, Word, Radical, etc.) in `YK.Domain`.
  - Configure Entity Framework DB sets, Fluent configurations, and audits in `YK.Infrastructure`.
  - Set up PostgreSQL migrations using DbUp in `YK.Migration`.
  - Add initial seed data for default languages (EN, CN, JA) and 214 Chinese radicals.
