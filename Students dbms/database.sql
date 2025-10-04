-- Student Database Management System
-- Database Schema

-- Create Students table
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    class VARCHAR(20),
    section VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Marks table
CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    exam_type VARCHAR(50) DEFAULT 'Regular',
    exam_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE(student_id, subject_id, exam_type, exam_date)
);

-- Insert sample subjects
INSERT OR IGNORE INTO subjects (subject_name, subject_code) VALUES
('Mathematics', 'MATH101'),
('English', 'ENG101'),
('Science', 'SCI101'),
('History', 'HIST101'),
('Computer Science', 'CS101');

-- Insert sample students
INSERT OR IGNORE INTO students (roll_number, first_name, last_name, email, class, section) VALUES
('2024001', 'John', 'Doe', 'john.doe@email.com', '10th', 'A'),
('2024002', 'Jane', 'Smith', 'jane.smith@email.com', '10th', 'A'),
('2024003', 'Mike', 'Johnson', 'mike.johnson@email.com', '10th', 'B'),
('2024004', 'Sarah', 'Williams', 'sarah.williams@email.com', '10th', 'B');
