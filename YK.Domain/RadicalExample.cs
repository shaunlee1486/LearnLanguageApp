using System;
using YK.Common;

namespace YK.Domain
{
    public class RadicalExample : BaseEntity
    {
        public Guid RadicalId { get; set; }
        public Radical Radical { get; set; } = null!;

        public string Word { get; set; } = string.Empty;
        public string VietnameseMeaning { get; set; } = string.Empty;
    }
}
