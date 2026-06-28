# Language Learning Website — Full Requirements

---

## 1. Project Naming Convention

All projects and solutions follow the prefix `YK.XXX`:

| Project | Role |
|---|---|
| `YK.LanguageLearn` | Solution file |
| `YK.Domain` | Entities, enums, domain interfaces |
| `YK.Application` | CQRS commands/queries, validators, interfaces |
| `YK.Infrastructure` | EF Core DbContext, repositories, UoW, external services |
| `YK.Presentation` | Controllers, request/response DTOs, mapping profiles, filters, middleware |
| `YK.API` | Entry point only — references YK.Presentation, configures host, DI registration, app startup |
| `YK.Migration` | DbUp migration runner (standalone console app) |
| `YK.Common` | Shared utilities, constants, base classes |
| `YK.FrontEnd` | Next.js frontend application |

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **UI Language:** Vietnamese (all labels, buttons, messages displayed in Vietnamese)

### Backend
- **Runtime:** C# .NET 10
- **Architecture:** Clean Architecture
- **Patterns:** Repository + Unit of Work, DI via interface everywhere
  - No static classes or methods for business logic
  - No direct `DbContext` injection outside of Infrastructure layer
- **Messaging:** MediatR (CQRS — Commands & Queries)
- **Validation:** FluentValidation
- **ORM:** Entity Framework Core

### Database
- **Engine:** PostgreSQL
- **Migrations:** DbUp
  - Packages: `dbup-core` + `dbup-postgresql`
  - Script folders: `Scripts/`, `SeedData/`, `SampleData/`
  - `SampleData/` only runs when `ASPNETCORE_ENVIRONMENT == "Development"`
  - Migration history tracked in default `schemaversions` table

### Presentation vs API Layer

- **YK.Presentation** owns all controllers, action filters, middleware, request/response DTOs, and AutoMapper/mapping profiles. It references `YK.Application` only — never `YK.Infrastructure` directly.
- **YK.API** is a thin host project: it references `YK.Presentation` and `YK.Infrastructure`, wires up DI, configures the ASP.NET Core pipeline (Swagger, CORS, auth middleware, global exception handling), and contains `Program.cs` / `appsettings.json`. It contains **no controllers or business logic**.

### Identity & Access
- **Provider:** ASP.NET Identity Core
- **Custom tables:** All Identity tables renamed, removing the `AspNet` prefix
  - e.g., `AspNetUsers` → `Users`, `AspNetRoles` → `Roles`

### Image Storage
- Check if the `S3_PRE_URL` environment variable is set
  - **If set:** store images in AWS S3, save the S3 URL in the database
  - **If not set:** store images locally under `wwwroot/uploads/`, save the relative path in the database

### ID Generation
- All entity IDs use **UUIDv7** (time-ordered, sortable UUIDs)

### Infrastructure / DevOps
- **Docker:** `Dockerfile` + `docker-compose.yml` (services: `db`, `migrate`, `be`, `fe`)
- **Environment config:** `.env.example` (template with all required variables, no secrets)
- **Docker ignore:** `.dockerignore` for each project

---

## 3. Base Entity Schema

Every database table must include these columns:

| Column | Type | Description |
|---|---|---|
| `Id` | `UUID` (UUIDv7) | Primary key |
| `CreatedDate` | `DateTime` | UTC timestamp when record was created |
| `CreatedBy` | `string` | Username or user ID who created the record |
| `ModifiedDate` | `DateTime` | UTC timestamp when record was last updated |
| `ModifiedBy` | `string` | Username or user ID who last modified the record |
| `IsDeleted` | `bool` | Soft delete flag; default `false` |

All queries must filter out `IsDeleted = true` by default (global query filter in EF Core).

---

## 4. Authentication & Authorization

### Endpoints
- **Sign up:** create a new account with email + password
- **Login:** return JWT access token + refresh token
- **Logout:** invalidate the current refresh token
- **Forgot password:** send a password-reset email with a time-limited token

### Rules
- Passwords hashed by ASP.NET Identity
- JWT-based authentication for all API calls
- Refresh token rotation on each use

