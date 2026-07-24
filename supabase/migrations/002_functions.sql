-- ============================================================
-- Additional SQL helper: increment_profile_stats
-- Run this AFTER 001_schema.sql in Supabase SQL Editor
-- ============================================================

-- Atomic increment of XP + coins on a user profile
create or replace function public.increment_profile_stats(
  p_user_id uuid,
  p_xp integer default 0,
  p_coins integer default 0
) returns void language plpgsql security definer as $$
begin
  update public.profiles
  set
    xp    = xp + p_xp,
    coins = coins + p_coins
  where id = p_user_id;
end;
$$;

-- Update streak on daily login
create or replace function public.update_streak(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_last_active date;
  v_streak      integer;
  v_longest     integer;
begin
  select last_active_date, streak, longest_streak
  into v_last_active, v_streak, v_longest
  from public.profiles
  where id = p_user_id;

  if v_last_active is null or v_last_active < current_date - 1 then
    -- Streak broken or first time
    update public.profiles
    set streak = 1, last_active_date = current_date
    where id = p_user_id;
  elsif v_last_active = current_date - 1 then
    -- Consecutive day
    update public.profiles
    set
      streak           = streak + 1,
      longest_streak   = greatest(longest_streak, streak + 1),
      last_active_date = current_date
    where id = p_user_id;
  end if;
  -- same day: no update needed
end;
$$;
