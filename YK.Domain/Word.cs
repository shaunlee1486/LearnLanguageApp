using System;
using System.Collections.Generic;
using YK.Common;
using YK.Domain.Enums;

namespace YK.Domain
{
    public class Word : BaseEntity
    {
        public string Text { get; set; } = string.Empty;
        public string? IPA { get; set; }
        public string? AudioUrl { get; set; }
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        public WordStatus Status { get; set; } = WordStatus.NotLearned;

        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid LanguageId { get; set; }
        public Language Language { get; set; } = null!;

        // Navigation properties
        public ICollection<WordMeaning> Meanings { get; set; } = new List<WordMeaning>();
        public ICollection<WordExample> Examples { get; set; } = new List<WordExample>();
        public ICollection<ReviewListWord> ReviewListWords { get; set; } = new List<ReviewListWord>();
    }
}
