# Database Migrations

This folder contains SQL scripts for manual database migrations.

## Late Submission Requests Table

If the `late_submission_requests` table is not automatically created by Hibernate, run the following script manually:

### For Supabase:
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `create-late-submission-requests-table.sql`
5. Click "Run" to execute the script

### For Railway PostgreSQL:
1. Go to your Railway project dashboard
2. Click on your PostgreSQL service
3. Go to the "Data" tab
4. Click "Query" at the top
5. Copy and paste the contents of `create-late-submission-requests-table.sql`
6. Click "Run Query"

### Verification:
After running the script, you should see:
- Table `late_submission_requests` created
- 8 columns: id, assignment_id, student_id, reason, status, requested_at, responded_at, teacher_response
- 3 indexes created for performance
- Foreign key constraints to assignments and users tables

### Troubleshooting:
If you get an error about foreign keys, make sure:
1. The `assignments` table exists
2. The `users` table exists
3. You're running the script with proper permissions

### Alternative (if Hibernate auto-creates):
If Hibernate is configured with `ddl-auto: update`, the table should be created automatically when the backend starts. This script is only needed if:
- The backend hasn't been redeployed after adding the LateSubmissionRequest entity
- There's an issue with Hibernate auto-creation
- You want to manually create the table with specific constraints
