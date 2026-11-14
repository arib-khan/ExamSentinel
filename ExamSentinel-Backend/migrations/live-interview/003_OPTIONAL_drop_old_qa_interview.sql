-- OPTIONAL and DESTRUCTIVE. Run ONLY if you want to delete the old question-and-answer interview tables and data
-- (interviews, interview_questions, interview_candidates, interview_attempts, interview_answers,
--  interview_evaluations, interview_events, interview_types, interview_question_types) and their permissions.
-- The live video interview does not use any of them. Exam tables are never touched.
DROP TABLE IF EXISTS interview_events, interview_evaluations, interview_answers, interview_attempts,
                     interview_candidates, interview_questions, interviews, interview_question_types, interview_types CASCADE;
DROP FUNCTION IF EXISTS interview_set_updated_at();

DELETE FROM object_user_role_perm WHERE perm_sys_object_id IN
  (SELECT sys_object_id FROM system_objects WHERE sys_object_name IN ('interviews','interview_evaluations','interview_portal'));
DELETE FROM system_objects WHERE sys_object_name IN ('interviews','interview_evaluations','interview_portal');
