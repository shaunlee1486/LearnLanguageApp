using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Reflection;
using YK.Common;
using YK.Domain;

namespace YK.Infrastructure
{
    public class AppDbContext : IdentityDbContext<User, Role, Guid>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Language> Languages { get; set; } = null!;
        public DbSet<UserLanguage> UserLanguages { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Word> Words { get; set; } = null!;
        public DbSet<WordMeaning> WordMeanings { get; set; } = null!;
        public DbSet<WordExample> WordExamples { get; set; } = null!;
        public DbSet<ReviewList> ReviewLists { get; set; } = null!;
        public DbSet<ReviewListWord> ReviewListWords { get; set; } = null!;
        public DbSet<GrammarRule> GrammarRules { get; set; } = null!;
        public DbSet<GrammarExample> GrammarExamples { get; set; } = null!;
        public DbSet<SentenceStructure> SentenceStructures { get; set; } = null!;
        public DbSet<SentenceStructureExample> SentenceStructureExamples { get; set; } = null!;
        public DbSet<StudySession> StudySessions { get; set; } = null!;
        public DbSet<TestResult> TestResults { get; set; } = null!;
        public DbSet<Radical> Radicals { get; set; } = null!;
        public DbSet<RadicalExample> RadicalExamples { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply all entity configurations
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // Rename Identity Tables
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Role>().ToTable("Roles");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<Guid>>().ToTable("UserRoles");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>().ToTable("UserClaims");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>().ToTable("UserLogins");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>().ToTable("UserTokens");

            // Apply Global Soft Delete Query Filter
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    var method = typeof(AppDbContext)
                        .GetMethod(nameof(ConfigureSoftDeleteFilter), BindingFlags.NonPublic | BindingFlags.Static)
                        ?.MakeGenericMethod(entityType.ClrType);
                    method?.Invoke(null, new object[] { modelBuilder });
                }
                else if (entityType.ClrType == typeof(User))
                {
                    modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
                }
            }
        }

        private static void ConfigureSoftDeleteFilter<TEntity>(ModelBuilder modelBuilder) where TEntity : BaseEntity
        {
            modelBuilder.Entity<TEntity>().HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
