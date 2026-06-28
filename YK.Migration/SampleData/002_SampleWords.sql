-- 002_SampleWords.sql
-- Seed sample categories and words for development

-- 1. Insert Categories
INSERT INTO "Categories" ("Id", "Name", "Description", "UserId", "LanguageId", "CreatedDate", "CreatedBy", "IsDeleted")
VALUES
('01905ea7-0d58-7c8a-9f5e-18231bbd0101', 'Common Vocabulary', 'Từ vựng tiếng Anh thông dụng hằng ngày', '01905ea7-0d58-7c8a-9f5e-18231bbd0010', '01905ea7-0d58-7c8a-9f5e-18231bbd0001', CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0102', 'Giao tiếp cơ bản', 'Từ vựng tiếng Trung giao tiếp cơ bản', '01905ea7-0d58-7c8a-9f5e-18231bbd0010', '01905ea7-0d58-7c8a-9f5e-18231bbd0002', CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0103', 'Từ vựng N5', 'Từ vựng tiếng Nhật trình độ N5', '01905ea7-0d58-7c8a-9f5e-18231bbd0010', '01905ea7-0d58-7c8a-9f5e-18231bbd0003', CURRENT_TIMESTAMP, 'System', FALSE)
ON CONFLICT ("Id") DO NOTHING;

-- 2. Insert Words
INSERT INTO "Words" ("Id", "Text", "IPA", "AudioUrl", "ImageUrl", "Note", "Status", "CategoryId", "UserId", "LanguageId", "CreatedDate", "CreatedBy", "IsDeleted")
VALUES
('01905ea7-0d58-7c8a-9f5e-18231bbd0201', 'accomplish', '/əˈkʌm.plɪʃ/', NULL, NULL, 'Thường đi với mục tiêu, nhiệm vụ lớn lao', 'NotLearned', '01905ea7-0d58-7c8a-9f5e-18231bbd0101', '01905ea7-0d58-7c8a-9f5e-18231bbd0010', '01905ea7-0d58-7c8a-9f5e-18231bbd0001', CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0202', '你好', 'nǐ hǎo', NULL, NULL, 'Chào hỏi thông thường', 'Learned', '01905ea7-0d58-7c8a-9f5e-18231bbd0102', '01905ea7-0d58-7c8a-9f5e-18231bbd0010', '01905ea7-0d58-7c8a-9f5e-18231bbd0002', CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0203', 'こんにちは', 'konnichiwa', NULL, NULL, 'Chào buổi trưa/chiều', 'AlreadyKnown', '01905ea7-0d58-7c8a-9f5e-18231bbd0103', '01905ea7-0d58-7c8a-9f5e-18231bbd0010', '01905ea7-0d58-7c8a-9f5e-18231bbd0003', CURRENT_TIMESTAMP, 'System', FALSE)
ON CONFLICT ("Id") DO NOTHING;

-- 3. Insert WordMeanings
INSERT INTO "WordMeanings" ("Id", "WordId", "TypeOfWord", "MeaningText", "CreatedDate", "CreatedBy", "IsDeleted")
VALUES
('01905ea7-0d58-7c8a-9f5e-18231bbd0301', '01905ea7-0d58-7c8a-9f5e-18231bbd0201', 'Verb', 'hoàn thành, đạt được (mục tiêu)', CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0302', '01905ea7-0d58-7c8a-9f5e-18231bbd0202', 'Other', 'Xin chào', CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0303', '01905ea7-0d58-7c8a-9f5e-18231bbd0203', 'Other', 'Xin chào (vào ban ngày)', CURRENT_TIMESTAMP, 'System', FALSE)
ON CONFLICT ("Id") DO NOTHING;

-- 4. Insert WordExamples
INSERT INTO "WordExamples" ("Id", "WordId", "Sentence", "CreatedDate", "CreatedBy", "IsDeleted")
VALUES
('01905ea7-0d58-7c8a-9f5e-18231bbd0401', '01905ea7-0d58-7c8a-9f5e-18231bbd0201', 'We can accomplish anything if we work together.', CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0402', '01905ea7-0d58-7c8a-9f5e-18231bbd0202', '你好，请问你叫什么名字？', CURRENT_TIMESTAMP, 'System', FALSE),
('01905ea7-0d58-7c8a-9f5e-18231bbd0403', '01905ea7-0d58-7c8a-9f5e-18231bbd0203', '皆さん、こんにちは。', CURRENT_TIMESTAMP, 'System', FALSE)
ON CONFLICT ("Id") DO NOTHING;
