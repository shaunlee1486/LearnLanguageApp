using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using YK.Application.Interfaces;

namespace YK.Infrastructure.Services
{
    public class S3ImageStorageService : IImageStorageService
    {
        public Task<string> UploadAsync(IFormFile file, string folder)
        {
            throw new NotImplementedException("S3 Storage is not yet configured.");
        }

        public Task DeleteAsync(string fileUrl)
        {
            throw new NotImplementedException("S3 Storage is not yet configured.");
        }
    }
}
