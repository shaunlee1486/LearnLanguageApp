using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;

namespace YK.Application.Languages.Commands
{
    public class AddUserLanguageCommandHandler : IRequestHandler<AddUserLanguageCommand, ApiResponse<bool>>
    {
        private readonly IRepository<UserLanguage> _userLanguageRepository;
        private readonly IRepository<Language> _languageRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public AddUserLanguageCommandHandler(
            IRepository<UserLanguage> userLanguageRepository,
            IRepository<Language> languageRepository,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _userLanguageRepository = userLanguageRepository;
            _languageRepository = languageRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<ApiResponse<bool>> Handle(AddUserLanguageCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (!userId.HasValue)
            {
                return ApiResponse<bool>.FailureResult("Unauthorized");
            }

            // Check if language exists
            var language = await _languageRepository.GetByIdAsync(request.LanguageId, cancellationToken);
            if (language == null)
            {
                return ApiResponse<bool>.FailureResult("Language not found");
            }

            // Check if already added
            var existing = await _userLanguageRepository.Query()
                .FirstOrDefaultAsync(ul => ul.UserId == userId.Value && ul.LanguageId == request.LanguageId, cancellationToken);

            if (existing != null)
            {
                return ApiResponse<bool>.SuccessResult(true, "Language already added to user");
            }

            var userLanguage = new UserLanguage
            {
                UserId = userId.Value,
                LanguageId = request.LanguageId
            };

            await _userLanguageRepository.AddAsync(userLanguage, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<bool>.SuccessResult(true, "Language added to user successfully");
        }
    }
}


