using System;

namespace YK.Application.DTOs.Category
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public Guid LanguageId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int WordCount { get; set; } // We might not populate this initially, or we might count related Words
        public DateTime CreatedAt { get; set; }
    }
}
