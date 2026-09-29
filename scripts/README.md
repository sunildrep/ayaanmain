# Scripts

All scripts run with a TypeScript runner (`npx tsx scripts/<name>.ts`) and read the same env vars as the app (`.env`). **No credentials are stored in this repo** — passwords are supplied via environment variables at run time and never logged.

## Credential env vars

| Env var | Used by | Purpose |
|---|---|---|
| `ADMIN_NEW_PASSWORD` | `setup-sunil-admin.ts`, `setup-supabase-auth.ts` | New password for all admin Supabase-auth users. **Required** — scripts exit without it |
| `STUDENT_NEW_PASSWORD` | `setup-supabase-auth.ts` | Password for student Supabase-auth users. **Required** — script exits without it |

Both scripts **fail closed**: if the env var is missing they exit with a non-zero code instead of falling back to a default password.

## Rotating the previously committed passwords

The old hardcoded passwords (`Sunil@Drep2024`, `Ayaan@2026`, `Finance@2026`, `Admissions@2026`, `ayaan123`) were removed from the code and the legacy `data/admins.json` / `data/users.json` files were deleted. Those accounts may still exist in Supabase Auth and the old passwords remain visible in **git history**, so rotate them:

1. **Rotate live credentials** — run the setup scripts with new env-driven passwords (they update existing Supabase users in place):

   ```powershell
   $env:ADMIN_NEW_PASSWORD='<new-strong-1>'
   $env:STUDENT_NEW_PASSWORD='<new-strong-2>'
   npx tsx scripts/setup-supabase-auth.ts
   npx tsx scripts/setup-sunil-admin.ts
   ```

2. **Forget/purge from git history** (destructive — coordinate with the team, then force-push):

   ```powershell
   # Preferred: convert these files to env-driven first (already done), then:
   git filter-repo --path scripts/setup-sunil-admin.ts --path scripts/setup-supabase-auth.ts --path data/admins.json --path data/users.json --invert-paths
   # or BFG: bfg --delete-files "{admins,users}.json setup-*.ts"
   git push --force --all
   ```

3. **Verify**: confirm the old passwords no longer sign in and review Supabase Auth logs for unexpected logins.

## Script index

- `seed-courses.ts` — branches, fee configs, courses + syllabus
- `seed-workflow.ts` — durations, batch backfill, application-id backfill
- `setup-supabase-auth.ts` — create/link Supabase Auth users for all admins and students
- `setup-sunil-admin.ts` — create/link the super-admin Supabase Auth user