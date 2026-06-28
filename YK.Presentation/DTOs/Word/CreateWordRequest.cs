using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace YK.Presentation.DTOs.Word
{
    public class CreateWordRequest
    {
        public string Text { get; set; } = string.Empty;
        public string? IPA { get; set; }
        public string? AudioUrl { get; set; }
        public string? Note { get; set; }
        public IFormFile? ImageFile { get; set; }
        
        // Use JSON string for complex objects when sending as multipart/form-data
        public string MeaningsJson { get; set; } = "[]"; 
        public string ExamplesJson { get; set; } = "[]";
    }

    public class CreateWordMeaningRequest
    {
        public string TypeOfWord { get; set; } = string.Empty;
        public string MeaningText { get; set; } = string.Empty;
    }

    public class CreateWordExampleRequest
    {
        public string Sentence { get; set; } = string.Empty;
    }
}
