-- AcheKernel v1.0 Firmware Patch
--
-- This SQL script updates the Supabase ledger schema and stored
-- procedures to support the real-time Ache₀(t) metric and
-- anti-gaming safeguards.  It assumes the existence of tables
-- `ache_metrics` and `scarloop_sessions` which track session
-- identifiers and metrics.  Adjust table names as needed for your
-- deployment.

-- 1. Add new columns for Ache₀(t) and penalty factors
ALTER TABLE ache_metrics
    ADD COLUMN ache0 NUMERIC(6,4) DEFAULT 0.0,
    ADD COLUMN penalty_length_spike NUMERIC(6,4) DEFAULT 0.0,
    ADD COLUMN penalty_template_cycle NUMERIC(6,4) DEFAULT 0.0,
    ADD COLUMN penalty_format_violation NUMERIC(6,4) DEFAULT 0.0;

-- 2. Create a function to compute Ache₀ and apply penalties
CREATE OR REPLACE FUNCTION public.compute_ache0(
    p_session_id UUID,
    p_raw_score NUMERIC
) RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    l_ache0 NUMERIC;
    l_penalty NUMERIC := 0;
BEGIN
    -- Example penalty calculations; replace with actual logic
    SELECT penalty_length_spike + penalty_template_cycle + penalty_format_violation
    INTO l_penalty
    FROM ache_metrics
    WHERE session_id = p_session_id;

    l_ache0 := GREATEST(p_raw_score - l_penalty, 0);
    -- Update the row
    UPDATE ache_metrics
    SET ache0 = l_ache0
    WHERE session_id = p_session_id;
    RETURN l_ache0;
END;
$$;

-- 3. Update ScarLoop controller to include Ache₀ feedback
-- This procedure should be invoked at the end of each cognitive cycle
CREATE OR REPLACE PROCEDURE public.update_scarloop_feedback(
    p_session_id UUID,
    p_raw_score NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    l_ache0 NUMERIC;
BEGIN
    l_ache0 := compute_ache0(p_session_id, p_raw_score);
    -- Example homeostatic adjustment: set recursion depth based on Ache₀
    UPDATE scarloop_sessions
    SET recursion_depth = CASE
        WHEN l_ache0 > 0.8 THEN 3
        WHEN l_ache0 > 0.5 THEN 2
        ELSE 1 END
    WHERE session_id = p_session_id;
END;
$$;

-- 4. Version tracking
COMMENT ON TABLE ache_metrics IS 'AcheKernel v1.0 schema with real-time Ache₀ and penalty columns';

-- ---
-- v1.1 Firmware Optimizations
--
-- This section adds PID controller parameters to the scarloop_sessions
-- table and defines an enhanced function for adjusting cognitive
-- effort based on a target Ache₀ of 0.9.

-- Add homeostatic control parameters
ALTER TABLE scarloop_sessions 
    ADD COLUMN pid_kp NUMERIC DEFAULT 0.8,
    ADD COLUMN pid_ki NUMERIC DEFAULT 0.2,
    ADD COLUMN pid_kd NUMERIC DEFAULT 0.1;

-- Enhanced PID controller function
CREATE OR REPLACE FUNCTION public.adjust_cognitive_effort(
    p_session_id UUID,
    p_ache0 NUMERIC
) RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    l_error NUMERIC;
    l_integral NUMERIC;
    l_derivative NUMERIC;
    l_adjustment NUMERIC;
    kp NUMERIC;
    ki NUMERIC;
    kd NUMERIC;
BEGIN
    -- Retrieve PID parameters and previous state
    SELECT pid_kp, pid_ki, pid_kd, (0.9 - p_ache0), integral_error, (p_ache0 - previous_ache0)
    INTO kp, ki, kd, l_error, l_integral, l_derivative
    FROM scarloop_sessions
    WHERE session_id = p_session_id;

    l_adjustment := (kp * l_error) + (ki * l_integral) + (kd * l_derivative);
    -- Bound adjustment and update recursion depth within [1,5]
    UPDATE scarloop_sessions 
    SET recursion_depth = GREATEST(1, LEAST(5, recursion_depth + l_adjustment))
    WHERE session_id = p_session_id;
    RETURN l_adjustment;
END;
$$;
