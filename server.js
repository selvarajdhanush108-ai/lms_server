import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- SUPABASE CONFIGURATION ---
const supabaseUrl = 'https://zzqftqssuqueegchzajs.supabase.co';
// ✨ FIX: The previous key was malformed. This is the correct one.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cWZ0cXNzdXF1ZWVnY2h6YWpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYzNjkyMywiZXhwIjoyMDc0MjEyOTIzfQ.Jso40RT3jfLAv1nQo_4Pr5SclGzBd_aHIMbWLcaDfMo';

const supabase = createClient(supabaseUrl, supabaseKey);

// --- ROUTES ---

app.get('/', (req, res) => res.send('Library Management Server is running!'));

app.post('/upload-book', async (req, res) => {
    const { title, author, genre, cover_image_url, book_code } = req.body;
    if (!title || !author || !book_code) {
        return res.status(400).json({ error: 'Title, Author, and Book Code are required.' });
    }
    try {
        const { data, error } = await supabase.from('books').insert([{ title, author, genre, cover_image_url, book_code }]).select();
        if (error) {
            if (error.code === '23505') return res.status(409).json({ error: 'This Book Code is already in use.' });
            throw error;
        }
        res.status(201).json({ message: 'Book uploaded successfully!', book: data[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/update-availability', async (req, res) => {
    const { bookId, isAvailable } = req.body;
    if (typeof bookId === 'undefined' || typeof isAvailable !== 'boolean') {
        return res.status(400).json({ error: 'Invalid book ID or availability status.' });
    }
    try {
        const { data, error } = await supabase.from('books').update({ is_available: isAvailable }).eq('id', bookId).select();
        if (error) throw error;
        res.status(200).json({ message: 'Book status updated!', data: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/place-order', async (req, res) => {
    const { book_id, book_title, student_name, student_class, student_roll_number, book_code } = req.body;
    if (!book_id || !book_title || !student_name) {
        return res.status(400).json({ error: 'Book and student name are required.' });
    }
    try {
        const { data, error } = await supabase.from('orders').insert([{ book_id, book_title, student_name, student_class, student_roll_number, book_code }]).select();
        if (error) throw error;
        res.status(201).json({ message: 'Order placed successfully!', order: data[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/get-orders', async (req, res) => {
    try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/fulfill-order/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Order fulfilled successfully!' });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});


// --- SERVER START ---
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

