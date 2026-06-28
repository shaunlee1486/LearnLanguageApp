# Phase 2 Implementation Walkthrough

We have successfully defined all domain entities, enums, EF Core configuration, repositories, unit of work, and database migration scripts for the YK Language Learning Web Application.

---

## 1. Changes Made

### Domain Layer & Enums (`YK.Domain`)
- Created Domain enums in [Enums](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Enums/):
  - [WordStatus.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Enums/WordStatus.cs): `NotLearned`, `Learned`, `AlreadyKnown`
  - [TypeOfWord.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Enums/TypeOfWord.cs): `Noun`, `Verb`, `Adjective`, `Adverb`, `Preposition`, `Conjunction`, `Other`
  - [StudyMode.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Enums/StudyMode.cs): `FlashCards`, `Quiz`, `TypeAnswer`
  - [TestType.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Enums/TestType.cs): `Vocabulary`, `Grammar`, `SentenceStructure`, `Custom`
  - [ReviewSubMode.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Enums/ReviewSubMode.cs): `WordToVietnamese`, `VietnameseToWord`, `SoundOrIPAToWord`
- Created Domain entities in [YK.Domain](file:///d:/DotNet/LearnLanguageApp/YK.Domain/):
  - [User.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/User.cs) extending `IdentityUser<Guid>` with custom fields (`DisplayName`, `AvatarUrl`, `ActiveLanguageId`) and audit properties.
  - [Role.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Role.cs) extending `IdentityRole<Guid>`.
  - [Language.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Language.cs) for target languages.
  - [UserLanguage.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/UserLanguage.cs) join entity for users learning languages.
  - [Category.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Category.cs) for vocabulary lists grouping.
  - [Word.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Word.cs), [WordMeaning.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/WordMeaning.cs), and [WordExample.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/WordExample.cs) for rich vocabulary mapping.
  - [ReviewList.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/ReviewList.cs) and [ReviewListWord.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/ReviewListWord.cs) representing the review backlog.
  - [GrammarRule.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/GrammarRule.cs) and [GrammarExample.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/GrammarExample.cs) for grammar notes.
  - [SentenceStructure.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/SentenceStructure.cs) and [SentenceStructureExample.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/SentenceStructureExample.cs) for pattern learning.
  - [StudySession.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/StudySession.cs) and [TestResult.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/TestResult.cs) tracking session diagnostics.
  - [Radical.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/Radical.cs) and [RadicalExample.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/RadicalExample.cs) for radical characters.
  - [RefreshToken.cs](file:///d:/DotNet/LearnLanguageApp/YK.Domain/RefreshToken.cs) for token rotations.

### EF Core Configuration (`YK.Infrastructure`)
- Implemented [AppDbContext.cs](file:///d:/DotNet/LearnLanguageApp/YK.Infrastructure/AppDbContext.cs) inheriting from `IdentityDbContext<User, Role, Guid>` mapping all DbSets.
- Standardized entity configurations in [Configurations.cs](file:///d:/DotNet/LearnLanguageApp/YK.Infrastructure/Configurations/Configurations.cs) defining primary/foreign keys, properties lengths, unique indexes, and mappings.
- Wrote [AuditSaveChangesInterceptor.cs](file:///d:/DotNet/LearnLanguageApp/YK.Infrastructure/Interceptors/AuditSaveChangesInterceptor.cs) saving audit timestamps and creator references automatically.
- Integrated database renames (`AspNetUsers` -> `Users`, etc.) and a global query filter for `IsDeleted` (soft delete) in `OnModelCreating`.

### Repository & Unit of Work (`YK.Application` & `YK.Infrastructure`)
- Wrote generic repository interface [IRepository.cs](file:///d:/DotNet/LearnLanguageApp/YK.Application/Interfaces/IRepository.cs) and unit of work interface [IUnitOfWork.cs](file:///d:/DotNet/LearnLanguageApp/YK.Application/Interfaces/IUnitOfWork.cs) in the Application layer.
- Implemented [Repository.cs](file:///d:/DotNet/LearnLanguageApp/YK.Infrastructure/Repositories/Repository.cs) and [UnitOfWork.cs](file:///d:/DotNet/LearnLanguageApp/YK.Infrastructure/Repositories/UnitOfWork.cs) using EF Core db context in the Infrastructure layer.
- Hooked all database, identity, repository and unit of work registrations in [Program.cs](file:///d:/DotNet/LearnLanguageApp/YK.API/Program.cs).

### DbUp Migrations (`YK.Migration`)
- Programmed [Program.cs](file:///d:/DotNet/LearnLanguageApp/YK.Migration/Program.cs) to parse connection strings and sequence schema creation, default seeds, and development sample seeds correctly.
- Wrote SQL scripts:
  - [001_CreateTables.sql](file:///d:/DotNet/LearnLanguageApp/YK.Migration/Scripts/001_CreateTables.sql) (schema DDL, indexes, keys)
  - [001_SeedLanguages.sql](file:///d:/DotNet/LearnLanguageApp/YK.Migration/SeedData/001_SeedLanguages.sql) (seeded English, Chinese, Japanese)
  - [002_SeedRadicals.sql](file:///d:/DotNet/LearnLanguageApp/YK.Migration/SeedData/002_SeedRadicals.sql) (seeded Kangxi radicals)
  - [001_SampleUsers.sql](file:///d:/DotNet/LearnLanguageApp/YK.Migration/SampleData/001_SampleUsers.sql) (seeded dev users with correctly-hashed credentials)
  - [002_SampleWords.sql](file:///d:/DotNet/LearnLanguageApp/YK.Migration/SampleData/002_SampleWords.sql) (seeded sample categories, words, examples, meanings)

---

## 2. Verification Results

### compilation
- Ran `dotnet build YK.LanguageLearn.slnx`
- **Result:** Successfully compiled with `0 error(s)` and `0 warning(s)`.

### Migrations
- Started `yk-db` PostgreSQL container and ran `dotnet run --project YK.Migration`
- **Result:** Schema tables created, default languages + radicals seeded, and sample users/words populated. All upgrade logs returned `Upgrade successful`.

### Runtime DI Verification
- Ran `dotnet run --project YK.API`
- **Result:** Successfully started up without any runtime DI or EF Core registration warnings.
