using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Domain;

namespace YK.Application.Services
{
    public class UserStreakService : IUserStreakService
    {
        private readonly IRepository<User> _userRepository;

        public UserStreakService(IRepository<User> userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task UpdateStreakAsync(Guid userId, CancellationToken cancellationToken)
        {
            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (user == null) return;

            var today = DateTime.UtcNow.Date;
            var lastStudy = user.LastStudyDate?.Date;

            if (lastStudy == null)
            {
                user.CurrentStreak = 1;
                if (user.LongestStreak == 0) user.LongestStreak = 1;
                user.LastStudyDate = DateTime.UtcNow;
            }
            else if (lastStudy < today)
            {
                if (lastStudy == today.AddDays(-1))
                {
                    // Consecutive day
                    user.CurrentStreak++;
                    if (user.CurrentStreak > user.LongestStreak)
                    {
                        user.LongestStreak = user.CurrentStreak;
                    }
                }
                else
                {
                    // Missed a day or more
                    user.CurrentStreak = 1;
                }
                
                user.LastStudyDate = DateTime.UtcNow;
            }
            
            // If lastStudy == today, we don't increment the streak, but we could update LastStudyDate timestamp if we wanted.
            
            _userRepository.Update(user);
        }
    }
}
