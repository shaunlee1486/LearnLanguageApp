# Memory Log

## Phase Completed
- **Phase 1 — Project Scaffolding & Infrastructure**
- **Phase 2 — Domain Layer & Database**
- **Phase 3 — Authentication & Authorization**
- **Phase 4 — Language & Category Management**
- **Phase 5 — Vocabulary (Words) Module**
- **Phase 6 — Spaced Repetition (Flashcards) & Grammar Modules**
- **Phase 7 — SM-2 Spaced Repetition & User Dashboard**

## What Was Built (Phase 5)
- **Word Domain Entity**: Implemented CRUD operations (`CreateWordCommand`, `UpdateWordCommand`, `DeleteWordCommand`, `GetWordsByCategoryQuery`, `GetWordByIdQuery`).
- **Word State Management**: Added endpoints to mark words as "Already Known" and manage words within the user's "Review List" (for upcoming spaced repetition).
- **Image Upload Integration**: Implemented an `IImageStorageService` with a `LocalImageStorageService` backend to save images locally inside `wwwroot/uploads/images`.
- **Dictionary API Integration**: Implemented an `IDictionaryService` connecting to the Free Dictionary API (`dictionaryapi.dev`) to fetch pronunciations, IPA text, and audio URLs.
- **Frontend Word List View**: Built `useWordStore` utilizing Zustand. Added a beautiful list view (`/categories/[id]`) for words inside a given category with play buttons for audio and checkbox multi-selection.
- **Word Form Modal**: A rich, complex modal form for creating and editing words with dynamic rows for meanings and examples, image upload support, and a Dictionary auto-fill "Magic Wand" button.
- **Review List Page**: Added a dedicated page (`/review`) to view all the vocabulary tagged for study/review.

## Known Issues Found and Fixed
1. **Guid Type Mismatch in Identity Context**: `ICurrentUserService`'s `UserId` (string) was failing Entity Framework constraints for the Application User ID (`Guid`).
   - *Fix*: Created a `UserIdGuid` property in `ICurrentUserService` and refactored backend Handlers to correctly cast the authenticated user ID as a `Guid` before executing EF queries.
2. **Missing `Value` parsing on Nullable Guids**: Refactoring code to use `Guid?` introduced compile errors when comparing with EF Entities.
   - *Fix*: Correctly used `.Value` when assigning to Entity `UserId` columns.

## Outstanding Items for the Next Phase
- **Phase 6 — Spaced Repetition (Flashcards) & Grammar Modules**

## What Was Built (Phase 6)
- **Review Session (Backend & Frontend)**: Added `StartReviewSessionCommand`, `SubmitReviewResultCommand`, and related queries. Frontend features `/review/start` for configuration and `/review/session/[id]` for the actual session. Three modes: Flash Cards, Multiple Choice Quiz, and Type Answer.
- **Grammar Management**: `GrammarRule` and `GrammarExample` entities with full CRUD operations. Frontend page `/grammar` with expandable examples and a clean `GrammarModal`.
- **Grammar Test**: Auto-generated tests to deduce the correct grammar rule based on an example sentence.
- **Sentence Structure Management**: `SentenceStructure` and `SentenceStructureExample` entities with CRUD operations. Frontend mapping via `/structures` and `StructureModal`.
- **Sentence Structure Test**: Similar to grammar test, challenging users to map an example sentence to its structural pattern.

## Outstanding Items for the Next Phase
- **Phase 7 — TBD**
  - Proceed with the next major feature (e.g., Dashboard/Progress Tracking, Advanced Algorithms, or other modules).
