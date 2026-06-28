using System;
using YK.Common;

namespace YK.Domain
{
    public class UserLanguage : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid LanguageId { get; set; }
        public Language Language { get; set; } = null!;
    }
}
