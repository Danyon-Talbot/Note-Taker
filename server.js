const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve the notes page
app.get(['/notes', '/notes.html', '/'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});


// API route to get existing notes
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const notes = JSON.parse(data);
            res.json(notes);
        }
    });
});

// API route to save a new note
app.post('/api/notes', (req, res) => {
    const note = req.body;

    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const notes = JSON.parse(data);
            note.id = Date.now();
            notes.push(note);

            fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.json(note);
                }
            });
        }
    });
});

// API route to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const notes = JSON.parse(data);
            const updatedNotes = notes.filter((note) => note.id !== noteId);

            fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(updatedNotes), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.json({ message: 'Note Deleted' });
                }
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}`);
});