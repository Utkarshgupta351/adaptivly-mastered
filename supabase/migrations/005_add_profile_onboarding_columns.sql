-- ============================================================
-- Migration 005: Add Onboarding & Profile Preferences Columns
-- Run this in Supabase SQL Editor: Project → SQL Editor → New query
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS learning_path TEXT DEFAULT 'FAANG Full Prep',
ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS target_company TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS last_study_date DATE DEFAULT NULL;
