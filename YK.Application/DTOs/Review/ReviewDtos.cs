using System;
using System.Collections.Generic;
using YK.Domain.Enums;
using YK.Application.DTOs.Word;

namespace YK.Application.DTOs.Review
{
    public class ReviewSessionDto
    {
        public Guid Id { get; set; }
        public Guid LanguageId { get; set; }
        public DateTime StartTime { get; set; }
        public StudyMode Mode { get; set; }
        public List<ReviewWordDto> Words { get; set; } = new();
    }

    public class ReviewWordDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string? IPA { get; set; }
        public string? AudioUrl { get; set; }
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        public WordStatus Status { get; set; }
        
        public List<WordMeaningDto> Meanings { get; set; } = new();
        public List<WordExampleDto> Examples { get; set; } = new();
    }

    public class ReviewResultItemDto
    {
        public Guid WordId { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class ReviewSummaryDto
    {
        public int TotalWords { get; set; }
        public int CorrectCount { get; set; }
        public double ScorePercentage { get; set; }
        public int DurationSeconds { get; set; }
    }
}
