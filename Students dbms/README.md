# Student Database Management System

A comprehensive web-based student database management system that allows teachers to manage students and their marks, while students can view their own marks by entering their roll number.

## Features

### Teacher Portal
- **Student Management**
  - Add new students with personal details
  - View all students in a organized table
  - Delete students (with confirmation)
  - Automatic roll number validation

- **Marks Management**
  - Add marks for students across different subjects
  - Support for different exam types (Regular, Midterm, Final, Quiz)
  - Date tracking for exams
  - Automatic percentage calculation
  - View comprehensive marks for any student

### Student Portal
- **Marks Viewing**
  - Search marks by roll number
  - View personal information
  - See all subject marks with percentages
  - Color-coded performance indicators
  - Exam type and date information

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Additional Libraries**: 
  - CORS for cross-origin requests
  - Body-parser for request parsing
  - Font Awesome for icons

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### Step 3: Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```

## Database Schema

The system uses SQLite with the following tables:

### Students Table
- `id` (Primary Key)
- `roll_number` (Unique)
- `first_name`
- `last_name`
- `email`
- `phone`
- `class`
- `section`
- `created_at`

### Subjects Table
- `id` (Primary Key)
- `subject_name`
- `subject_code` (Unique)
- `created_at`

### Marks Table
- `id` (Primary Key)
- `student_id` (Foreign Key)
- `subject_id` (Foreign Key)
- `marks_obtained`
- `total_marks`
- `exam_type`
- `exam_date`
- `created_at`

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:rollNumber` - Get student by roll number
- `POST /api/students` - Add new student
- `DELETE /api/students/:id` - Delete student

### Subjects
- `GET /api/subjects` - Get all subjects

### Marks
- `GET /api/marks/:studentId` - Get marks for a student
- `POST /api/marks` - Add marks for a student
- `DELETE /api/marks/:id` - Delete mark record

## Usage Guide

### For Teachers

1. **Adding Students**
   - Click on "Teacher Portal"
   - Go to "Manage Students" tab
   - Fill in the student details form
   - Click "Add Student"

2. **Adding Marks**
   - Go to "Manage Marks" tab
   - Select a student from the dropdown
   - Select a subject
   - Enter marks obtained and total marks
   - Choose exam type and date
   - Click "Save Marks"

3. **Viewing Student Marks**
   - In "Manage Marks" tab
   - Select a student from "View Student Marks" dropdown
   - All marks will be displayed with percentages

### For Students

1. **Viewing Your Marks**
   - Click on "Student Portal"
   - Enter your roll number
   - Click "Search"
   - View your personal information and all marks

## Sample Data

The system comes with pre-populated sample data:

### Sample Students
- 2024001 - John Doe
- 2024002 - Jane Smith
- 2024003 - Mike Johnson
- 2024004 - Sarah Williams

### Sample Subjects
- Mathematics (MATH101)
- English (ENG101)
- Science (SCI101)
- History (HIST101)
- Computer Science (CS101)

## Performance Indicators

The system uses color-coded performance indicators:
- **Green (Excellent)**: 80% and above
- **Orange (Good)**: 60% - 79%
- **Yellow (Average)**: 40% - 59%
- **Red (Poor)**: Below 40%

## File Structure

```
student-database-system/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styling
│   └── script.js           # Frontend JavaScript
├── server.js               # Express server
├── database.sql            # Database schema
├── package.json            # Dependencies
└── README.md              # This file
```

## Development Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Real-time Updates**: Immediate feedback for all operations
- **Error Handling**: Comprehensive error messages and validation
- **Data Persistence**: All data stored in SQLite database
- **RESTful API**: Clean API design for future extensibility

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change the PORT in server.js or kill the process using port 3000

2. **Database Issues**
   - Delete `student_database.db` file and restart the server to recreate

3. **Module Not Found**
   - Run `npm install` to ensure all dependencies are installed

### Error Messages
- All error messages are displayed in user-friendly notifications
- Check browser console for detailed error logs during development

## Future Enhancements

Potential features for future versions:
- User authentication for teachers
- Grade calculation and GPA
- Report generation (PDF export)
- Email notifications
- Bulk data import/export
- Advanced search and filtering
- Parent portal access
- Attendance tracking

## Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the package.json file for details.

## Support

For support or questions:
- Check the troubleshooting section
- Review the error messages in the browser console
- Ensure all dependencies are properly installed
