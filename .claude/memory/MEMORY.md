# Memory Log

## Phase Completed
- **Phase 1 — Project Scaffolding & Infrastructure**
- **Phase 2 — Domain Layer & Database**
- **Phase 3 — Authentication & Authorization**
- **Phase 4 — Language & Category Management**

## What Was Built (Phase 4)
- Developed `ICurrentUserService` to safely extract authenticated user ID in application commands/queries.
- Created Backend Handlers/Controllers for managing Languages (`GetLanguagesQuery`, `AddUserLanguageCommand`, `SetActiveLanguageCommand`).
- Created Backend CRUD Operations for Categories (`CreateCategoryCommand`, `UpdateCategoryCommand`, etc.) restricted to the active language context.
- Fixed asynchronous implementations in `IRepository<T>` and `Repository<T>`, and introduced `Query()` to expose `IQueryable` for LINQ operations.
- Updated Next.js UI structure for the main dashboard `app/(main)/layout.tsx`.
- Integrated Zustand state stores `languageStore.ts` and `categoryStore.ts`.
- Developed `LanguageSelector.tsx` for easy active language switching in the header.
- Designed `CategoriesPage` with modern modal-based CRUD functionality and clean responsive layout using `lucide-react`.

## Known Issues Found and Fixed
1. **Repository IQueryable Missing:** The standard generic repository lacked robust querying capability which was hindering filtering logic (e.g. ActiveLanguage mapping).
   - *Fix:* Added `IQueryable<T> Query()` method to `IRepository<T>` so `MediatR` handlers can efficiently construct database queries using Entity Framework core features.
2. **AutoMapper Registration Conflict:** Multiple instances and scoping errors caused dependency injection failures in the application builder.
   - *Fix:* Directly specified the assembly target during `AddAutoMapper` initialization.

## Outstanding Items for the Next Phase
- **Phase 5 — Vocabulary (Words) Module**
  - Implement full Word CRUD (meanings, examples).
  - Setup API integrations for IPA and Pronunciation audio auto-fetching.
  - Setup Image storage logic.
  - Frontend word list view, creation modals, and integration with Review list.
