-- Add missing trigger_type values (partner_fatigue, predictive) to nudges constraint
ALTER TABLE public.nudges DROP CONSTRAINT IF EXISTS nudges_trigger_type_check;
ALTER TABLE public.nudges ADD CONSTRAINT nudges_trigger_type_check CHECK (
  trigger_type IN (
    'time_pattern',
    'frequency_spike',
    'vulnerability_window',
    'streak_at_risk',
    'check_in_missed',
    'reengagement',
    'onboarding',
    'churn_prevention',
    'partner_fatigue',
    'predictive'
  )
);
