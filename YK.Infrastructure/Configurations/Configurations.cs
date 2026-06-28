using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using YK.Domain;
using YK.Domain.Enums;

namespace YK.Infrastructure.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.Property(u => u.DisplayName).IsRequired().HasMaxLength(150);
            builder.Property(u => u.AvatarUrl).HasMaxLength(500);
            builder.Property(u => u.CreatedBy).HasMaxLength(100);
            builder.Property(u => u.ModifiedBy).HasMaxLength(100);

            builder.HasOne(u => u.ActiveLanguage)
                .WithMany()
                .HasForeignKey(u => u.ActiveLanguageId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

    public class LanguageConfiguration : IEntityTypeConfiguration<Language>
    {
        public void Configure(EntityTypeBuilder<Language> builder)
        {
            builder.HasKey(l => l.Id);
            builder.Property(l => l.Name).IsRequired().HasMaxLength(100);
            builder.Property(l => l.LocaleCode).IsRequired().HasMaxLength(10);
            builder.Property(l => l.CreatedBy).HasMaxLength(100);
            builder.Property(l => l.ModifiedBy).HasMaxLength(100);

            builder.HasOne(l => l.User)
                .WithMany()
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }

    public class UserLanguageConfiguration : IEntityTypeConfiguration<UserLanguage>
    {
        public void Configure(EntityTypeBuilder<UserLanguage> builder)
        {
            builder.HasKey(ul => ul.Id);
            builder.Property(ul => ul.CreatedBy).HasMaxLength(100);
            builder.Property(ul => ul.ModifiedBy).HasMaxLength(100);

            builder.HasOne(ul => ul.User)
                .WithMany(u => u.UserLanguages)
                .HasForeignKey(ul => ul.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ul => ul.Language)
                .WithMany(l => l.UserLanguages)
                .HasForeignKey(ul => ul.LanguageId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(ul => new { ul.UserId, ul.LanguageId }).IsUnique();
        }
    }

    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Name).IsRequired().HasMaxLength(150);
            builder.Property(c => c.Description).HasMaxLength(500);
            builder.Property(c => c.CreatedBy).HasMaxLength(100);
            builder.Property(c => c.ModifiedBy).HasMaxLength(100);

            builder.HasOne(c => c.User)
                .WithMany(u => u.Categories)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(c => c.Language)
                .WithMany(l => l.Categories)
                .HasForeignKey(c => c.LanguageId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class WordConfiguration : IEntityTypeConfiguration<Word>
    {
        public void Configure(EntityTypeBuilder<Word> builder)
        {
            builder.HasKey(w => w.Id);
            builder.Property(w => w.Text).IsRequired().HasMaxLength(200);
            builder.Property(w => w.IPA).HasMaxLength(150);
            builder.Property(w => w.AudioUrl).HasMaxLength(500);
            builder.Property(w => w.ImageUrl).HasMaxLength(500);
            builder.Property(w => w.Note).HasMaxLength(1000);
            builder.Property(w => w.CreatedBy).HasMaxLength(100);
            builder.Property(w => w.ModifiedBy).HasMaxLength(100);

            builder.Property(w => w.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.HasOne(w => w.Category)
                .WithMany(c => c.Words)
                .HasForeignKey(w => w.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(w => w.User)
                .WithMany(u => u.Words)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(w => w.Language)
                .WithMany(l => l.Words)
                .HasForeignKey(w => w.LanguageId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class WordMeaningConfiguration : IEntityTypeConfiguration<WordMeaning>
    {
        public void Configure(EntityTypeBuilder<WordMeaning> builder)
        {
            builder.HasKey(wm => wm.Id);
            builder.Property(wm => wm.MeaningText).IsRequired().HasMaxLength(1000);
            builder.Property(wm => wm.CreatedBy).HasMaxLength(100);
            builder.Property(wm => wm.ModifiedBy).HasMaxLength(100);

            builder.Property(wm => wm.TypeOfWord)
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.HasOne(wm => wm.Word)
                .WithMany(w => w.Meanings)
                .HasForeignKey(wm => wm.WordId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class WordExampleConfiguration : IEntityTypeConfiguration<WordExample>
    {
        public void Configure(EntityTypeBuilder<WordExample> builder)
        {
            builder.HasKey(we => we.Id);
            builder.Property(we => we.Sentence).IsRequired().HasMaxLength(1000);
            builder.Property(we => we.CreatedBy).HasMaxLength(100);
            builder.Property(we => we.ModifiedBy).HasMaxLength(100);

            builder.HasOne(we => we.Word)
                .WithMany(w => w.Examples)
                .HasForeignKey(we => we.WordId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class ReviewListConfiguration : IEntityTypeConfiguration<ReviewList>
    {
        public void Configure(EntityTypeBuilder<ReviewList> builder)
        {
            builder.HasKey(rl => rl.Id);
            builder.Property(rl => rl.CreatedBy).HasMaxLength(100);
            builder.Property(rl => rl.ModifiedBy).HasMaxLength(100);

            builder.HasOne(rl => rl.User)
                .WithMany(u => u.ReviewLists)
                .HasForeignKey(rl => rl.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(rl => rl.Language)
                .WithMany(l => l.ReviewLists)
                .HasForeignKey(rl => rl.LanguageId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(rl => new { rl.UserId, rl.LanguageId }).IsUnique();
        }
    }

    public class ReviewListWordConfiguration : IEntityTypeConfiguration<ReviewListWord>
    {
        public void Configure(EntityTypeBuilder<ReviewListWord> builder)
        {
            builder.HasKey(rlw => rlw.Id);
            builder.Property(rlw => rlw.CreatedBy).HasMaxLength(100);
            builder.Property(rlw => rlw.ModifiedBy).HasMaxLength(100);

            builder.HasOne(rlw => rlw.ReviewList)
                .WithMany(rl => rl.ReviewListWords)
                .HasForeignKey(rlw => rlw.ReviewListId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(rlw => rlw.Word)
                .WithMany(w => w.ReviewListWords)
                .HasForeignKey(rlw => rlw.WordId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(rlw => new { rlw.ReviewListId, rlw.WordId }).IsUnique();
        }
    }

    public class GrammarRuleConfiguration : IEntityTypeConfiguration<GrammarRule>
    {
        public void Configure(EntityTypeBuilder<GrammarRule> builder)
        {
            builder.HasKey(gr => gr.Id);
            builder.Property(gr => gr.Name).IsRequired().HasMaxLength(200);
            builder.Property(gr => gr.Description).IsRequired().HasMaxLength(4000);
            builder.Property(gr => gr.CreatedBy).HasMaxLength(100);
            builder.Property(gr => gr.ModifiedBy).HasMaxLength(100);

            builder.HasOne(gr => gr.User)
                .WithMany(u => u.GrammarRules)
                .HasForeignKey(gr => gr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(gr => gr.Language)
                .WithMany(l => l.GrammarRules)
                .HasForeignKey(gr => gr.LanguageId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class GrammarExampleConfiguration : IEntityTypeConfiguration<GrammarExample>
    {
        public void Configure(EntityTypeBuilder<GrammarExample> builder)
        {
            builder.HasKey(ge => ge.Id);
            builder.Property(ge => ge.Sentence).IsRequired().HasMaxLength(1000);
            builder.Property(ge => ge.CreatedBy).HasMaxLength(100);
            builder.Property(ge => ge.ModifiedBy).HasMaxLength(100);

            builder.HasOne(ge => ge.GrammarRule)
                .WithMany(gr => gr.Examples)
                .HasForeignKey(ge => ge.GrammarRuleId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class SentenceStructureConfiguration : IEntityTypeConfiguration<SentenceStructure>
    {
        public void Configure(EntityTypeBuilder<SentenceStructure> builder)
        {
            builder.HasKey(ss => ss.Id);
            builder.Property(ss => ss.Pattern).IsRequired().HasMaxLength(300);
            builder.Property(ss => ss.VietnameseMeaning).IsRequired().HasMaxLength(1000);
            builder.Property(ss => ss.CreatedBy).HasMaxLength(100);
            builder.Property(ss => ss.ModifiedBy).HasMaxLength(100);

            builder.HasOne(ss => ss.User)
                .WithMany(u => u.SentenceStructures)
                .HasForeignKey(ss => ss.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ss => ss.Language)
                .WithMany(l => l.SentenceStructures)
                .HasForeignKey(ss => ss.LanguageId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class SentenceStructureExampleConfiguration : IEntityTypeConfiguration<SentenceStructureExample>
    {
        public void Configure(EntityTypeBuilder<SentenceStructureExample> builder)
        {
            builder.HasKey(sse => sse.Id);
            builder.Property(sse => sse.Sentence).IsRequired().HasMaxLength(1000);
            builder.Property(sse => sse.CreatedBy).HasMaxLength(100);
            builder.Property(sse => sse.ModifiedBy).HasMaxLength(100);

            builder.HasOne(sse => sse.SentenceStructure)
                .WithMany(ss => ss.Examples)
                .HasForeignKey(sse => sse.SentenceStructureId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class StudySessionConfiguration : IEntityTypeConfiguration<StudySession>
    {
        public void Configure(EntityTypeBuilder<StudySession> builder)
        {
            builder.HasKey(s => s.Id);
            builder.Property(s => s.CreatedBy).HasMaxLength(100);
            builder.Property(s => s.ModifiedBy).HasMaxLength(100);

            builder.Property(s => s.Mode)
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.HasOne(s => s.User)
                .WithMany(u => u.StudySessions)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Language)
                .WithMany(l => l.StudySessions)
                .HasForeignKey(s => s.LanguageId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class TestResultConfiguration : IEntityTypeConfiguration<TestResult>
    {
        public void Configure(EntityTypeBuilder<TestResult> builder)
        {
            builder.HasKey(tr => tr.Id);
            builder.Property(tr => tr.ConfigSnapshot).HasMaxLength(2000);
            builder.Property(tr => tr.CreatedBy).HasMaxLength(100);
            builder.Property(tr => tr.ModifiedBy).HasMaxLength(100);

            builder.Property(tr => tr.TestType)
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.HasOne(tr => tr.User)
                .WithMany(u => u.TestResults)
                .HasForeignKey(tr => tr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(tr => tr.Language)
                .WithMany(l => l.TestResults)
                .HasForeignKey(tr => tr.LanguageId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class RadicalConfiguration : IEntityTypeConfiguration<Radical>
    {
        public void Configure(EntityTypeBuilder<Radical> builder)
        {
            builder.HasKey(r => r.Id);
            builder.Property(r => r.Character).IsRequired().HasMaxLength(20);
            builder.Property(r => r.VietnameseMeaning).IsRequired().HasMaxLength(200);
            builder.Property(r => r.Pinyin).HasMaxLength(100);
            builder.Property(r => r.Reading).HasMaxLength(200);
            builder.Property(r => r.CreatedBy).HasMaxLength(100);
            builder.Property(r => r.ModifiedBy).HasMaxLength(100);
        }
    }

    public class RadicalExampleConfiguration : IEntityTypeConfiguration<RadicalExample>
    {
        public void Configure(EntityTypeBuilder<RadicalExample> builder)
        {
            builder.HasKey(re => re.Id);
            builder.Property(re => re.Word).IsRequired().HasMaxLength(200);
            builder.Property(re => re.VietnameseMeaning).IsRequired().HasMaxLength(500);
            builder.Property(re => re.CreatedBy).HasMaxLength(100);
            builder.Property(re => re.ModifiedBy).HasMaxLength(100);

            builder.HasOne(re => re.Radical)
                .WithMany(r => r.Examples)
                .HasForeignKey(re => re.RadicalId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasKey(rt => rt.Id);
            builder.Property(rt => rt.Token).IsRequired().HasMaxLength(500);
            builder.Property(rt => rt.CreatedBy).HasMaxLength(100);
            builder.Property(rt => rt.ModifiedBy).HasMaxLength(100);

            builder.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(rt => rt.Token);
        }
    }
}
