using MediatR;
using System;
using System.Collections.Generic;
using YK.Common;

namespace YK.Application.Words.Commands
{
    public class UpdateWordCommand : IRequest<ApiResponse<bool>>
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string? IPA { get; set; }
        public string? AudioUrl { get; set; }
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        
        public List<UpdateWordMeaningCommand> Meanings { get; set; } = new();
        public List<UpdateWordExampleCommand> Examples { get; set; } = new();
    }

    public class UpdateWordMeaningCommand
    {
        public string TypeOfWord { get; set; } = string.Empty;
        public string MeaningText { get; set; } = string.Empty;
    }

    public class UpdateWordExampleCommand
    {
        public string Sentence { get; set; } = string.Empty;
    }
}

