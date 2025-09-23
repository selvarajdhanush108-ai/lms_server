import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const supabaseUrl = 'https://zzqftqssuqueegchzajs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cWZ0cXNzdXF1ZWVnY2h6YWpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYzNjkyMywiZXhwIjoyMDc0MjEyOTIzfQ.Jso40RT3jfLAv1nQo_4Pr5SclGzBd_aHIMbWLcaDfMo';

if (supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseKey.includes('YOUR_SUPABASE_SERVICE_ROLE_KEY')) {
    console.error("\x1b[31m%s\x1b[0m", "FATAL ERROR: Supabase URL and Service Role Key are not configured in server.js. The server will not work correctly.");
}

const supabase = createClient(supabaseUrl, supabaseKey);


app.get('/', (req, res) => {
    res.send('Library Management Server is running. Ready to take your book data!');
});

app.post('/upload-book', async (req, res) => {
    const { title, author, genre, cover_image_url } = req.body;

    if (!title || !author) {
        console.log('Upload attempt failed: Missing title or author.');
        return res.status(400).json({ error: 'Title and Author are required fields.' });
    }

    console.log(`Received request to add book: "${title}" by ${author}`);

    try {
        const { data, error } = await supabase
            .from('books')
            .insert([{ title, author, genre, cover_image_url }])
            .select();

        if (error) {
            console.error('Supabase insert error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        console.log('Successfully added book to Supabase:', data);
        res.status(201).json({ message: 'Book uploaded successfully!', book: data[0] });

    } catch (e) {
        console.error('Unexpected server error:', e);
        res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
});

app.post('/update-availability', async (req, res) => {
    const { bookId, isAvailable } = req.body;

    console.log(`Received request to update book ID ${bookId} to available: ${isAvailable}`);

    if (typeof bookId === 'undefined' || typeof isAvailable !== 'boolean') {
        return res.status(400).json({ error: 'Invalid book ID or availability status provided.' });
    }

    try {
        const { data, error } = await supabase
            .from('books')
            .update({ is_available: isAvailable })
            .eq('id', bookId)
            .select();

        if (error) {
            console.error('Supabase update error:', error.message);
            throw new Error('Database update failed.');
        }

        if (data.length === 0) {
             return res.status(404).json({ error: `Book with ID ${bookId} not found.` });
        }

        console.log('Successfully updated book status:', data);
        res.status(200).json({ message: 'Book status updated successfully!', data: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

