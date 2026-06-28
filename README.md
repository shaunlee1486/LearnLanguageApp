# YK Language Learning Application

A full-stack, enterprise-grade language learning application built using Clean Architecture principles. It features custom Spaced Repetition (SM-2) algorithms, real-time metrics, interactive canvas character drawing (for Chinese/Japanese), and extensive test building capabilities.

## Tech Stack

### Backend
- **Framework:** .NET 10 ASP.NET Core Web API
- **Architecture:** Clean Architecture (Domain, Application, Infrastructure, Presentation)
- **Patterns:** CQRS using MediatR, Repository Pattern, Unit of Work
- **Database:** PostgreSQL (with EF Core)
- **Authentication:** JWT Bearer Authentication
- **Object Mapping:** AutoMapper
- **Containerization:** Docker & Docker Compose

### Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS + Lucide Icons
- **State Management:** Zustand
- **Data Fetching:** Axios
- **Interactive UI:** Hanzi-Writer (Canvas Character drawing), Recharts (Dashboard)
- **Toast Notifications:** React Hot Toast

## Prerequisites
- Docker & Docker Compose
- Node.js v20+ (if running frontend locally)
- .NET 10 SDK (if running backend locally)

## Quick Start (Docker)

1. Create an `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Spin up the entire stack using Docker Compose:
   ```bash
   docker-compose up --build -d
   ```

3. The application will be available at:
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:5000/api/v1
   - **Swagger UI:** http://localhost:5000/swagger

*Note: Database migrations are automatically applied on startup. Seed data (including 214 Chinese Radicals) is automatically injected.*

## Features
- **Multi-Language Support:** Learn Chinese, Japanese, French, Spanish, etc.
- **Smart Vocabulary Lists:** Add words, grammar rules, and sentence structures.
- **Spaced Repetition (SM-2):** Flashcards use scientifically proven intervals.
- **Custom Test Builder:** Mix vocab, grammar, and structures into a timed exam.
- **Radicals Module:** Interactive animated stroke tracing for Chinese/Japanese characters.
- **User Dashboard:** Track daily study time, streaks, and view test score histories.

## Development

**Backend (Local)**
```bash
cd YK.API
dotnet run
```

**Frontend (Local)**
```bash
cd yk-frontend
npm install
npm run dev
```

## Architecture
- `YK.Domain`: Core entities, Enums, and common interfaces.
- `YK.Application`: DTOs, CQRS Handlers (MediatR), and abstract interfaces (IRepository).
- `YK.Infrastructure`: EF Core DbContext, Migrations, and implementations of IRepository.
- `YK.Presentation`: ASP.NET Core Controllers acting as the API layer.
- `YK.API`: The composition root, wiring up dependency injection and hosting the app.
- `yk-frontend`: The Next.js React application.
