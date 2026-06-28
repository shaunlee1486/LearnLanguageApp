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
    public class UpdateSentenceStructureCommand : IRequest<ApiResponse<bool>>
    {
        public Guid Id { get; set; }
        public UpdateSentenceStructureRequest Data { get; set; } = null!;
    }

    public class UpdateSentenceStructureCommandHandler : IRequestHandler<UpdateSentenceStructureCommand, ApiResponse<bool>>
    {
        private readonly IRepository<SentenceStructure> _sentenceStructureRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateSentenceStructureCommandHandler(
            IRepository<SentenceStructure> sentenceStructureRepository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _sentenceStructureRepository = sentenceStructureRepository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<bool>> Handle(UpdateSentenceStructureCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserIdGuid;
            if (userId == null || userId == Guid.Empty)
                return ApiResponse<bool>.FailureResult(new System.Collections.Generic.List<string> { "Unauthorized" });

            var structure = await _sentenceStructureRepository.Query()
                .Include(s => s.Examples)
                .FirstOrDefaultAsync(s => s.Id == request.Id && s.UserId == userId.Value, cancellationToken);

            if (structure == null)
                return ApiResponse<bool>.FailureResult(new System.Collections.Generic.List<string> { "Structure not found" });

            structure.Pattern = request.Data.Pattern;
            structure.VietnameseMeaning = request.Data.VietnameseMeaning;

            structure.Examples.Clear();
            foreach (var example in request.Data.Examples.Where(e => !string.IsNullOrWhiteSpace(e.Sentence)))
            {
                structure.Examples.Add(new SentenceStructureExample
                {
                    Id = Guid.NewGuid(),
                    Sentence = example.Sentence,
                    Meaning = example.Meaning
                });
            }

            _sentenceStructureRepository.Update(structure);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResult(true);
        }
    }
}
