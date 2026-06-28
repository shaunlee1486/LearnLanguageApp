using System;

namespace YK.Application.DTOs.Language
{
    public class LanguageDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LocaleCode { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}

