using System;
using YK.Common;
using YK.Domain.Enums;

namespace YK.Domain
{
    public class StudySession : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid LanguageId { get; set; }
        public Language Language { get; set; } = null!;

        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public StudyMode Mode { get; set; }
    }
}
