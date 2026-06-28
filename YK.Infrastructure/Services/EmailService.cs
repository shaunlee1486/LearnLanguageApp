using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using YK.Application.Interfaces;

namespace YK.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> logger)
        {
            _logger = logger;
        }

        public Task SendPasswordResetEmailAsync(string email, string resetLink)
        {
            // In a real application, you would implement SMTP or use SendGrid/AWS SES.
            // For now, just logging it.
            _logger.LogInformation("Sending password reset email to {Email}. Link: {ResetLink}", email, resetLink);
            
            return Task.CompletedTask;
        }
    }
}
