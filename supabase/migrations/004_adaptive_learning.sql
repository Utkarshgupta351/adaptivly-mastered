-- ─── Add assessment state to profiles ──────────────────────────────────────────
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assessment_completed BOOLEAN NOT NULL DEFAULT false;

-- ─── Create Learner Profiles table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  user_id    UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  topics     JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "DSA": 50, "OS": 30, ... }
  history    JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [ { "date": "2026-07-26", "topics": { "DSA": 50 } } ]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;

-- Owner policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'learner_profiles' AND policyname = 'learner_profiles_own'
  ) THEN
    CREATE POLICY "learner_profiles_own" ON public.learner_profiles
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;
