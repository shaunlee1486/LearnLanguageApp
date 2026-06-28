using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Auth.DTOs;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Auth.Commands
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, ApiResponse<AuthResponseDto>>
    {
        private readonly UserManager<User> _userManager;
        private readonly IJwtService _jwtService;
        private readonly IRepository<RefreshToken> _refreshTokenRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RefreshTokenCommandHandler(
            UserManager<User> userManager,
            IJwtService jwtService,
            IRepository<RefreshToken> refreshTokenRepository,
            IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _jwtService = jwtService;
            _refreshTokenRepository = refreshTokenRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var principal = _jwtService.GetPrincipalFromExpiredToken(request.AccessToken);
            if (principal == null)
            {
                return ApiResponse<AuthResponseDto>.FailureResult("Invalid access token.");
            }

            var userIdString = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                return ApiResponse<AuthResponseDto>.FailureResult("Invalid access token.");
            }

            var user = await _userManager.FindByIdAsync(userIdString);
            if (user == null)
            {
                return ApiResponse<AuthResponseDto>.FailureResult("User not found.");
            }

            var pagedResult = await _refreshTokenRepository.GetPagedAsync(1, 1, rt => rt.Token == request.RefreshToken && rt.UserId == userId);
            var existingToken = pagedResult.Items.FirstOrDefault();

            if (existingToken == null || existingToken.IsRevoked || existingToken.ExpiresAt <= DateTime.UtcNow)
            {
                return ApiResponse<AuthResponseDto>.FailureResult("Invalid or expired refresh token.");
            }

            // Revoke current refresh token
            existingToken.IsRevoked = true;
            _refreshTokenRepository.Update(existingToken);

            // Issue new tokens
            var newAccessToken = _jwtService.GenerateAccessToken(user);
            var newRefreshTokenString = _jwtService.GenerateRefreshToken();

            var newRefreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = newRefreshTokenString,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = user.Id.ToString()
            };

            await _refreshTokenRepository.AddAsync(newRefreshToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshTokenString
            };

            return ApiResponse<AuthResponseDto>.SuccessResult(response);
        }
    }
}
