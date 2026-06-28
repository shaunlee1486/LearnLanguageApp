# Implementation Plan — Sub-Task Auditing & Gaps Resolution (DbUp Migrations Only)

This implementation plan details the findings of auditing the project codebase against the sub-tasks defined in [PLAN.md](file:///d:/DotNet/LearnLanguageApp/PLAN.md) and outlines the steps to resolve the identified gaps.

As per user constraints, **EF Core migrations will be completely avoided/removed**. Database schema management and migrations will strictly run via the SQL-based **`YK.Migration` (DbUp) project**.

## Summary of Findings & Gaps

Following a thorough phase-by-phase code analysis, several critical discrepancies between the planned sub-tasks and the actual codebase were identified:

1. **Database Schema Out of Sync in DbUp:**
   - The DbUp schema script `001_CreateTables.sql` in `YK.Migration` is missing schema updates required by later phases:
     - **SM-2 Spaced Repetition (Phase 7):** `Words` table is missing `RepetitionCount` (int), `EasyFactor` (double), `Interval` (int), and `NextReviewDate` (timestamp).
     - **Streaks & Study tracking (Phase 7):** `Users` table is missing `CurrentStreak` (int), `LongestStreak` (int), and `LastStudyDate` (timestamp).
     - **Custom Test Settings (Phase 8):** `Users` table is missing `CustomTestQuestionLimit` (int) and `CustomTestTimerSeconds` (int).
     - **Sentence Structure Example (Phase 6):** `SentenceStructureExamples` table is missing `Meaning` (text) column.
   - **EF Core Migrations Folder Present:** The folder `YK.Infrastructure/Migrations` contains EF Core migration files, which are not used and should be deleted to prevent project bloat.

2. **Docker DevOps Gaps (Phase 8):**
   - The `migrate` container service is **missing** from `docker-compose.yml`.
   - The `YK.Migration` project does not have a `Dockerfile` to build the runner.
   - The connection strings in `YK.API/Program.cs` and `YK.Migration/Program.cs` do not support dynamic configuration via Docker environment variables (e.g. `DB_HOST`, `DB_NAME`, etc.), which would lead to connection failures inside container networks.

3. **Layout & Navigation Gaps (Phase 4):**
   - The collapsible **Sidebar navigation** (Task 4.5.1) is not implemented. Navigation is only possible from the dashboard layout.

4. **Vocabulary & Pronunciation Gaps (Phase 5):**
   - Client-side auto-fetch for **Chinese Pinyin/IPA** (Task 5.5.3) and **Japanese Romaji/Furigana** (Task 5.5.4) is not implemented.
   - The **Web Speech API fallback** (Task 5.5.5) for Chinese/Japanese pronunciation playback is missing.

5. **Missing Category Service (Task 4.4):**
   - `services/categoryService.ts` is missing in the frontend project. Currently, the category API calls are directly embedded in `categoryStore.ts`. We need to move them to a dedicated service file.

6. **Phase 7 Gaps (Dashboard Stats, Visual Charts, Custom Test, and Radicals):**
   - We must completely **re-implement/verify all sub-tasks in Phase 7** to match the specifications in `PLAN.md`:
     - Dashboard stats endpoints (`/api/v1/dashboard/study-time`, `/api/v1/dashboard/word-status`, `/api/v1/dashboard/exam-scores`) are not fully separated.
     - Dashboard charts (study time line chart, word status pie chart, exam scores bar chart) utilizing `recharts` are completely missing.
     - Custom test configuration, session countdown, auto-submission, results, and history pages need full auditing/re-implementation.
     - Radicals module endpoints, stroke canvas, quiz pages need auditing and clean implementation.

---

## Proposed Changes

### 1. Database & DevOps Scaffolding

#### [DELETE] [YK.Infrastructure/Migrations](file:///d:/DotNet/LearnLanguageApp/YK.Infrastructure/Migrations)
- Completely delete the EF Core migrations directory.

#### [MODIFY] [001_CreateTables.sql](file:///d:/DotNet/LearnLanguageApp/YK.Migration/Scripts/001_CreateTables.sql)
- Update the initial table definitions to include the missing columns for new database setups:
  - Add `Meaning TEXT NOT NULL` to `SentenceStructureExamples` table.
  - Add `RepetitionCount INT NOT NULL DEFAULT 0`, `EasyFactor DOUBLE PRECISION NOT NULL DEFAULT 2.5`, `Interval INT NOT NULL DEFAULT 0`, `NextReviewDate TIMESTAMP WITH TIME ZONE` to `Words` table.
  - Add `CurrentStreak INT NOT NULL DEFAULT 0`, `LongestStreak INT NOT NULL DEFAULT 0`, `LastStudyDate TIMESTAMP WITH TIME ZONE`, `CustomTestQuestionLimit INT NOT NULL DEFAULT 15`, `CustomTestTimerSeconds INT NOT NULL DEFAULT 300` to `Users` table.

#### [NEW] [002_AddSM2_Streaks_TestSettings.sql](file:///d:/DotNet/LearnLanguageApp/YK.Migration/Scripts/002_AddSM2_Streaks_TestSettings.sql)
- Create a migration script to alter existing tables for cases where the database is already running:
  - Add missing columns if they don't exist to ensure smooth database migrations.

#### [NEW] [Dockerfile](file:///d:/DotNet/LearnLanguageApp/YK.Migration/Dockerfile)
- Create a multi-stage Dockerfile for `YK.Migration` that builds the DbUp console app and runs it on start.

#### [MODIFY] [Program.cs](file:///d:/DotNet/LearnLanguageApp/YK.Migration/Program.cs)
- Read database connection configuration from environment variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` if present, to build the connection string dynamically.

#### [MODIFY] [Program.cs](file:///d:/DotNet/LearnLanguageApp/YK.API/Program.cs)
- Dynamically build the connection string from environment variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` when available.

#### [MODIFY] [docker-compose.yml](file:///d:/DotNet/LearnLanguageApp/docker-compose.yml)
- Add a `migrate` service built from `YK.Migration/Dockerfile`.
- Configure backend container to depend on the successful completion of the `migrate` service.

---

### 2. Frontend Layout & Navigation

#### [NEW] [Sidebar.tsx](file:///d:/DotNet/LearnLanguageApp/yk-frontend/components/layout/Sidebar.tsx)
- Create a modern navigation sidebar including links to Dashboard, Categories, Review, Grammar, Structures, Test Builder, and Radicals (conditionally visible for Chinese/Japanese).

#### [MODIFY] [layout.tsx](file:///d:/DotNet/LearnLanguageApp/yk-frontend/app/(main)/layout.tsx)
- Integrate the `Sidebar` alongside `children` to display the navigation options clearly.

#### [MODIFY] [AppHeader.tsx](file:///d:/DotNet/LearnLanguageApp/yk-frontend/components/layout/AppHeader.tsx)
- Adjust the layout and spacing to integrate smoothly with the new sidebar.

---

### 3. Chinese/Japanese Auto-Fetch & Web Speech API

#### [MODIFY] [package.json](file:///d:/DotNet/LearnLanguageApp/yk-frontend/package.json)
- Add client-side text processing packages `pinyin-pro` and `wanakana`.

#### [MODIFY] [WordFormModal.tsx](file:///d:/DotNet/LearnLanguageApp/yk-frontend/components/words/WordFormModal.tsx)
- Integrate client-side conversion logic in `handleLookup` for Chinese and Japanese:
  - For Chinese: convert characters to Pinyin (using `pinyin-pro`).
  - For Japanese: convert kanji/kana to Romaji (using `wanakana`).
- Implement Web Speech API fallback for playing audio when `audioUrl` is empty:
  - Detect selected language (`zh-CN` or `ja-JP`) and use browser speech synthesis.

#### [MODIFY] [FlashCardsMode.tsx](file:///d:/DotNet/LearnLanguageApp/yk-frontend/components/review/FlashCardsMode.tsx)
- Fallback to Web Speech API when playing pronunciation audio for Chinese (`zh-CN`) and Japanese (`ja-JP`) words if `audioUrl` is empty.

#### [MODIFY] [QuizMode.tsx](file:///d:/DotNet/LearnLanguageApp/yk-frontend/components/review/QuizMode.tsx) & [TypeAnswerMode.tsx](file:///d:/DotNet/LearnLanguageApp/yk-frontend/components/review/TypeAnswerMode.tsx)
- Add Web Speech API fallbacks for audio playback.

---

### 4. Category Service Extraction (Task 4.4)

#### [NEW] [categoryService.ts](file:///d:/DotNet/LearnLanguageApp/yk-frontend/services/categoryService.ts)
- Create a dedicated file for category CRUD API operations (`getCategories`, `createCategory`, `updateCategory`, `deleteCategory`).

#### [MODIFY] [categoryStore.ts](file:///d:/DotNet/LearnLanguageApp/yk-frontend/stores/categoryStore.ts)
- Refactor the Zustand store to use `categoryService` for database operations rather than calling axios directly.

---

### 5. Re-implement Phase 7 (All Sub-Tasks)

We will re-implement all backend and frontend aspects of Phase 7 to align with the plan:

#### A. Backend Dashboard Stats
- **`GetDailyStudyTimeQuery` / `GetWordStatusDistributionQuery` / `GetExamScoreHistoryQuery`**: Create three separate application queries to aggregate metrics.
- **`DashboardController`**: Expose `/api/v1/dashboard/study-time`, `/api/v1/dashboard/word-status`, and `/api/v1/dashboard/exam-scores` endpoints.

#### B. Frontend Visual Charts (Recharts)
- **`package.json`**: Add `recharts`.
- **`dashboard/page.tsx`**: Add `recharts` visual components to draw:
  1. Study Time (Line chart)
  2. Word Status (Pie/donut chart)
  3. Exam Scores (Bar/histogram chart)
  - Bind charts and summary cards dynamically to new backend queries.

#### C. Custom Test Builder
- **Backend Custom Test CQRS**: Implement queries and commands to get/set custom test configurations, generate N random questions across modules, submit test answers, and fetch past test result history.
- **`CustomTestController`**: Expose `/api/v1/test/settings`, `/api/v1/test/generate`, `/api/v1/test/submit`, `/api/v1/test/history`.
- **Frontend Test Builder pages**: Build `/test` layout, `/test/session` with countdown timer component and auto-submit logic on expiration, results breakdown, and `/test/history` historical overview page.

#### D. Radicals Module
- **Backend Radicals**: Group Kangxi radicals by stroke, map detail examples, and expose randomized quiz generator/submit endpoints in `RadicalController`. Implement language restriction filters.
- **Frontend Radicals**: Group radicals layout, detail modal, trace strokes Order animation and manual tracing canvas (via `hanzi-writer`), character quiz page, and sidebar link conditional visibility.

---

## Verification Plan

### Automated Tests
- Build and verify that all C# backend projects compile correctly:
  `dotnet build YK.LanguageLearn.slnx`
- Verify that the Next.js frontend builds without TypeScript/ESLint errors:
  `npm run build` inside `yk-frontend`

### Manual Verification
1. **Database Schema:** Run `YK.Migration` console project locally and verify the resulting table schemas in PostgreSQL (confirming that `Words`, `Users`, and `SentenceStructureExamples` tables contain the new columns).
2. **Docker Compose:** Spin up the services via `docker-compose up --build` and verify the `migrate` container finishes successfully and backend initializes without DB errors.
3. **Layout:** Log into the app, check that the Sidebar navigation is visible, correctly styled, and highlights the current active route.
4. **Auto-Fetch & Fallback Playback:** In category page, open Add Word Modal.
   - For English: type "banana", check auto-fetch pulls IPA and audio.
   - For Chinese: switch active language to Chinese, type "学习", check auto-fetch generates pinyin in IPA field, and clicking play speaks "学习".
   - For Japanese: switch to Japanese, type "日本語", check romaji generation and Web Speech API audio playback.
5. **Category Service:** Perform category CRUD, verify that API calls flow correctly through `categoryService` and store updates properly in the UI.
6. **Dashboard Visual Charts:** View the dashboard page, confirm that the three Recharts visual charts render cleanly, show mock/real database stats, and update correctly when changing the active language.
7. **Custom Test & Radicals Tracing:** Complete custom test sessions with timer validation, and test radical canvas animations/tracing and quizzes to confirm all sub-tasks in Phase 7 are fully functioning.
