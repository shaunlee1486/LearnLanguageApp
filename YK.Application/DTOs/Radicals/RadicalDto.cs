using System;
using System.Collections.Generic;

namespace YK.Application.DTOs.Radicals
{
    public class RadicalDto
    {
        public Guid Id { get; set; }
        public string Character { get; set; } = string.Empty;
        public int StrokeCount { get; set; }
        public string VietnameseMeaning { get; set; } = string.Empty;
        public string? Pinyin { get; set; }
        public string? Reading { get; set; }
        public List<RadicalExampleDto> Examples { get; set; } = new();
    }

    public class RadicalExampleDto
    {
        public Guid Id { get; set; }
        public string Word { get; set; } = string.Empty;
        public string VietnameseMeaning { get; set; } = string.Empty;
    }

    public class RadicalGroupDto
    {
        public int StrokeCount { get; set; }
        public List<RadicalDto> Radicals { get; set; } = new();
    }
}
