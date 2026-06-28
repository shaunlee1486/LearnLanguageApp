using System;
using YK.Common;

namespace YK.Domain
{
    public class ReviewListWord : BaseEntity
    {
        public Guid ReviewListId { get; set; }
        public ReviewList ReviewList { get; set; } = null!;

        public Guid WordId { get; set; }
        public Word Word { get; set; } = null!;
    }
}
