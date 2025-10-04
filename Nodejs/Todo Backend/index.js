const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// File path for storing todos - CHANGED TO storage.json
const todosFilePath = path.join(__dirname, 'storage.json');

// Load todos from file on startup
let todo = [];
try {
    if (fs.existsSync(todosFilePath)) {
        const data = fs.readFileSync(todosFilePath, 'utf8');
        todo = JSON.parse(data);
        console.log('Loaded todos from storage.json:', todo.length);
    }
} catch (error) {
    console.log('Error loading todos:', error);
    todo = [];
}

// Function to save todos to storage.json
function saveTodosToFile() {
    try {
        fs.writeFileSync(todosFilePath, JSON.stringify(todo, null, 2));
        console.log('Todos saved to storage.json successfully');
    } catch (error) {
        console.log('Error saving todos:', error);
    }
}

// ROUTES

// Serve the HTML file
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'front.html'));
});

// Get all todos (API endpoint)
app.get('/api/todos', function(req, res){
    res.json({
        todos: todo,
        count: todo.length
    });
});

// Add a new todo (API endpoint)
app.post('/api/todos', function(req, res){
    try {
        const id = Date.now() + Math.random(); // Better ID generation
        const { title } = req.body;

        // Validate input
        if (!title || title.trim() === '') {
            return res.status(400).json({
                error: "Title is required"
            });
        }

        console.log('Generated ID:', id);
        console.log('Title from body:', title);
        
        const newTodo = {
            title: title.trim(),
            id,
            createdAt: new Date().toISOString()
        };
        
        todo.push(newTodo);
        
        // Save to storage.json
        saveTodosToFile();
        
        res.json({
            message: "Todo added successfully",
            todo: newTodo,
            totalTodos: todo.length
        });
    } catch (error) {
        console.error('Error adding todo:', error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Delete a todo (API endpoint)
app.delete('/api/todos/:id', function(req, res){
    try {
        const id = parseFloat(req.params.id);
        
        console.log('Deleting todo with ID:', id);
        
        const initialLength = todo.length;
        todo = todo.filter(t => t.id !== id);
        
        if (todo.length < initialLength) {
            saveTodosToFile();
            res.json({
                message: "Todo deleted successfully",
                remainingTodos: todo.length
            });
        } else {
            res.status(404).json({
                message: "Todo not found"
            });
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!'
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('Current todos loaded:', todo.length);
    console.log('Open http://localhost:3000/front.html in your browser');
});