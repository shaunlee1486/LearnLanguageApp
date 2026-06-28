using System;
using System.Collections.Generic;

namespace YK.Application.DTOs.Dashboard
{
    public class DashboardStatsDto
    {
        public int TotalWordsLearned { get; set; }
        public int TotalWordsKnown { get; set; }
        public int WordsDueForReview { get; set; }
        public int TotalGrammars { get; set; }
        public int TotalStructures { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public List<RecentTestScoreDto> RecentTestScores { get; set; } = new();
    }

    public class RecentTestScoreDto
    {
        public string TestType { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime TakenAt { get; set; }
    }

    public class DailyStudyTimeDto
    {
        public string Date { get; set; } = string.Empty;
        public double Minutes { get; set; }
    }

    public class WordStatusDistributionDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class ExamScoreDto
    {
        public Guid Id { get; set; }
        public string TestType { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public double Percentage => TotalQuestions > 0 ? Math.Round((double)Score / TotalQuestions * 100, 1) : 0;
        public DateTime TakenAt { get; set; }
    }
}
