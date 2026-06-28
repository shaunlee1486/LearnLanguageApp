using System;
using Microsoft.AspNetCore.Http;

namespace YK.Presentation.DTOs.Word
{
    public class UpdateWordRequest
    {
        public string Text { get; set; } = string.Empty;
        public string? IPA { get; set; }
        public string? AudioUrl { get; set; }
        public string? Note { get; set; }
        
        public IFormFile? ImageFile { get; set; }
        public bool RemoveExistingImage { get; set; }

        public string MeaningsJson { get; set; } = "[]"; 
        public string ExamplesJson { get; set; } = "[]";
    }
}
