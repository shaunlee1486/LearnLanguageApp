using System;
using YK.Common;
using YK.Domain.Enums;

namespace YK.Domain
{
    public class WordMeaning : BaseEntity
    {
        public Guid WordId { get; set; }
        public Word Word { get; set; } = null!;

        public TypeOfWord TypeOfWord { get; set; }
        public string MeaningText { get; set; } = string.Empty;
    }
}
