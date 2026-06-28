-- 002_AddSM2_Streaks_TestSettings.sql
-- Alter tables to add missing columns from Phase 6/7/8 features.

-- 1. Users Table Columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Users' AND column_name='CurrentStreak') THEN
        ALTER TABLE "Users" ADD COLUMN "CurrentStreak" INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Users' AND column_name='LongestStreak') THEN
        ALTER TABLE "Users" ADD COLUMN "LongestStreak" INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Users' AND column_name='LastStudyDate') THEN
        ALTER TABLE "Users" ADD COLUMN "LastStudyDate" TIMESTAMP WITH TIME ZONE NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Users' AND column_name='CustomTestQuestionLimit') THEN
        ALTER TABLE "Users" ADD COLUMN "CustomTestQuestionLimit" INTEGER NOT NULL DEFAULT 15;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Users' AND column_name='CustomTestTimerSeconds') THEN
        ALTER TABLE "Users" ADD COLUMN "CustomTestTimerSeconds" INTEGER NOT NULL DEFAULT 300;
    END IF;
END $$;

-- 2. Words Table Columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Words' AND column_name='RepetitionCount') THEN
        ALTER TABLE "Words" ADD COLUMN "RepetitionCount" INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Words' AND column_name='EasyFactor') THEN
        ALTER TABLE "Words" ADD COLUMN "EasyFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Words' AND column_name='Interval') THEN
        ALTER TABLE "Words" ADD COLUMN "Interval" INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Words' AND column_name='NextReviewDate') THEN
        ALTER TABLE "Words" ADD COLUMN "NextReviewDate" TIMESTAMP WITH TIME ZONE NULL;
    END IF;
END $$;

-- 3. SentenceStructureExamples Table Columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='SentenceStructureExamples' AND column_name='Meaning') THEN
        ALTER TABLE "SentenceStructureExamples" ADD COLUMN "Meaning" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;
