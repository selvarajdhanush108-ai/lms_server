import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- SUPABASE CONFIGURATION ---
const supabaseUrl = 'https://zzqftqssuqueegchzajs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cWZ0cXNzdXF1ZWVnY2h6YWpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYzNjkyMywiZXhwIjoyMDc0MjEyOTIzfQ.Jso40RT3jfLAv1nQo_4Pr5SclGzBd_aHIMbWLcaDfMo';

const supabase = createClient(supabaseUrl, supabaseKey);

// --- ROUTES ---

// Health check route
app.get('/', (req, res) => {
    res.send('Library Management Server is running!');
});

// Endpoint to add a new book (Admin) - FIXED
app.post('/upload-book', async (req, res) => {
    // ✨ FIX: Now correctly accepts 'book_code' from the request body.
    const { title, author, genre, cover_image_url, book_code } = req.body;
    if (!title || !author || !book_code) {
        return res.status(400).json({ error: 'Title, Author, and Book Code are required.' });
    }
    try {
        // ✨ FIX: Inserts the 'book_code' into the database.
        const { data, error } = await supabase.from('books').insert([{ title, author, genre, cover_image_url, book_code }]).select();
        if (error) {
            // Handles cases where the book_code is not unique
            if (error.code === '23505') { 
                return res.status(409).json({ error: 'This Book Code is already in use.' });
            }
            throw error;
        }
        res.status(201).json({ message: 'Book uploaded successfully!', book: data[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Endpoint to update book availability (Admin)
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

// Endpoint for users to place an order
app.post('/place-order', async (req, res) => {
    const { book_id, book_title, student_name, student_class, student_roll_number } = req.body;
    if (!book_id || !book_title || !student_name) {
        return res.status(400).json({ error: 'Book and student name are required.' });
    }
    try {
        const { data, error } = await supabase.from('orders').insert([{ book_id, book_title, student_name, student_class, student_roll_number }]).select();
        if (error) throw error;
        res.status(201).json({ message: 'Order placed successfully!', order: data[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Endpoint for admins to get all orders - FIXED
app.get('/get-orders', async (req, res) => {
    try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// --- SERVER START ---
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

