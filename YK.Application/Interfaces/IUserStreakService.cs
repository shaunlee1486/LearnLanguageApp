using System.Threading;
using System.Threading.Tasks;

namespace YK.Application.Interfaces
{
    public interface IUserStreakService
    {
        Task UpdateStreakAsync(System.Guid userId, CancellationToken cancellationToken);
    }
}
