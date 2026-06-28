using System;
using YK.Common;

namespace YK.Domain
{
    public class GrammarExample : BaseEntity
    {
        public Guid GrammarRuleId { get; set; }
        public GrammarRule GrammarRule { get; set; } = null!;

        public string Sentence { get; set; } = string.Empty;
    }
}
