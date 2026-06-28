using AutoMapper;
using YK.Application.Auth.Commands;
using YK.Presentation.DTOs.Auth;

namespace YK.Presentation.MappingProfiles
{
    public class AuthMappingProfile : Profile
    {
        public AuthMappingProfile()
        {
            CreateMap<RegisterRequest, RegisterCommand>();
            CreateMap<LoginRequest, LoginCommand>();
            CreateMap<RefreshRequest, RefreshTokenCommand>();
            CreateMap<ForgotPasswordRequest, ForgotPasswordCommand>();
            CreateMap<ResetPasswordRequest, ResetPasswordCommand>();
        }
    }
}
