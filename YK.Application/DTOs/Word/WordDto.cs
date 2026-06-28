using System;
using System.Collections.Generic;

namespace YK.Application.DTOs.Word
{
    public class WordDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string? IPA { get; set; }
        public string? AudioUrl { get; set; }
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        public string Status { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public DateTime CreatedDate { get; set; }

        public List<WordMeaningDto> Meanings { get; set; } = new();
        public List<WordExampleDto> Examples { get; set; } = new();
    }
}

