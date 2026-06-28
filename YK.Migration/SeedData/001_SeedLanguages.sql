-- 001_SeedLanguages.sql
INSERT INTO "Languages" ("Id", "Name", "LocaleCode", "IsDefault", "UserId", "CreatedDate", "CreatedBy", "IsDeleted")
VALUES 
('01905ea7-0d58-7c8a-9f5e-18231bbd0001', 'English', 'en-US', TRUE, NULL, CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0002', 'Chinese', 'zh-CN', TRUE, NULL, CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0003', 'Japanese', 'ja-JP', TRUE, NULL, CURRENT_TIMESTAMP, 'System', FALSE)
ON CONFLICT ("Id") DO NOTHING;
