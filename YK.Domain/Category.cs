using System;
using System.Collections.Generic;
using YK.Common;

namespace YK.Domain
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid LanguageId { get; set; }
        public Language Language { get; set; } = null!;

        public ICollection<Word> Words { get; set; } = new List<Word>();
    }
}