---

## 5. Language Management

- The system ships with 3 default languages: **English**, **Chinese**, **Japanese**
- Users can add custom languages (name + locale code)
- Each user has a set of languages they are learning; all vocabulary, grammar, and statistics are scoped per language

---

## 6. Dashboard & Statistics

All charts are scoped to the currently selected language.

| Chart | Type | Description |
|---|---|---|
| Daily study time | Line chart | Minutes/hours spent studying per day (last 30 days) |
| Word knowledge status | Pie chart | Words split into: Not Learned / Learned / Already Known |
| Exam scores | Histogram | Distribution of test scores over time |

The backend automatically tracks:
- Session duration (start/end timestamps per study session)
- Word status changes (Not Learned → Learned → Already Known)
- Test results (score, date, config snapshot)

---

## 7. Categories

Users manage vocabulary categories (e.g., hobbies, farming, seasons, food).

| Action | Description |
|---|---|
| Create | Name + optional description |
| Read | List all user's categories |
| Update | Rename or edit description |
| Delete | Soft delete; words in the category are NOT deleted |

---

## 8. Vocabulary (Words)

### Word List View

- Displayed when a user selects a category
- Each row shows: checkbox (left), word, IPA, Vietnamese meaning, actions
- **Checkbox behavior:** selecting one or more words adds them to the **Review List**; if a word is already in the Review List, it is not added again (idempotent)
- **Add button:** opens a modal dialog to create a new word
- **Row actions:** edit icon (opens edit modal), delete icon (opens confirmation modal)

### Word Form (Modal Dialog)

| Field | Behavior |
|---|---|
| Word | Text input (required) |
| IPA + Sound | Auto-fetched on blur (focus-out) from external API; speaker icon to play audio |
| Vietnamese meanings | Multiple rows, each row has: type-of-word combobox + meaning text; add-row button to insert more |
| Example sentences | Multiple rows; add-row button to insert more |
| Image | File upload or URL |
| Note | Free text |
| Already Known | Checkbox — marks the word as "Already Known", skipping it in normal review queues |

### IPA & Sound Source

| Language | Romanization / IPA | Audio |
|---|---|---|
| English | `dictionaryapi.dev` — returns IPA string + audio URL | Audio file URL from `dictionaryapi.dev`; fallback to Web Speech API |
| Chinese | `pinyin-pro` (npm) auto-generates pinyin from hanzi → `pinyin2ipa` (npm) converts pinyin to IPA | Web Speech API (`zh-CN`); fallback: user plays TTS via speaker icon |
| Japanese | `kuroshiro` + `kuroshiro-analyzer-kuromoji` (npm) — converts kanji to romaji/furigana; `wanakana` for kana↔romaji | Web Speech API (`ja-JP`); fallback: user plays TTS via speaker icon |

**Auto-fetch behavior on `blur` of the Word input field:**

- **English:** call `dictionaryapi.dev` → populate IPA field + store audio URL → user can play via speaker icon. If API returns nothing, field stays empty and user can type manually.
- **Chinese:** run `pinyin-pro` on the hanzi client-side → populate pinyin field; run `pinyin2ipa` → populate IPA field. No external API call needed. Speaker icon triggers Web Speech API TTS.
- **Japanese:** run `kuroshiro` (server-side or client-side with bundled kuromoji dict) → populate reading/romaji field. IPA field is left editable for manual input (Japanese IPA is rarely used; romaji/furigana is the standard). Speaker icon triggers Web Speech API TTS (`ja-JP`).

**User can always manually edit** the IPA/reading field after auto-fill.

---

## 9. Word Review

Users can review vocabulary in three modes. Each session starts with a configuration screen.

### Session Configuration
- **Word limit:** number input, default 10
- **Priority order:** Not Learned → Learned → Already Known (system auto-ranks; user cannot override)
- **Sub-mode (for Type Answer):** word→Vietnamese / Vietnamese→word / sound-or-IPA→word (user selects)

### Mode 1 — Flash Cards
- Front: word + IPA + audio play button
- Back (on flip): Vietnamese meaning(s) + example sentence(s)
- Navigation: previous / next card
- User can mark a card "Already Known" directly from the flash card

