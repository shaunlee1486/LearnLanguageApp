using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace YK.Domain
{
    public class User : IdentityUser<Guid>
    {
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public Guid? ActiveLanguageId { get; set; }
        public Language? ActiveLanguage { get; set; }

        // Auditing properties from BaseEntity
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "System";
        public DateTime? ModifiedDate { get; set; }
        public string? ModifiedBy { get; set; }
        public bool IsDeleted { get; set; } = false;

        // User streak and study tracking
        public int CurrentStreak { get; set; } = 0;
        public int LongestStreak { get; set; } = 0;
        public DateTime? LastStudyDate { get; set; }

        // Test Settings
        public int CustomTestQuestionLimit { get; set; } = 15;
        public int CustomTestTimerSeconds { get; set; } = 300;

        // Navigation properties
        public ICollection<UserLanguage> UserLanguages { get; set; } = new List<UserLanguage>();
        public ICollection<Category> Categories { get; set; } = new List<Category>();
        public ICollection<Word> Words { get; set; } = new List<Word>();
        public ICollection<ReviewList> ReviewLists { get; set; } = new List<ReviewList>();
        public ICollection<GrammarRule> GrammarRules { get; set; } = new List<GrammarRule>();
        public ICollection<SentenceStructure> SentenceStructures { get; set; } = new List<SentenceStructure>();
        public ICollection<StudySession> StudySessions { get; set; } = new List<StudySession>();
        public ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
