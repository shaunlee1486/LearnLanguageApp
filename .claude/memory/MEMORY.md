# Memory Log

## Phase Completed
- **Phase 1 — Project Scaffolding & Infrastructure**
- **Phase 2 — Domain Layer & Database**
- **Phase 3 — Authentication & Authorization**

## What Was Built (Phase 2 & 3)
- Implemented all domain models (User, Role, Language, Word, Radical, etc.) in `YK.Domain`.
- Configured Entity Framework DB sets, Fluent configurations, and audits in `YK.Infrastructure`.
- Set up PostgreSQL migrations using DbUp in `YK.Migration`.
- Created authentication MediatR commands (`Register`, `Login`, `RefreshToken`, `Logout`, `ForgotPassword`, `ResetPassword`) with FluentValidation.
- Created `JwtService` and `EmailService` inside `YK.Infrastructure` and linked ASP.NET Core Identity.
- Configured `AuthController` with mapping profiles to expose REST endpoints.
- Re-implemented API client in `yk-frontend/lib/api.ts` using Axios with token refresh interceptors.
- Developed the auth UI pages in `app/(auth)` with Next.js App Router (Login, Register, Forgot Password, Reset Password) and Zustand state management.

## Known Issues Found and Fixed
1. **Missing Identity Managers in Application Layer:** CQRS Handlers required `UserManager` and `SignInManager`.
   - *Fix:* Added `<FrameworkReference Include="Microsoft.AspNetCore.App" />` to `YK.Application.csproj` for Identity support without tight coupling.

## Outstanding Items for the Next Phase
- **Phase 4 — Language & Category Management**
  - Implement language selection, custom language creation.
  - Implement full CRUD for categories (API + frontend).
