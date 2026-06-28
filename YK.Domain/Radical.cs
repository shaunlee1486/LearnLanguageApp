using System.Collections.Generic;
using YK.Common;

namespace YK.Domain
{
    public class Radical : BaseEntity
    {
        public string Character { get; set; } = string.Empty;
        public int StrokeCount { get; set; }
        public string VietnameseMeaning { get; set; } = string.Empty;
        public string? Pinyin { get; set; }
        public string? Reading { get; set; }

        // Navigation properties
        public ICollection<RadicalExample> Examples { get; set; } = new List<RadicalExample>();
    }
}
