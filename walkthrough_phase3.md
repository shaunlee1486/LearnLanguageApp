# Phase 3 Walkthrough

I have successfully implemented Phase 3 (Authentication & Authorization) as outlined in the implementation plan. Here is a summary of the work that was done:

## Backend

### Application Layer
- Created the following MediatR commands and their respective handlers:
  - `RegisterCommand`
  - `LoginCommand`
  - `RefreshTokenCommand`
  - `ForgotPasswordCommand`
  - `ResetPasswordCommand`
  - `LogoutCommand`
- Used `FluentValidation` to add strong input validation rules for all the authentication commands.
- Defined the core interfaces: `IJwtService` and `IEmailService`.
- Replaced the hardcoded Identity dependency inside MediatR handlers with the required Framework reference in the csproj to correctly resolve `UserManager` and `SignInManager`.

### Infrastructure Layer
- Created `JwtService` which utilizes `System.IdentityModel.Tokens.Jwt` to generate both Access and Refresh tokens.
- Implemented robust token validation which extracts claims from an expired token for the refresh workflow.
- Created `EmailService` as a placeholder (logging the reset links) which can be updated to use SMTP/SendGrid in the future.
- The `RefreshToken` entity configurations were already prepared during Phase 2.

### Presentation Layer
- Configured a new `AuthController` exposing all the necessary `/api/v1/auth/` REST endpoints.
- Established request DTOs (`RegisterRequest`, `LoginRequest`, etc.).
- Wired up `AutoMapper` to map the DTOs seamlessly into the internal MediatR commands.

## Frontend

### Setup & Integration
- Overhauled `lib/api.ts` to utilize **Axios**.
- Added an automatic request interceptor that attaches the `Authorization: Bearer <token>` header to all outgoing API calls.
- Implemented an intelligent response interceptor that automatically attempts to rotate the token upon a `401 Unauthorized` response before failing. If rotation fails, the user is automatically logged out and redirected to the login screen.
- Set up **Zustand** at `stores/authStore.ts` with local storage persistence to keep the user authenticated across sessions.

### Auth Pages & UI
Built responsive, fully featured pages complete with error handling, loading states, and success notifications under the new `app/(auth)` route group:
- **[Login](file:///d:/DotNet/LearnLanguageApp/yk-frontend/app/(auth)/login/page.tsx)**: User credentials collection.
- **[Register](file:///d:/DotNet/LearnLanguageApp/yk-frontend/app/(auth)/register/page.tsx)**: Sign-up page with built-in password confirmation validation.
- **[Forgot Password](file:///d:/DotNet/LearnLanguageApp/yk-frontend/app/(auth)/forgot-password/page.tsx)**: Prompts for email address to dispatch a reset link.
- **[Reset Password](file:///d:/DotNet/LearnLanguageApp/yk-frontend/app/(auth)/reset-password/page.tsx)**: Parses `token` and `email` from query params and processes password resets securely.
- **Middleware**: Set up a `middleware.ts` foundation that can be extended for protected routes.

> [!TIP]
> The backend `YK.API` and frontend `yk-frontend` are now both building without errors. You can start the dev servers using `dotnet run` and `npm run dev` to verify the authentication flow.
