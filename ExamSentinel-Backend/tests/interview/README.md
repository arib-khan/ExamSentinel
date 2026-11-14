# Backend tests (run from the backend root, against a THROW-AWAY Postgres database)

```bash
createdb examsentinel_test
export DATABASE_URL=postgresql://postgres:<pw>@127.0.0.1:5432/examsentinel_test   # PowerShell: $env:DATABASE_URL="..."
export TOKEN_SECRET=test-secret REFRESH_TOKEN_SECRET=test-refresh

psql "$DATABASE_URL" -f tests/interview/fixture.sql                       # minimal user/role/permission tables
psql "$DATABASE_URL" -f migrations/interview/001_interview_schema.sql
psql "$DATABASE_URL" -f migrations/interview/002_interview_permissions.sql

# 1) API suite (needs these 4 users)
psql "$DATABASE_URL" -c "INSERT INTO \"user\" VALUES ('Admin@sysassist.com','Admin','x',1),('cand1','Cand One','x',6),('cand2','Cand Two','x',6),('op1','Operator','x',5)"
node tests/interview/e2e.interview.test.js            # 79 checks

# 2) real-flow suite (real ApiControler + real login + demo data): use a fresh DB, add the admin with a real bcrypt hash
node -e "require('bcrypt').hash('123456',10).then(h=>console.log(h))"   # paste the hash below
psql "$DATABASE_URL" -c "INSERT INTO \"user\" (user_id,user_name,user_password,user_role_id) VALUES ('Admin@sysassist.com','Admin','<hash>',1)"
node scripts/seed-interview-demo.js
node tests/interview/real-flow.test.js                 # 33 checks
```