### Mode 2 — Quiz (4 Choices)
- Prompt: word, IPA, or audio
- 4 multiple-choice options (Vietnamese meanings)
- Immediate feedback (correct / wrong highlighted)
- Progress bar showing cards remaining

### Mode 3 — Type Answer
- Sub-mode determines prompt direction (word→Vi / Vi→word / sound-or-IPA→word)
- Text input for the answer
- After submit: show whether correct, reveal the full word details (IPA, meanings, examples)

### After Session
- Summary screen: total words, correct count, score percentage
- Words marked as Already Known are updated in the database
- Session duration logged for the dashboard

---

## 10. Grammar

### CRUD
- Create a grammar rule with a name, description, and one or more examples (each example is a sentence)
- Read: list all grammar rules (paginated)
- Update: edit rule name, description, or examples
- Delete: soft delete

### Grammar Test
- System generates a multiple-choice test from the user's saved grammar rules
- Question types: identify the correct example, identify the rule that applies, fill the blank
- Results saved to test history

---

## 11. Sentence Structures

Pattern-based structures such as `S + have no + N`, `S + V + O + because + ...`

### CRUD
- Create: Sentence Structure text + Vietnamese meaning + multiple examples
- Read: list all user-defined structures (paginated)
- Update: edit structure, meaning, or examples
- Delete: soft delete

### Sentence Structure Test
- Multiple-choice questions generated from saved structures
- Results saved to test history

---

## 12. Custom Test Builder

Users can configure and run a mixed test combining vocabulary, grammar rules, and sentence structures.

### Settings (persisted in user profile)
| Setting | Default |
|---|---|
| Number of questions | 15 |
| Timer (seconds) | 300 |

### Test Format
- All questions are 4-choice multiple choice
- Questions are drawn randomly from: vocabulary words (the selected language), grammar rules, sentence structures
- Timer displayed as a countdown; test auto-submits when time expires
- Score, date, and settings snapshot saved to test history

---

## 13. Chinese / Japanese — Radicals Module

Available only when the user has selected **Chinese** or **Japanese** as their active language.

### Radical List
- Seed exactly **214 Chinese radicals** in `SeedData/`
- Each radical record includes: radical character, stroke count, Vietnamese meaning, pinyin/reading, example words (with Vietnamese meaning)
- Displayed grouped by stroke count (1 stroke, 2 strokes, …)

### Practice Modes

**Preview & Stroke Drawing**
- Show the radical with animated or step-by-step stroke order
- User can trace/draw each stroke on a canvas element (touch + mouse support)
- Feedback: correct stroke order vs incorrect

**Radical Quiz**
- 4-choice quiz: given a radical, choose the correct Vietnamese meaning
- Or reverse: given a Vietnamese meaning, choose the correct radical

---

## 14. API Design Conventions

- All endpoints versioned under `/api/v1/`
- All responses use a unified envelope: `{ success, data, errors, meta }`
- Pagination uses: `{ page, pageSize, totalCount, totalPages }`
- Dates are ISO 8601 UTC strings
- File uploads via `multipart/form-data`
- Global exception middleware returns consistent error shapes

---

## 15. Docker Setup

```
docker-compose.yml services:
  db        — PostgreSQL
  migrate   — YK.Migration (runs DbUp on startup, exits 0)
  be        — YK.API (starts after migrate)
  fe        — YK.FrontEnd (Next.js)
```

- `.env.example` documents all environment variables (DB connection string, JWT secret, S3 config, ASPNETCORE_ENVIRONMENT, etc.)
- `migrate` service depends on `db` health check; `be` depends on `migrate` completing successfully
- Each project has its own `.dockerignore`

---

## 16. Memory & Agent Verification

- After every development phase, a separate agent must verify the output:
  - Run the application (or relevant tests)
  - Check for build errors, runtime exceptions, and broken functionality
  - Fix any bugs found
  - Update `.claude/memory/MEMORY.md` with:
    - Phase completed
    - What was built
    - Known issues found and fixed
    - Outstanding items for the next phase
