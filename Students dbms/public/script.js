// Student Database Management System - Frontend JavaScript

class StudentDB {
    constructor() {
        // Check if we're running on a different port than the backend
        const currentPort = window.location.port;
        if (currentPort && currentPort !== '3000') {
            // Frontend is on different port (like Live Server), point to backend
            this.apiBase = 'http://localhost:3000/api';
        } else {
            // Frontend served by backend, use relative URLs
            this.apiBase = '/api';
        }
        console.log('API Base URL:', this.apiBase);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('teacherBtn').addEventListener('click', () => this.switchPortal('teacher'));
        document.getElementById('studentBtn').addEventListener('click', () => this.switchPortal('student'));

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Forms
        document.getElementById('addStudentForm').addEventListener('submit', (e) => this.handleAddStudent(e));
        document.getElementById('editStudentForm').addEventListener('submit', (e) => this.handleEditStudent(e));
        document.getElementById('addMarksForm').addEventListener('submit', (e) => this.handleAddMarks(e));
        document.getElementById('studentSearchForm').addEventListener('submit', (e) => this.handleStudentSearch(e));
        document.getElementById('filterForm').addEventListener('submit', (e) => this.handleFilter(e));

        // Filter controls
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickFilter(e));
        });

        // Dropdowns
        document.getElementById('viewStudentSelect').addEventListener('change', (e) => this.viewStudentMarks(e.target.value));

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.closeEditModal());
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeEditModal());

        // Message close
        document.getElementById('closeMessage').addEventListener('click', () => this.hideMessage());
    }

    async loadInitialData() {
        // Add a small delay to ensure server is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            await this.loadStudents();
            await this.loadSubjects();
        } catch (error) {
            console.error('Error loading initial data:', error);
            // Retry after a delay
            setTimeout(() => {
                console.log('Retrying initial data load...');
                this.loadInitialData();
            }, 2000);
        }
    }

    // Navigation
    switchPortal(portal) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${portal}Btn`).classList.add('active');

        // Update portals
        document.querySelectorAll('.portal').forEach(p => p.classList.remove('active'));
        document.getElementById(`${portal}Portal`).classList.add('active');

        // Load data for teacher portal
        if (portal === 'teacher') {
            this.loadStudents();
            this.loadSubjects();
        }
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tab}Tab`).classList.add('active');

        // Load specific data based on tab
        if (tab === 'marks') {
            this.loadStudents(); // This will populate dropdowns with current students
        } else if (tab === 'filter') {
            this.loadFilterData();
        }
    }

    // API calls
    async apiCall(endpoint, options = {}) {
        this.showLoading();
        
        console.log('Making API call:', {
            url: `${this.apiBase}${endpoint}`,
            method: options.method || 'GET',
            headers: options.headers,
            body: options.body
        });
        
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            console.log('Response received:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            // Check if response has content
            const text = await response.text();
            console.log('Response text:', text);
            
            if (!response.ok) {
                let errorMessage = 'Something went wrong';
                try {
                    const errorData = JSON.parse(text);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // If text is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            // Try to parse as JSON, return empty object if no content
            if (!text) {
                return {};
            }

            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Invalid JSON response:', text);
                throw new Error('Invalid server response');
            }
        } catch (error) {
            console.error('API call error:', error);
            this.showMessage(error.message, 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    // Students Management
    async loadStudents() {
        try {
            const students = await this.apiCall('/students');
            this.displayStudents(students);
            this.populateStudentDropdowns(students);
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    displayStudents(students) {
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = '';

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.roll_number}</td>
                <td>${student.first_name} ${student.last_name}</td>
                <td>${student.email || 'N/A'}</td>
                <td>${student.class || 'N/A'}</td>
                <td>${student.section || 'N/A'}</td>
                <td><span class="badge">${student.total_marks_entries}</span></td>
                <td>
                    <button class="btn-secondary" onclick="studentDB.editStudent(${student.id})" style="margin-right: 10px;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-danger" onclick="studentDB.deleteStudent(${student.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    populateStudentDropdowns(students = null) {
        const dropdowns = [
            document.getElementById('studentSelect'),
            document.getElementById('viewStudentSelect')
        ];

        dropdowns.forEach(dropdown => {
            if (!dropdown) return;
            
            // Keep the first option
            const firstOption = dropdown.querySelector('option[value=""]');
            dropdown.innerHTML = '';
            if (firstOption) {
                dropdown.appendChild(firstOption);
            } else {
                // Add default option if it doesn't exist
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select a student...';
                dropdown.appendChild(defaultOption);
            }

            if (students) {
                students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.roll_number} - ${student.first_name} ${student.last_name}`;
                    dropdown.appendChild(option);
                });
            }
        });
    }

    async handleAddStudent(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const studentData = Object.fromEntries(formData.entries());

        // Debug logging
        console.log('Form data being sent:', studentData);

        // Validate required fields
        if (!studentData.roll_number || !studentData.first_name || !studentData.last_name) {
            this.showMessage('Please fill in all required fields (Roll Number, First Name, Last Name)', 'error');
            return;
        }

        try {
            const result = await this.apiCall('/students', {
                method: 'POST',
                body: JSON.stringify(studentData)
            });

            console.log('Server response:', result);
            this.showMessage('Student added successfully!', 'success');
            e.target.reset();
            this.loadStudents();
        } catch (error) {
            console.error('Error adding student:', error);
            // Error already handled in apiCall
        }
    }

    async deleteStudent(studentId) {
        if (!confirm('Are you sure you want to delete this student? This will also delete all their marks.')) {
            return;
        }

        try {
            await this.apiCall(`/students/${studentId}`, { method: 'DELETE' });
            this.showMessage('Student deleted successfully!', 'success');
            this.loadStudents();
        } catch (error) {
            // Error already handled in apiCall
        }
    }

    // Subjects Management
    async loadSubjects() {
        try {
            console.log('Loading subjects...');
            const subjects = await this.apiCall('/subjects');
            console.log('Subjects loaded:', subjects);
            this.populateSubjectDropdown(subjects);
        } catch (error) {
            console.error('Error loading subjects:', error);
            // Don't show error message for subjects since it's not critical for initial page load
            // this.showMessage('Failed to load subjects. Please refresh the page.', 'error');
        }
    }

    populateSubjectDropdown(subjects) {
        const dropdown = document.getElementById('subjectSelect');
        const firstOption = dropdown.querySelector('option[value=""]');
        dropdown.innerHTML = '';
        if (firstOption) {
            dropdown.appendChild(firstOption);
        }

        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = `${subject.subject_name} (${subject.subject_code})`;
            dropdown.appendChild(option);
        });
    }

    // Marks Management
    async handleAddMarks(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const marksData = Object.fromEntries(formData.entries());

        // Validate marks
        const marksObtained = parseFloat(marksData.marks_obtained);
        const totalMarks = parseFloat(marksData.total_marks);

        if (marksObtained > totalMarks) {
            this.showMessage('Marks obtained cannot be greater than total marks!', 'error');
            return;
        }

        try {
            await this.apiCall('/marks', {
                method: 'POST',
                body: JSON.stringify(marksData)
            });

            this.showMessage('Marks added successfully!', 'success');
            e.target.reset();
            
            // Refresh the view if a student is selected
            const selectedStudent = document.getElementById('viewStudentSelect').value;
            if (selectedStudent) {
                this.viewStudentMarks(selectedStudent);
            }
        } catch (error) {
            // Error already handled in apiCall
        }
    }

    async viewStudentMarks(studentId) {
        if (!studentId) {
            document.getElementById('studentMarksDisplay').innerHTML = '';
            return;
        }

        try {
            const marks = await this.apiCall(`/marks/${studentId}`);
            this.displayStudentMarks(marks);
        } catch (error) {
            document.getElementById('studentMarksDisplay').innerHTML = 
                '<p class="error">Error loading student marks.</p>';
        }
    }

    displayStudentMarks(marks) {
        const container = document.getElementById('studentMarksDisplay');
        
        if (marks.length === 0) {
            container.innerHTML = '<p class="info">No marks found for this student.</p>';
            return;
        }

        const studentInfo = marks[0];
        let html = `
            <div class="student-info">
                <h4>${studentInfo.first_name} ${studentInfo.last_name} (${studentInfo.roll_number})</h4>
            </div>
            <div class="marks-grid">
        `;

        marks.forEach(mark => {
            const percentage = ((mark.marks_obtained / mark.total_marks) * 100).toFixed(2);
            const gradeClass = this.getGradeClass(percentage);
            
            html += `
                <div class="mark-card">
                    <h4>${mark.subject_name}</h4>
                    <div class="subject-code">${mark.subject_code}</div>
                    <div class="marks-info">
                        <div>
                            <strong>${mark.marks_obtained}</strong>
                            <span>Obtained</span>
                        </div>
                        <div>
                            <strong>${mark.total_marks}</strong>
                            <span>Total</span>
                        </div>
                    </div>
                    <div class="percentage ${gradeClass}">
                        ${percentage}%
                    </div>
                    <div class="exam-info">
                        <small>Type: ${mark.exam_type} | Date: ${mark.exam_date || 'N/A'}</small>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    // Student Portal
    async handleStudentSearch(e) {
        e.preventDefault();
        const rollNumber = document.getElementById('studentRollNumber').value.trim();

        if (!rollNumber) {
            this.showMessage('Please enter a roll number', 'error');
            return;
        }

        try {
            const student = await this.apiCall(`/students/${rollNumber}`);
            this.displayStudentResults(student);
        } catch (error) {
            document.getElementById('studentResults').style.display = 'none';
            // Error already handled in apiCall
        }
    }

    displayStudentResults(student) {
        // Display student info
        const studentInfo = document.getElementById('studentInfo');
        studentInfo.innerHTML = `
            <div class="student-info">
                <h4>${student.first_name} ${student.last_name}</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Roll Number</strong>
                        ${student.roll_number}
                    </div>
                    <div class="info-item">
                        <strong>Email</strong>
                        ${student.email || 'N/A'}
                    </div>
                    <div class="info-item">
                        <strong>Class</strong>
                        ${student.class || 'N/A'}
                    </div>
                    <div class="info-item">
                        <strong>Section</strong>
                        ${student.section || 'N/A'}
                    </div>
                </div>
            </div>
        `;

        // Display marks
        const marksContainer = document.getElementById('studentMarks');
        if (student.marks.length === 0) {
            marksContainer.innerHTML = '<p class="info">No marks available yet.</p>';
        } else {
            let html = '<div class="marks-grid">';
            
            student.marks.forEach(mark => {
                const gradeClass = this.getGradeClass(mark.percentage);
                
                html += `
                    <div class="mark-card">
                        <h4>${mark.subject_name}</h4>
                        <div class="subject-code">${mark.subject_code}</div>
                        <div class="marks-info">
                            <div>
                                <strong>${mark.marks_obtained}</strong>
                                <span>Obtained</span>
                            </div>
                            <div>
                                <strong>${mark.total_marks}</strong>
                                <span>Total</span>
                            </div>
                        </div>
                        <div class="percentage ${gradeClass}">
                            ${mark.percentage}%
                        </div>
                        <div class="exam-info">
                            <small>Type: ${mark.exam_type} | Date: ${mark.exam_date || 'N/A'}</small>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            marksContainer.innerHTML = html;
        }

        document.getElementById('studentResults').style.display = 'block';
    }

    // Utility functions
    getGradeClass(percentage) {
        if (percentage >= 80) return 'excellent';
        if (percentage >= 60) return 'good';
        if (percentage >= 40) return 'average';
        return 'poor';
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showMessage(text, type = 'info') {
        const messageEl = document.getElementById('message');
        const messageText = document.getElementById('messageText');
        
        messageText.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'flex';

        // Auto-hide after 5 seconds
        setTimeout(() => this.hideMessage(), 5000);
    }

    hideMessage() {
        document.getElementById('message').style.display = 'none';
    }

    // Edit Student Functions
    async editStudent(studentId) {
        try {
            // Get student data from the table or make an API call
            const students = await this.apiCall('/students');
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                this.showMessage('Student not found', 'error');
                return;
            }

            // Populate the edit form
            document.getElementById('editStudentId').value = student.id;
            document.getElementById('editRollNumber').value = student.roll_number;
            document.getElementById('editFirstName').value = student.first_name;
            document.getElementById('editLastName').value = student.last_name;
            document.getElementById('editEmail').value = student.email || '';
            document.getElementById('editPhone').value = student.phone || '';
            document.getElementById('editClass').value = student.class || '';
            document.getElementById('editSection').value = student.section || '';

            // Show the modal
            document.getElementById('editModal').style.display = 'flex';
        } catch (error) {
            console.error('Error loading student for edit:', error);
            this.showMessage('Error loading student data', 'error');
        }
    }

    async handleEditStudent(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const studentData = Object.fromEntries(formData.entries());
        const studentId = document.getElementById('editStudentId').value;

        // Debug logging
        console.log('Editing student ID:', studentId);
        console.log('Edit form data:', studentData);

        // Validate required fields
        if (!studentData.roll_number || !studentData.first_name || !studentData.last_name) {
            this.showMessage('Please fill in all required fields (Roll Number, First Name, Last Name)', 'error');
            return;
        }

        try {
            const result = await this.apiCall(`/students/${studentId}`, {
                method: 'PUT',
                body: JSON.stringify(studentData)
            });

            console.log('Edit response:', result);
            this.showMessage('Student updated successfully!', 'success');
            this.closeEditModal();
            this.loadStudents();
        } catch (error) {
            console.error('Error updating student:', error);
            // Error already handled in apiCall
        }
    }

    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('editStudentForm').reset();
    }

    // Filter Functions
    async loadFilterData() {
        try {
            // Load subjects for filter dropdown
            const subjects = await this.apiCall('/subjects');
            this.populateFilterSubjects(subjects);

            // Load performance statistics
            const stats = await this.apiCall('/stats/performance');
            this.displayPerformanceStats(stats);
        } catch (error) {
            console.error('Error loading filter data:', error);
        }
    }

    populateFilterSubjects(subjects) {
        const dropdown = document.getElementById('filterSubject');
        // Keep the first option
        const firstOption = dropdown.querySelector('option[value=""]');
        dropdown.innerHTML = '';
        if (firstOption) {
            dropdown.appendChild(firstOption);
        }

        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.subject_code;
            option.textContent = `${subject.subject_name} (${subject.subject_code})`;
            dropdown.appendChild(option);
        });
    }

    displayPerformanceStats(stats) {
        const container = document.getElementById('performanceStats');
        container.innerHTML = `
            <div class="stat-card">
                <h4>Total Students</h4>
                <div class="stat-value">${stats.total_students || 0}</div>
                <div class="stat-label">Registered</div>
            </div>
            <div class="stat-card">
                <h4>Overall Average</h4>
                <div class="stat-value">${stats.overall_average || 0}%</div>
                <div class="stat-label">Class Performance</div>
            </div>
            <div class="stat-card excellent">
                <h4>Excellent</h4>
                <div class="stat-value">${stats.excellent_count || 0}</div>
                <div class="stat-label">80% and above</div>
            </div>
            <div class="stat-card good">
                <h4>Good</h4>
                <div class="stat-value">${stats.good_count || 0}</div>
                <div class="stat-label">60% - 79%</div>
            </div>
            <div class="stat-card average">
                <h4>Average</h4>
                <div class="stat-value">${stats.average_count || 0}</div>
                <div class="stat-label">40% - 59%</div>
            </div>
            <div class="stat-card poor">
                <h4>Needs Help</h4>
                <div class="stat-value">${stats.poor_count || 0}</div>
                <div class="stat-label">Below 40%</div>
            </div>
        `;
    }

    handleQuickFilter(e) {
        e.preventDefault();
        const filterType = e.target.closest('.filter-btn').dataset.filter;
        
        // Clear existing active states
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active state to clicked button
        e.target.closest('.filter-btn').classList.add('active');
        
        // Set filter values based on type
        const form = document.getElementById('filterForm');
        switch (filterType) {
            case 'excellent':
                form.minMarks.value = '80';
                form.maxMarks.value = '100';
                break;
            case 'good':
                form.minMarks.value = '60';
                form.maxMarks.value = '79.99';
                break;
            case 'average':
                form.minMarks.value = '40';
                form.maxMarks.value = '59.99';
                break;
            case 'poor':
                form.minMarks.value = '0';
                form.maxMarks.value = '39.99';
                break;
        }
        
        // Apply the filter
        this.applyFilters();
    }

    async handleFilter(e) {
        e.preventDefault();
        this.applyFilters();
    }

    async applyFilters() {
        try {
            const form = document.getElementById('filterForm');
            const formData = new FormData(form);
            const filterParams = new URLSearchParams();

            // Add non-empty parameters
            for (const [key, value] of formData.entries()) {
                if (value && value.trim() !== '') {
                    filterParams.append(key, value);
                }
            }

            console.log('Applying filters:', Object.fromEntries(filterParams));

            const filteredStudents = await this.apiCall(`/students/filter?${filterParams}`);
            this.displayFilterResults(filteredStudents);
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    displayFilterResults(students) {
        const container = document.getElementById('filterResults');
        
        if (students.length === 0) {
            container.innerHTML = '<p class="info">No students match the selected criteria.</p>';
            return;
        }

        let html = `
            <div class="filter-results-table">
                <table>
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Section</th>
                            <th>Avg Percentage</th>
                            <th>Performance</th>
                            <th>Total Marks</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        students.forEach(student => {
            const gradeClass = this.getGradeClass(student.avg_percentage);
            html += `
                <tr>
                    <td>${student.roll_number}</td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>${student.class || 'N/A'}</td>
                    <td>${student.section || 'N/A'}</td>
                    <td>${student.avg_percentage || 'N/A'}${student.avg_percentage ? '%' : ''}</td>
                    <td>
                        <span class="performance-grade ${gradeClass.replace('percentage ', '')}">
                            ${student.performance_grade}
                        </span>
                    </td>
                    <td><span class="badge">${student.total_marks_entries}</span></td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; text-align: center; color: #718096;">
                <strong>${students.length}</strong> student(s) found
            </div>
        `;

        container.innerHTML = html;
    }

    clearFilters() {
        document.getElementById('filterForm').reset();
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('filterResults').innerHTML = '<p class="info">Apply filters above to see results</p>';
    }
}

// Initialize the application
const studentDB = new StudentDB();

// Make it globally available for inline event handlers
window.studentDB = studentDB;
