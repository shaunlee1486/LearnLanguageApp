using System;
using System.Collections.Generic;
using YK.Common;

namespace YK.Domain
{
    public class GrammarRule : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid LanguageId { get; set; }
        public Language Language { get; set; } = null!;

        // Navigation properties
        public ICollection<GrammarExample> Examples { get; set; } = new List<GrammarExample>();
    }
}
