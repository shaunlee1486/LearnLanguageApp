using System;
using System.Collections.Generic;
using YK.Common;

namespace YK.Domain
{
    public class ReviewList : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid LanguageId { get; set; }
        public Language Language { get; set; } = null!;

        // Navigation properties
        public ICollection<ReviewListWord> ReviewListWords { get; set; } = new List<ReviewListWord>();
    }
}
