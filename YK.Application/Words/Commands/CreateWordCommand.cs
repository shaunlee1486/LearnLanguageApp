using MediatR;
using System;
using System.Collections.Generic;
using YK.Common;
using YK.Domain.Enums;

namespace YK.Application.Words.Commands
{
    public class CreateWordCommand : IRequest<ApiResponse<Guid>>
    {
        public Guid CategoryId { get; set; }
        public string Text { get; set; } = string.Empty;
        public string? IPA { get; set; }
        public string? AudioUrl { get; set; }
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        
        public List<CreateWordMeaningCommand> Meanings { get; set; } = new();
        public List<CreateWordExampleCommand> Examples { get; set; } = new();
    }

    public class CreateWordMeaningCommand
    {
        public string TypeOfWord { get; set; } = string.Empty;
        public string MeaningText { get; set; } = string.Empty;
    }

    public class CreateWordExampleCommand
    {
        public string Sentence { get; set; } = string.Empty;
    }
}

