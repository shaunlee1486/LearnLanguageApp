using System;
using System.Collections.Generic;

namespace YK.Application.DTOs.Tests
{
    public class CustomTestSessionDto
    {
        public int TimerSeconds { get; set; }
        public List<CustomTestQuestionDto> Questions { get; set; } = new();
    }

    public class CustomTestQuestionDto
    {
        public Guid SourceId { get; set; }
        public string SourceType { get; set; } = string.Empty; // "Word", "Grammar", "Structure"
        public string Prompt { get; set; } = string.Empty;
        public string? Hint { get; set; }
        public List<string> Options { get; set; } = new();
        public string CorrectAnswer { get; set; } = string.Empty;
    }

    public class CustomTestSubmitDto
    {
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public int DurationSeconds { get; set; }
    }
}
