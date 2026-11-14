-- ExamSentinel :: Interview permissions, using the EXISTING role/permission tables.
-- Safe to re-run. Role 1 (admin) gets full access; a new "Candidate" role is created.

-- 1) Candidate role (the web app maps role id 6 -> candidate UI; see frontend README)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_role_name = 'Candidate') THEN
    IF EXISTS (SELECT 1 FROM user_roles WHERE user_role_id = 6) THEN
      RAISE EXCEPTION 'user_role_id 6 is already used by another role; pick another id and update CANDIDATE_ROLE_ID in the frontend';
    END IF;
    INSERT INTO user_roles (user_role_id, user_role_name) OVERRIDING SYSTEM VALUE VALUES (6, 'Candidate');
    PERFORM setval(pg_get_serial_sequence('user_roles','user_role_id'), GREATEST((SELECT MAX(user_role_id) FROM user_roles), 1));
  END IF;
END $$;

-- 2) System objects (explicit ids, so it also works if the id column has no default; the sequence is re-synced after)
DO $$ DECLARE v record; nid integer; BEGIN
  FOR v IN SELECT * FROM (VALUES
      ('interviews',            'Interview Management'),
      ('interview_evaluations', 'Interview Evaluation'),
      ('interview_portal',      'Interview Portal (candidate)')
    ) AS t(n, d)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM system_objects WHERE sys_object_name = v.n) THEN
      SELECT COALESCE(MAX(sys_object_id), 0) + 1 INTO nid FROM system_objects;
      INSERT INTO system_objects (sys_object_id, sys_object_name, sys_object_display_name)
        OVERRIDING SYSTEM VALUE VALUES (nid, v.n, v.d);
    END IF;
  END LOOP;
  PERFORM setval(pg_get_serial_sequence('system_objects','sys_object_id'), (SELECT MAX(sys_object_id) FROM system_objects));
END $$;

-- 3) Permissions:  interviews: create/read/update/delete + execute (publish, assign)
--                  interview_evaluations: read = view attempts/results, update = grade, execute = finalize
--                  interview_portal: read = list/open, execute = start/answer/submit
INSERT INTO object_user_role_perm (perm_sys_object_id, perm_user_role_id, create_perm, read_perm, update_perm, delete_perm, execute_perm)
SELECT s.sys_object_id, 1, 'Y','Y','Y','Y','Y'
FROM system_objects s
WHERE s.sys_object_name IN ('interviews','interview_evaluations','interview_portal')
  AND NOT EXISTS (SELECT 1 FROM object_user_role_perm p WHERE p.perm_sys_object_id = s.sys_object_id AND p.perm_user_role_id = 1);

INSERT INTO object_user_role_perm (perm_sys_object_id, perm_user_role_id, create_perm, read_perm, update_perm, delete_perm, execute_perm)
SELECT s.sys_object_id, r.user_role_id, 'N','Y','N','N','Y'
FROM system_objects s, user_roles r
WHERE s.sys_object_name = 'interview_portal' AND r.user_role_name = 'Candidate'
  AND NOT EXISTS (SELECT 1 FROM object_user_role_perm p WHERE p.perm_sys_object_id = s.sys_object_id AND p.perm_user_role_id = r.user_role_id);

-- To let another existing role (e.g. an Evaluator) help, grant it rows on 'interview_evaluations'
-- (and 'interviews' read) from the existing "Object Permission" screen; no code change needed.
