using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Domain.Enums;

namespace YK.Application.SentenceStructures.Commands
{
    public class SubmitStructureTestCommand : IRequest<ApiResponse<Guid>>
    {
        public int TotalQuestions { get; set; }
        public int Score { get; set; }
        public int DurationSeconds { get; set; }
    }

    public class SubmitStructureTestCommandHandler : IRequestHandler<SubmitStructureTestCommand, ApiResponse<Guid>>
    {
        private readonly IRepository<TestResult> _testResultRepository;
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public SubmitStructureTestCommandHandler(
            IRepository<TestResult> testResultRepository,
            IRepository<User> userRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _testResultRepository = testResultRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<Guid>> Handle(SubmitStructureTestCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<Guid>.FailureResult(new List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<Guid>.FailureResult(new List<string> { "No active language selected" });

            var result = new TestResult
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                LanguageId = user.ActiveLanguageId.Value,
                TestType = TestType.SentenceStructure,
                Score = request.Score,
                TotalQuestions = request.TotalQuestions,
                Duration = request.DurationSeconds,
                TakenAt = DateTime.UtcNow,
                ConfigSnapshot = "{ \"Type\": \"SentenceStructureTest\" }"
            };

            await _testResultRepository.AddAsync(result);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<Guid>.SuccessResult(result.Id);
        }
    }
}
