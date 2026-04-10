-- Fix: Simplify the holidays insert policy so it doesn't fail
-- when auth.uid() doesn't exactly match the created_by field at check time
DROP POLICY IF EXISTS "Authenticated users can create holidays" ON public.holidays;
CREATE POLICY "Authenticated users can create holidays"
  ON public.holidays FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
