# Phase 7: SM-2 Spaced Repetition & Dashboard

Phase 7 introduces an intelligent study algorithm (SM-2) for vocabulary reviews and an aesthetically pleasing Dashboard to track learning progress and streaks.

## Changes Made

### 1. Spaced Repetition Algorithm (SM-2)
- Added tracking fields to the `Word` domain entity:
  - `RepetitionCount`
  - `EasyFactor`
  - `Interval`
  - `NextReviewDate`
- Refactored `SubmitReviewResultCommand`:
  - When you answer correctly, the interval increases exponentially using the `EasyFactor`.
  - When you answer incorrectly, the `Interval` resets to 1, and the `EasyFactor` drops, scheduling it for the next day.
  - Automatically moves words to `AlreadyKnown` state after 4 successful repetitions.
- Updated `StartReviewSessionCommand` to fetch words prioritized by their `NextReviewDate` (due words first).

### 2. User Learning Streaks
- Added streak tracking to the `User` domain entity:
  - `CurrentStreak`
  - `LongestStreak`
  - `LastStudyDate`
- Created a shared application service (`UserStreakService`) that automatically recalculates and increments streaks.
- Hooked this service into vocabulary reviews, grammar tests, and sentence structure tests. Doing any of these will increase the user's daily streak.

### 3. Dashboard Overview Page
- Created a new backend endpoint `GET /api/v1/dashboard/stats` that aggregates:
  - Total words learned / known
  - Total grammar rules and sentence structures acquired
  - The number of words due for review today
  - The latest 5 test scores
  - Streak information
- Built the new `/dashboard` page in the Next.js frontend featuring:
  - A beautiful dynamic welcome banner that changes greeting based on the time of day.
  - Interactive "Quick Actions" to jump straight into due reviews or vocabulary.
  - A statistical summary of your knowledge base.
  - A clean "Recent Activity" list showing your latest test scores.
- Configured `/login` to route directly to the dashboard upon successful authentication.

## Verification
- Run the latest EF Core migrations to update the database schema.
- Upon logging in, the new Dashboard will be the default landing page.
- Complete a review session to verify that SM-2 intervals adjust and your learning streak increments!
