# Phase 7 Tasks (Re-implementation Plan)

- `[ ]` Task 7.1 - Backend: Dashboard Statistics
  - `[ ]` Create `GetDailyStudyTimeQuery` (study sessions minutes per day for last 30 days)
  - `[ ]` Create `GetWordStatusDistributionQuery` (word counts by status for active language)
  - `[ ]` Create `GetExamScoreHistoryQuery` (test results ordered by date)
  - `[ ]` Create `DashboardController` with endpoints:
    - `GET /api/v1/dashboard/study-time`
    - `GET /api/v1/dashboard/word-status`
    - `GET /api/v1/dashboard/exam-scores`

- `[ ]` Task 7.2 - Frontend: Dashboard Page
  - `[ ]` Install `recharts` package in Next.js app
  - `[ ]` Create Daily Study Time line chart (X: date, Y: minutes)
  - `[ ]` Create Word Status pie/donut chart (NotLearned, Learned, AlreadyKnown)
  - `[ ]` Create Exam Scores bar/histogram chart (Scores over time)
  - `[ ]` Implement summary cards (total words learned, study streak, total sessions, average score)
  - `[ ]` Ensure charts and stats update dynamically when active language changes

- `[ ]` Task 7.3 - Backend: Custom Test Builder
  - `[ ]` Create `GetTestSettingsQuery` and `UpdateTestSettingsCommand` (saved question count & timer settings)
  - `[ ]` Create `GenerateCustomTestQuery` (mix of vocabulary, grammar, and structures)
  - `[ ]` Create `SubmitCustomTestCommand` (calculates score, saves `TestResult` + snapshot)
  - `[ ]` Create `GetTestHistoryQuery` (paginated past results)
  - `[ ]` Implement `CustomTestController` with endpoints:
    - `GET /api/v1/test/settings`
    - `PUT /api/v1/test/settings`
    - `POST /api/v1/test/generate`
    - `POST /api/v1/test/submit`
    - `GET /api/v1/test/history`

- `[ ]` Task 7.4 - Frontend: Custom Test
  - `[ ]` Build `/test` configuration screen (question count, timer inputs)
  - `[ ]` Build `/test/session` page with countdown timer and 4-choice questions
  - `[ ]` Implement countdown timer component and auto-submit on expiration
  - `[ ]` Build Results summary page (breakdown by category, time taken)
  - `[ ]` Build `/test/history` past results page

- `[ ]` Task 7.5 - Backend: Radicals Module
  - `[ ]` Create `GetRadicalsQuery` (214 radicals grouped by stroke count)
  - `[ ]` Create `GetRadicalByIdQuery` (radical details + examples)
  - `[ ]` Create `GenerateRadicalQuizQuery` and `SubmitRadicalQuizCommand`
  - `[ ]` Implement `RadicalController` with endpoints
  - `[ ]` Implement access restriction (only Chinese/Japanese)

- `[ ]` Task 7.6 - Frontend: Radicals Pages
  - `[ ]` Build `/radicals` page (radicals grouped by stroke count)
  - `[ ]` Build Radical details modal
  - `[ ]` Integrate `hanzi-writer` for stroke drawing animation
  - `[ ]` Implement stroke validation tracing canvas
  - `[ ]` Build `/radicals/quiz` page
  - `[ ]` Implement conditional sidebar visibility (Chinese/Japanese only)

- `[ ]` Task 7.7 - Verification
  - `[ ]` Verify dashboard charts update with database data
  - `[ ]` Verify custom test builder and countdown timer auto-submits
  - `[ ]` Verify radicals quiz and tracing canvas
