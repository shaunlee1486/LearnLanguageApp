using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace YK.Application.Interfaces
{
    public interface IImageStorageService
    {
        Task<string> UploadAsync(IFormFile file, string folder);
        Task DeleteAsync(string fileUrl);
    }
}

