-- 001_SampleUsers.sql
-- Insert sample admin and student user for development

INSERT INTO "Users" (
    "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", 
    "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", 
    "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount", 
    "DisplayName", "AvatarUrl", "ActiveLanguageId", "CreatedDate", "CreatedBy", "IsDeleted"
) VALUES 
(
    '01905ea7-0d58-7c8a-9f5e-18231bbd0010', 'admin@yk.com', 'ADMIN@YK.COM', 'admin@yk.com', 'ADMIN@YK.COM', 
    TRUE, 'AQAAAAIAAYagAAAAEFqhl9FUdYbMS82hzyT1OgqzHNL3VLO5bM7LMht+2QiS5JXpf0Av/ipGIPGCqbCvMg==', '01905ea7-0d58-7c8a-9f5e-18231bbd0011', '01905ea7-0d58-7c8a-9f5e-18231bbd0012', 
    FALSE, FALSE, TRUE, 0, 
    'YK Admin', NULL, '01905ea7-0d58-7c8a-9f5e-18231bbd0001', CURRENT_TIMESTAMP, 'System', FALSE
),
(
    '01905ea7-0d58-7c8a-9f5e-18231bbd0020', 'student@yk.com', 'STUDENT@YK.COM', 'student@yk.com', 'STUDENT@YK.COM', 
    TRUE, 'AQAAAAIAAYagAAAAEFqhl9FUdYbMS82hzyT1OgqzHNL3VLO5bM7LMht+2QiS5JXpf0Av/ipGIPGCqbCvMg==', '01905ea7-0d58-7c8a-9f5e-18231bbd0021', '01905ea7-0d58-7c8a-9f5e-18231bbd0022', 
    FALSE, FALSE, TRUE, 0, 
    'YK Student', NULL, '01905ea7-0d58-7c8a-9f5e-18231bbd0001', CURRENT_TIMESTAMP, 'System', FALSE
)
ON CONFLICT ("Id") DO NOTHING;

-- Seed Roles
INSERT INTO "Roles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
VALUES 
('01905ea7-0d58-7c8a-9f5e-18231bbd0030', 'Admin', 'ADMIN', '01905ea7-0d58-7c8a-9f5e-18231bbd0031'),
('01905ea7-0d58-7c8a-9f5e-18231bbd0040', 'Student', 'STUDENT', '01905ea7-0d58-7c8a-9f5e-18231bbd0041')
ON CONFLICT ("Id") DO NOTHING;

-- Seed UserRoles
INSERT INTO "UserRoles" ("UserId", "RoleId")
VALUES 
('01905ea7-0d58-7c8a-9f5e-18231bbd0010', '01905ea7-0d58-7c8a-9f5e-18231bbd0030'),
('01905ea7-0d58-7c8a-9f5e-18231bbd0020', '01905ea7-0d58-7c8a-9f5e-18231bbd0040')
ON CONFLICT ("UserId", "RoleId") DO NOTHING;

-- Seed UserLanguages (default learning languages for sample users)
INSERT INTO "UserLanguages" ("Id", "UserId", "LanguageId", "CreatedDate", "CreatedBy", "IsDeleted")
VALUES 
('01905ea7-0d58-7c8a-9f5e-18231bbd0050', '01905ea7-0d58-7c8a-9f5e-18231bbd0010', '01905ea7-0d58-7c8a-9f5e-18231bbd0001', CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0051', '01905ea7-0d58-7c8a-9f5e-18231bbd0010', '01905ea7-0d58-7c8a-9f5e-18231bbd0002', CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0052', '01905ea7-0d58-7c8a-9f5e-18231bbd0020', '01905ea7-0d58-7c8a-9f5e-18231bbd0001', CURRENT_TIMESTAMP, 'System', FALSE)
ON CONFLICT ("Id") DO NOTHING;
