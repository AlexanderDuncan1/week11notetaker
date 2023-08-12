const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets
app.use(express.static('public'));

// Routes to serve HTML pages
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
    fs.readFile('db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading notes:", err);
            return res.sendStatus(500);
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/notes', (req, res) => {
    const newNote = req.body;

    fs.readFile('db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading notes:", err);
            return res.sendStatus(500);
        }
        const allNotes = JSON.parse(data);
        allNotes.push(newNote);

        fs.writeFile('db/db.json', JSON.stringify(allNotes), (err) => {
            if (err) {
                console.error("Error saving note:", err);
                return res.sendStatus(500);
            }
            res.json(newNote);
        });
    });
});

app.delete('/api/notes/:index', (req, res) => {
    const noteIndex = parseInt(req.params.index, 10);

    fs.readFile('db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading notes:", err);
            return res.sendStatus(500);
        }
        const allNotes = JSON.parse(data);
        
        if (noteIndex < 0 || noteIndex >= allNotes.length) {
            return res.status(400).send("Invalid note index");
        }
        
        allNotes.splice(noteIndex, 1); // Removes the note at the given index
        
        fs.writeFile('db/db.json', JSON.stringify(allNotes), (err) => {
            if (err) {
                console.error("Error deleting note based on index:", err);
                return res.sendStatus(500);
            }
            res.json({ message: "Note deleted based on index!" });
        });
    });
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
