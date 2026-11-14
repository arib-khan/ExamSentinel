-- ExamSentinel :: LIVE INTERVIEW permissions, using the EXISTING role/permission tables. Safe to re-run.
--   live_interviews        : create/read/update/delete  = HR schedules & manages;  execute = start / join as host / end
--   live_interview_portal  : read = candidate sees own interviews;               execute = candidate joins (both devices)
-- Role 1 (Admin) gets everything and acts as the HR interviewer. The "Candidate" role (id 6) is created if missing.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_role_name = 'Candidate') THEN
    IF EXISTS (SELECT 1 FROM user_roles WHERE user_role_id = 6) THEN
      RAISE EXCEPTION 'user_role_id 6 is already used by another role; pick another id and update CANDIDATE_ROLE_ID in the frontend and mobile app';
    END IF;
    INSERT INTO user_roles (user_role_id, user_role_name) OVERRIDING SYSTEM VALUE VALUES (6, 'Candidate');
    PERFORM setval(pg_get_serial_sequence('user_roles','user_role_id'), GREATEST((SELECT MAX(user_role_id) FROM user_roles), 1));
  END IF;
END $$;

DO $$ DECLARE v record; nid integer; BEGIN
  FOR v IN SELECT * FROM (VALUES
      ('live_interviews',       'Live Interviews (HR)'),
      ('live_interview_portal', 'Live Interview Portal (candidate)')
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

INSERT INTO object_user_role_perm (perm_sys_object_id, perm_user_role_id, create_perm, read_perm, update_perm, delete_perm, execute_perm)
SELECT s.sys_object_id, 1, 'Y','Y','Y','Y','Y'
FROM system_objects s
WHERE s.sys_object_name IN ('live_interviews','live_interview_portal')
  AND NOT EXISTS (SELECT 1 FROM object_user_role_perm p WHERE p.perm_sys_object_id = s.sys_object_id AND p.perm_user_role_id = 1);

INSERT INTO object_user_role_perm (perm_sys_object_id, perm_user_role_id, create_perm, read_perm, update_perm, delete_perm, execute_perm)
SELECT s.sys_object_id, r.user_role_id, 'N','Y','N','N','Y'
FROM system_objects s, user_roles r
WHERE s.sys_object_name = 'live_interview_portal' AND r.user_role_name = 'Candidate'
  AND NOT EXISTS (SELECT 1 FROM object_user_role_perm p WHERE p.perm_sys_object_id = s.sys_object_id AND p.perm_user_role_id = r.user_role_id);

-- Another HR user: grant their role rows on 'live_interviews' from the existing "Object Permission" screen.
