using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YK.Common;
using YK.Domain;

namespace YK.Infrastructure.Interceptors
{
    public class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
        {
            UpdateEntities(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            UpdateEntities(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void UpdateEntities(DbContext? context)
        {
            if (context == null) return;

            var entries = context.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                var now = DateTime.UtcNow;
                var user = "System"; // Can be replaced later with an injected user session context

                if (entry.State == EntityState.Added)
                {
                    if (entry.Entity is BaseEntity baseEntity)
                    {
                        baseEntity.CreatedDate = now;
                        baseEntity.CreatedBy = user;
                    }
                    else if (entry.Entity is User domainUser)
                    {
                        domainUser.CreatedDate = now;
                        domainUser.CreatedBy = user;
                    }
                }
                else if (entry.State == EntityState.Modified)
                {
                    if (entry.Entity is BaseEntity baseEntity)
                    {
                        baseEntity.ModifiedDate = now;
                        baseEntity.ModifiedBy = user;
                    }
                    else if (entry.Entity is User domainUser)
                    {
                        domainUser.ModifiedDate = now;
                        domainUser.ModifiedBy = user;
                    }
                }
            }
        }
    }
}
