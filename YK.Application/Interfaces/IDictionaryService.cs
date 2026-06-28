using System.Threading.Tasks;

namespace YK.Application.Interfaces
{
    public class DictionaryResultDto
    {
        public string Word { get; set; } = string.Empty;
        public string? Phonetic { get; set; } // IPA
        public string? AudioUrl { get; set; }
    }

    public interface IDictionaryService
    {
        Task<DictionaryResultDto?> LookupAsync(string word, string languageCode);
    }
}

