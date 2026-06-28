using System;
using YK.Common;

namespace YK.Domain
{
    public class WordExample : BaseEntity
    {
        public Guid WordId { get; set; }
        public Word Word { get; set; } = null!;

        public string Sentence { get; set; } = string.Empty;
    }
}
