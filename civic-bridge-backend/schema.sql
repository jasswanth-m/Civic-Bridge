-- Query 1: Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) DEFAULT 'student' CHECK (user_type IN ('student', 'admin')),
  full_name VARCHAR(255),
  college_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING ((SELECT user_type FROM users WHERE id = auth.uid() LIMIT 1) = 'admin');

-- Query 2: Create student_profiles table
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course VARCHAR(100),
  year_of_study INT,
  state VARCHAR(100),
  annual_family_income DECIMAL(12,2),
  category VARCHAR(50),
  disability_status BOOLEAN DEFAULT FALSE,
  udid_number VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own profile"
  ON student_profiles FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON student_profiles FOR SELECT
  USING ((SELECT user_type FROM users WHERE id = auth.uid() LIMIT 1) = 'admin');

-- Query 3: Create schemes table
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name VARCHAR(255) NOT NULL UNIQUE,
  scheme_code VARCHAR(50) UNIQUE,
  description TEXT,
  scheme_type VARCHAR(100),
  award_amount DECIMAL(12,2),
  official_link VARCHAR(500),
  ministry VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  launch_date DATE,
  deadline_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query 4: Create scheme_eligibility_criteria table
CREATE TABLE scheme_eligibility_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  criterion_type VARCHAR(100),
  criterion_key VARCHAR(100),
  criterion_value VARCHAR(500),
  operator VARCHAR(20),
  description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query 5: Create scheme_required_documents table
CREATE TABLE scheme_required_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  document_name VARCHAR(255),
  description TEXT,
  where_to_get TEXT,
  format VARCHAR(50),
  is_mandatory BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query 6: Create scheme_application_steps table
CREATE TABLE scheme_application_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  step_number INT,
  step_title VARCHAR(255),
  step_description TEXT,
  estimated_time VARCHAR(100),
  tips TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query 7: Create student_scheme_matches table
CREATE TABLE student_scheme_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  match_status VARCHAR(50) DEFAULT 'possibly_eligible',
  match_score DECIMAL(5,2),
  eligibility_reason TEXT,
  failed_criteria JSONB,
  last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, scheme_id)
);

ALTER TABLE student_scheme_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own matches"
  ON student_scheme_matches FOR SELECT
  USING (student_id = auth.uid());

-- Query 8: Create student_applications table
CREATE TABLE student_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  application_status VARCHAR(50) DEFAULT 'draft',
  application_date DATE,
  submission_date DATE,
  documents_collected JSONB DEFAULT '[]',
  notes TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, scheme_id)
);

ALTER TABLE student_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own applications"
  ON student_applications FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can update own applications"
  ON student_applications FOR UPDATE
  USING (student_id = auth.uid());

-- Query 9: Create admin_analytics table
CREATE TABLE admin_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE DEFAULT CURRENT_DATE,
  total_students_assisted INT DEFAULT 0,
  total_scheme_matches INT DEFAULT 0,
  applications_started INT DEFAULT 0,
  applications_completed INT DEFAULT 0,
  common_dropoff_reasons JSONB,          
  most_matched_schemes JSONB,            
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE admin_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view analytics"
  ON admin_analytics FOR SELECT
  USING ((SELECT user_type FROM users WHERE id = auth.uid()) = 'admin');

-- Seed Sample Schemes
INSERT INTO schemes (scheme_name, scheme_code, description, scheme_type, award_amount, official_link, ministry, deadline_date, is_active)
VALUES (
  'PM YASASVI - Top Class Education in College',
  'PM_YASASVI',
  'Financial support for OBC, EBC, and DNT students pursuing higher education',
  'Scholarship',
  30000,
  'https://pmyasasvi.tnhedu.nic.in',
  'Ministry of Social Justice',
  '2026-10-31',
  TRUE
);

INSERT INTO schemes (scheme_name, scheme_code, description, scheme_type, award_amount, official_link, ministry, deadline_date, is_active)
VALUES (
  'AICTE Swanath Scholarship',
  'AICTE_SWANATH',
  'AICTE welfare-based scholarship for technical degree students',
  'Scholarship',
  20000,
  'https://aicte-swanath.edu.in',
  'AICTE',
  '2026-10-31',
  TRUE
);

INSERT INTO schemes (scheme_name, scheme_code, description, scheme_type, award_amount, official_link, ministry, deadline_date, is_active)
VALUES (
  'Ishan Uday Special Scholarship',
  'ISHAN_UDAY',
  'UGC scholarship for eligible students from North-Eastern Region',
  'Scholarship',
  25000,
  'https://ishan-uday.ugc.gov.in',
  'UGC',
  '2026-12-31',
  TRUE
);

INSERT INTO schemes (scheme_name, scheme_code, description, scheme_type, award_amount, official_link, ministry, deadline_date, is_active)
VALUES (
  'Top Class Education for Students with Disabilities',
  'TCE_DISABILITY',
  'Scholarship for eligible students with disabilities pursuing higher education',
  'Scholarship',
  35000,
  'https://tce-disability.mhrd.gov.in',
  'Ministry of Education',
  '2026-11-30',
  TRUE
);

-- Seed PM YASASVI Criteria
-- NOTE: In a real scenario, you'd fetch the ID first, but here's a subquery approach
INSERT INTO scheme_eligibility_criteria (scheme_id, criterion_type, criterion_value, operator, description, is_mandatory)
VALUES ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 'category', 'OBC,EBC,DNT', 'IN', 'Must belong to OBC, EBC, or DNT category', TRUE);

INSERT INTO scheme_eligibility_criteria (scheme_id, criterion_type, criterion_value, operator, description, is_mandatory)
VALUES ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 'income', '250000', '<=', 'Family income must be ₹2,50,000 or less per year', TRUE);

-- Seed PM YASASVI Documents
INSERT INTO scheme_required_documents (scheme_id, document_name, description, is_mandatory)
VALUES 
  ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 'Income Certificate', 'Issued by Taluk/Revenue office', TRUE),
  ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 'College ID', 'Current college enrollment certificate', TRUE),
  ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 'Aadhaar Card', 'For identity verification', TRUE),
  ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 'Bank Account Details', 'For scholarship disbursement', TRUE);

-- Seed PM YASASVI Steps
INSERT INTO scheme_application_steps (scheme_id, step_number, step_title, step_description, estimated_time)
VALUES 
  ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 1, 'Prepare Required Documents', 'Gather income certificate, college ID, Aadhaar, and bank details', '2-3 days'),
  ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 2, 'Get Income Certificate', 'Obtain from your local Taluk/Revenue office', '3-5 days'),
  ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 3, 'Visit Official Portal', 'Go to the scheme''s official application website', '1 day'),
  ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 4, 'Fill Application Form', 'Complete the online application form with your details', '1-2 hours'),
  ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 5, 'Upload Documents', 'Upload all required documents as PDFs', '30 mins'),
  ((SELECT id FROM schemes WHERE scheme_code = 'PM_YASASVI'), 6, 'Submit Application', 'Review and submit your complete application', '10 mins');
