using System;
using YK.Common;
using YK.Domain.Enums;

namespace YK.Domain
{
    public class TestResult : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid LanguageId { get; set; }
        public Language Language { get; set; } = null!;

        public TestType TestType { get; set; }
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public int Duration { get; set; } // duration in seconds
        public string? ConfigSnapshot { get; set; } // JSON formatted settings snapshot
        public DateTime TakenAt { get; set; } = DateTime.UtcNow;
    }
}
