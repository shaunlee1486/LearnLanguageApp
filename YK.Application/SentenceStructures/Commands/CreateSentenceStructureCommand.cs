using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using YK.Application.Interfaces;
using YK.Common;
using YK.Domain;
using YK.Application.DTOs.SentenceStructure;

namespace YK.Application.SentenceStructures.Commands
{
    public class CreateSentenceStructureCommand : IRequest<ApiResponse<Guid>>
    {
        public CreateSentenceStructureRequest Data { get; set; } = null!;
    }

    public class CreateSentenceStructureCommandHandler : IRequestHandler<CreateSentenceStructureCommand, ApiResponse<Guid>>
    {
        private readonly IRepository<SentenceStructure> _sentenceStructureRepository;
        private readonly IRepository<User> _userRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public CreateSentenceStructureCommandHandler(
            IRepository<SentenceStructure> sentenceStructureRepository,
            IRepository<User> userRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _sentenceStructureRepository = sentenceStructureRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<Guid>> Handle(CreateSentenceStructureCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<Guid>.FailureResult(new System.Collections.Generic.List<string> { "Unauthorized" });

            var user = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
            if (user == null || user.ActiveLanguageId == null)
                return ApiResponse<Guid>.FailureResult(new System.Collections.Generic.List<string> { "No active language selected" });

            var structure = new SentenceStructure
            {
                Id = Guid.NewGuid(),
                Pattern = request.Data.Pattern,
                VietnameseMeaning = request.Data.VietnameseMeaning,
                UserId = userId.Value,
                LanguageId = user.ActiveLanguageId.Value
            };

            foreach (var example in request.Data.Examples.Where(e => !string.IsNullOrWhiteSpace(e.Sentence)))
            {
                structure.Examples.Add(new SentenceStructureExample
                {
                    Id = Guid.NewGuid(),
                    Sentence = example.Sentence,
                    Meaning = example.Meaning
                });
            }

            await _sentenceStructureRepository.AddAsync(structure);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<Guid>.SuccessResult(structure.Id);
        }
    }
}
