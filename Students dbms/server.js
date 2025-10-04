const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Handle OPTIONS requests for CORS
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// Database setup
const db = new sqlite3.Database('student_database.db');

// Initialize database with schema
const initDatabase = () => {
    const schema = fs.readFileSync('database.sql', 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database initialized successfully');
        }
    });
};

initDatabase();

// API Routes

// Get all students
app.get('/api/students', (req, res) => {
    const query = `
        SELECT s.*, COUNT(m.id) as total_marks_entries
        FROM students s
        LEFT JOIN marks m ON s.id = m.student_id
        GROUP BY s.id
        ORDER BY s.roll_number
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get filtered students by performance (must come before /:rollNumber route)
app.get('/api/students/filter', (req, res) => {
    console.log('GET /api/students/filter called with query:', req.query);
    
    const { minMarks, maxMarks, class: studentClass, section, subject } = req.query;
    
    let query = `
        SELECT s.*, 
               AVG(m.marks_obtained) as avg_marks,
               AVG((m.marks_obtained / m.total_marks) * 100) as avg_percentage,
               COUNT(m.id) as total_marks_entries
        FROM students s
        LEFT JOIN marks m ON s.id = m.student_id
    `;
    
    let conditions = [];
    let params = [];
    
    // Add subject filter if specified
    if (subject) {
        query += ` LEFT JOIN subjects sub ON m.subject_id = sub.id`;
        conditions.push('sub.subject_code = ?');
        params.push(subject);
    }
    
    // Add class filter
    if (studentClass) {
        conditions.push('s.class = ?');
        params.push(studentClass);
    }
    
    // Add section filter
    if (section) {
        conditions.push('s.section = ?');
        params.push(section);
    }
    
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` GROUP BY s.id`;
    
    // Add marks filter after GROUP BY
    let havingConditions = [];
    if (minMarks) {
        havingConditions.push('AVG((m.marks_obtained / m.total_marks) * 100) >= ?');
        params.push(parseFloat(minMarks));
    }
    if (maxMarks) {
        havingConditions.push('AVG((m.marks_obtained / m.total_marks) * 100) <= ?');
        params.push(parseFloat(maxMarks));
    }
    
    if (havingConditions.length > 0) {
        query += ` HAVING ${havingConditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY s.roll_number`;
    
    console.log('Executing filter query:', query);
    console.log('With parameters:', params);
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error filtering students:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Round the averages and add performance grade
        const studentsWithGrades = rows.map(student => ({
            ...student,
            avg_marks: student.avg_marks ? parseFloat(student.avg_marks).toFixed(2) : null,
            avg_percentage: student.avg_percentage ? parseFloat(student.avg_percentage).toFixed(2) : null,
            performance_grade: getPerformanceGrade(student.avg_percentage)
        }));
        
        console.log('Filtered students found:', studentsWithGrades.length);
        res.json(studentsWithGrades);
    });
});

// Get student by roll number
app.get('/api/students/:rollNumber', (req, res) => {
    const rollNumber = req.params.rollNumber;
    
    const query = `
        SELECT s.*, 
               sub.subject_name, sub.subject_code,
               m.marks_obtained, m.total_marks, m.exam_type, m.exam_date
        FROM students s
        LEFT JOIN marks m ON s.id = m.student_id
        LEFT JOIN subjects sub ON m.subject_id = sub.id
        WHERE s.roll_number = ?
        ORDER BY sub.subject_name
    `;
    
    db.all(query, [rollNumber], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (rows.length === 0) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        
        // Structure the response
        const student = {
            id: rows[0].id,
            roll_number: rows[0].roll_number,
            first_name: rows[0].first_name,
            last_name: rows[0].last_name,
            email: rows[0].email,
            phone: rows[0].phone,
            class: rows[0].class,
            section: rows[0].section,
            marks: rows.filter(row => row.subject_name).map(row => ({
                subject_name: row.subject_name,
                subject_code: row.subject_code,
                marks_obtained: row.marks_obtained,
                total_marks: row.total_marks,
                percentage: ((row.marks_obtained / row.total_marks) * 100).toFixed(2),
                exam_type: row.exam_type,
                exam_date: row.exam_date
            }))
        };
        
        res.json(student);
    });
});

// Add new student
app.post('/api/students', (req, res) => {
    console.log('POST /api/students called');
    console.log('Request body:', req.body);
    
    const { roll_number, first_name, last_name, email, phone, class: studentClass, section } = req.body;
    
    // Validate required fields
    if (!roll_number || !first_name || !last_name) {
        return res.status(400).json({ error: 'Roll number, first name, and last name are required' });
    }
    
    const query = `
        INSERT INTO students (roll_number, first_name, last_name, email, phone, class, section)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    console.log('Executing query with values:', [roll_number, first_name, last_name, email, phone, studentClass, section]);
    
    db.run(query, [roll_number, first_name, last_name, email, phone, studentClass, section], function(err) {
        if (err) {
            console.error('Database error:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'Roll number already exists' });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        console.log('Student added successfully with ID:', this.lastID);
        res.json({ id: this.lastID, message: 'Student added successfully' });
    });
});

// Update student
app.put('/api/students/:id', (req, res) => {
    console.log('PUT /api/students/' + req.params.id + ' called');
    console.log('Request body:', req.body);
    
    const studentId = req.params.id;
    const { roll_number, first_name, last_name, email, phone, class: studentClass, section } = req.body;
    
    // Validate required fields
    if (!roll_number || !first_name || !last_name) {
        return res.status(400).json({ error: 'Roll number, first name, and last name are required' });
    }
    
    const query = `
        UPDATE students 
        SET roll_number = ?, first_name = ?, last_name = ?, email = ?, phone = ?, class = ?, section = ?
        WHERE id = ?
    `;
    
    console.log('Executing update query with values:', [roll_number, first_name, last_name, email, phone, studentClass, section, studentId]);
    
    db.run(query, [roll_number, first_name, last_name, email, phone, studentClass, section, studentId], function(err) {
        if (err) {
            console.error('Database error:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'Roll number already exists' });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        
        console.log('Student updated successfully');
        res.json({ message: 'Student updated successfully' });
    });
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
    const studentId = req.params.id;
    
    db.run('DELETE FROM students WHERE id = ?', [studentId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        
        res.json({ message: 'Student deleted successfully' });
    });
});

// Get performance statistics
app.get('/api/stats/performance', (req, res) => {
    console.log('GET /api/stats/performance called');
    
    const query = `
        SELECT 
            COUNT(DISTINCT s.id) as total_students,
            COUNT(m.id) as total_marks_entries,
            AVG((m.marks_obtained / m.total_marks) * 100) as overall_average,
            MIN((m.marks_obtained / m.total_marks) * 100) as lowest_percentage,
            MAX((m.marks_obtained / m.total_marks) * 100) as highest_percentage,
            SUM(CASE WHEN (m.marks_obtained / m.total_marks) * 100 >= 80 THEN 1 ELSE 0 END) as excellent_count,
            SUM(CASE WHEN (m.marks_obtained / m.total_marks) * 100 >= 60 AND (m.marks_obtained / m.total_marks) * 100 < 80 THEN 1 ELSE 0 END) as good_count,
            SUM(CASE WHEN (m.marks_obtained / m.total_marks) * 100 >= 40 AND (m.marks_obtained / m.total_marks) * 100 < 60 THEN 1 ELSE 0 END) as average_count,
            SUM(CASE WHEN (m.marks_obtained / m.total_marks) * 100 < 40 THEN 1 ELSE 0 END) as poor_count
        FROM students s
        LEFT JOIN marks m ON s.id = m.student_id
        WHERE m.id IS NOT NULL
    `;
    
    db.get(query, [], (err, row) => {
        if (err) {
            console.error('Error getting performance stats:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        const stats = {
            ...row,
            overall_average: row.overall_average ? parseFloat(row.overall_average).toFixed(2) : 0,
            lowest_percentage: row.lowest_percentage ? parseFloat(row.lowest_percentage).toFixed(2) : 0,
            highest_percentage: row.highest_percentage ? parseFloat(row.highest_percentage).toFixed(2) : 0
        };
        
        console.log('Performance stats:', stats);
        res.json(stats);
    });
});

// Helper function for performance grades
function getPerformanceGrade(percentage) {
    if (!percentage) return 'No Data';
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Average';
    return 'Needs Improvement';
}

// Get all subjects
app.get('/api/subjects', (req, res) => {
    console.log('GET /api/subjects called');
    db.all('SELECT * FROM subjects ORDER BY subject_name', [], (err, rows) => {
        if (err) {
            console.error('Error loading subjects:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('Subjects found:', rows.length);
        res.json(rows);
    });
});

// Add marks for a student
app.post('/api/marks', (req, res) => {
    const { student_id, subject_id, marks_obtained, total_marks, exam_type, exam_date } = req.body;
    
    const query = `
        INSERT OR REPLACE INTO marks (student_id, subject_id, marks_obtained, total_marks, exam_type, exam_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [student_id, subject_id, marks_obtained, total_marks || 100, exam_type || 'Regular', exam_date], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Marks added successfully' });
    });
});

// Get marks for a specific student
app.get('/api/marks/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    
    const query = `
        SELECT m.*, s.subject_name, s.subject_code, st.roll_number, st.first_name, st.last_name
        FROM marks m
        JOIN subjects s ON m.subject_id = s.id
        JOIN students st ON m.student_id = st.id
        WHERE m.student_id = ?
        ORDER BY s.subject_name
    `;
    
    db.all(query, [studentId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Delete marks
app.delete('/api/marks/:id', (req, res) => {
    const markId = req.params.id;
    
    db.run('DELETE FROM marks WHERE id = ?', [markId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Mark record not found' });
            return;
        }
        
        res.json({ message: 'Mark record deleted successfully' });
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});
