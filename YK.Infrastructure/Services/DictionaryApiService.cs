using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using YK.Application.Interfaces;
using System.Linq;
using System.Collections.Generic;

namespace YK.Infrastructure.Services
{
    public class DictionaryApiService : IDictionaryService
    {
        private readonly HttpClient _httpClient;

        public DictionaryApiService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<DictionaryResultDto?> LookupAsync(string word, string languageCode)
        {
            // Only english supported by dictionaryapi.dev right now
            if (languageCode.ToLower() != "en") return null;

            try
            {
                var response = await _httpClient.GetAsync($"https://api.dictionaryapi.dev/api/v2/entries/en/{word}");
                
                if (!response.IsSuccessStatusCode) return null;

                var content = await response.Content.ReadAsStringAsync();
                
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var entries = JsonSerializer.Deserialize<List<DictionaryApiEntry>>(content, options);

                if (entries == null || !entries.Any()) return null;

                var entry = entries.First();
                
                var result = new DictionaryResultDto
                {
                    Word = entry.Word,
                    Phonetic = entry.Phonetic
                };

                // Find the first phonetic entry with audio
                if (entry.Phonetics != null)
                {
                    var phoneticWithAudio = entry.Phonetics.FirstOrDefault(p => !string.IsNullOrEmpty(p.Audio));
                    if (phoneticWithAudio != null)
                    {
                        result.AudioUrl = phoneticWithAudio.Audio;
                        // Some entries don't have top-level phonetic
                        if (string.IsNullOrEmpty(result.Phonetic))
                        {
                            result.Phonetic = phoneticWithAudio.Text;
                        }
                    }
                }

                return result;
            }
            catch
            {
                return null;
            }
        }

        private class DictionaryApiEntry
        {
            public string Word { get; set; } = string.Empty;
            public string? Phonetic { get; set; }
            public List<DictionaryApiPhonetic>? Phonetics { get; set; }
        }

        private class DictionaryApiPhonetic
        {
            public string? Text { get; set; }
            public string? Audio { get; set; }
        }
    }
}
