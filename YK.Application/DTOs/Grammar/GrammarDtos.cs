using System;
using System.Collections.Generic;

namespace YK.Application.DTOs.Grammar
{
    public class GrammarRuleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<GrammarExampleDto> Examples { get; set; } = new();
    }

    public class GrammarExampleDto
    {
        public Guid Id { get; set; }
        public string Sentence { get; set; } = string.Empty;
    }

    public class CreateGrammarRuleRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Examples { get; set; } = new();
    }

    public class UpdateGrammarRuleRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Examples { get; set; } = new();
    }
}
