using System;
using System.Collections.Generic;
using YK.Common;

namespace YK.Domain
{
    public class SentenceStructure : BaseEntity
    {
        public string Pattern { get; set; } = string.Empty;
        public string VietnameseMeaning { get; set; } = string.Empty;

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid LanguageId { get; set; }
        public Language Language { get; set; } = null!;

        // Navigation properties
        public ICollection<SentenceStructureExample> Examples { get; set; } = new List<SentenceStructureExample>();
    }
}
