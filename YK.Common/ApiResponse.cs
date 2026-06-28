using System.Collections.Generic;

namespace YK.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
        public object? Meta { get; set; }

        public static ApiResponse<T> SuccessResult(T data, object? meta = null)
        {
            return new ApiResponse<T>
            {
                Success = true,
                Data = data,
                Errors = null,
                Meta = meta
            };
        }

        public static ApiResponse<T> FailureResult(List<string> errors, object? meta = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Data = default,
                Errors = errors,
                Meta = meta
            };
        }

        public static ApiResponse<T> FailureResult(string error, object? meta = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Data = default,
                Errors = new List<string> { error },
                Meta = meta
            };
        }
    }
}
