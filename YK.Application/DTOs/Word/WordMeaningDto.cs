using System;

namespace YK.Application.DTOs.Word
{
    public class WordMeaningDto
    {
        public Guid Id { get; set; }
        public string TypeOfWord { get; set; } = string.Empty;
        public string MeaningText { get; set; } = string.Empty;
    }
}

