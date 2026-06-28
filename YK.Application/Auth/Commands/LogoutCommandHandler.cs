using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Auth.Commands
{
    public class LogoutCommandHandler : IRequestHandler<LogoutCommand, ApiResponse<bool>>
    {
        private readonly IRepository<RefreshToken> _refreshTokenRepository;
        private readonly IUnitOfWork _unitOfWork;

        public LogoutCommandHandler(IRepository<RefreshToken> refreshTokenRepository, IUnitOfWork unitOfWork)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            var pagedResult = await _refreshTokenRepository.GetPagedAsync(1, 1, rt => rt.Token == request.RefreshToken);
            var tokenEntity = pagedResult.Items.FirstOrDefault();

            if (tokenEntity != null && !tokenEntity.IsRevoked)
            {
                tokenEntity.IsRevoked = true;
                _refreshTokenRepository.Update(tokenEntity);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}

