-- Create late_submission_requests table
-- Run this SQL script in your Supabase SQL Editor or Railway PostgreSQL console

CREATE TABLE IF NOT EXISTS late_submission_requests (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    teacher_response TEXT,
    CONSTRAINT fk_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_request UNIQUE (assignment_id, student_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_late_submission_status ON late_submission_requests(status);
CREATE INDEX IF NOT EXISTS idx_late_submission_assignment ON late_submission_requests(assignment_id);
CREATE INDEX IF NOT EXISTS idx_late_submission_student ON late_submission_requests(student_id);

-- Verify table creation
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'late_submission_requests'
ORDER BY 
    ordinal_position;
