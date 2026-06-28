using System;
using System.Collections.Generic;

namespace YK.Application.DTOs.SentenceStructure
{
    public class SentenceStructureDto
    {
        public Guid Id { get; set; }
        public string Pattern { get; set; } = string.Empty;
        public string VietnameseMeaning { get; set; } = string.Empty;
        public List<SentenceStructureExampleDto> Examples { get; set; } = new();
    }

    public class SentenceStructureExampleDto
    {
        public Guid Id { get; set; }
        public string Sentence { get; set; } = string.Empty;
        public string Meaning { get; set; } = string.Empty;
    }

    public class CreateSentenceStructureRequest
    {
        public string Pattern { get; set; } = string.Empty;
        public string VietnameseMeaning { get; set; } = string.Empty;
        public List<CreateSentenceStructureExampleRequest> Examples { get; set; } = new();
    }

    public class UpdateSentenceStructureRequest
    {
        public string Pattern { get; set; } = string.Empty;
        public string VietnameseMeaning { get; set; } = string.Empty;
        public List<CreateSentenceStructureExampleRequest> Examples { get; set; } = new();
    }

    public class CreateSentenceStructureExampleRequest
    {
        public string Sentence { get; set; } = string.Empty;
        public string Meaning { get; set; } = string.Empty;
    }
}
