using System;
using System.Collections.Generic;
using YK.Common;

namespace YK.Domain
{
    public class Language : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string LocaleCode { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        public Guid? UserId { get; set; }
        public User? User { get; set; }

        // Navigation properties
        public ICollection<UserLanguage> UserLanguages { get; set; } = new List<UserLanguage>();
        public ICollection<Category> Categories { get; set; } = new List<Category>();
        public ICollection<Word> Words { get; set; } = new List<Word>();
        public ICollection<ReviewList> ReviewLists { get; set; } = new List<ReviewList>();
        public ICollection<GrammarRule> GrammarRules { get; set; } = new List<GrammarRule>();
        public ICollection<SentenceStructure> SentenceStructures { get; set; } = new List<SentenceStructure>();
        public ICollection<StudySession> StudySessions { get; set; } = new List<StudySession>();
        public ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
    }
}
