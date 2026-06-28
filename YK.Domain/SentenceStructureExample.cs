using System;
using YK.Common;

namespace YK.Domain
{
    public class SentenceStructureExample : BaseEntity
    {
        public Guid SentenceStructureId { get; set; }
        public SentenceStructure SentenceStructure { get; set; } = null!;

        public string Sentence { get; set; } = string.Empty;
        public string Meaning { get; set; } = string.Empty;
    }
}
