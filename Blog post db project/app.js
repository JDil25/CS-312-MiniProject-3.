const express = require('express'); // Importing the express module
const { Pool } = require('pg'); // Importing the pg module for PostgreSQL
const app = express(); // Creating an instance of the express app
const port = 3000; // Defining the port for the server

// Setting up the PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'blogdb',
    password: 'AngelSkippy!24',
    port: 5433, // PostgreSQL server port
});

// Setting EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware for parsing URL-encoded data from POST requests
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files from the 'public' directory
app.use(express.static('public'));

// Redirecting root URL to the signin page
app.get('/', (req, res) => {
    res.redirect('/signin'); 
});

// Rendering the signup page
app.get('/signup', (req, res) => {
    res.render('signup'); 
});

// Handling signup submissions
app.post('/signup', async (req, res) => {
    const { name, user_id, password } = req.body; // Extracting form data
    try {
        // Checking if the user_id already exists in the database
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
        if (result.rows.length > 0) {
            return res.send('User ID already taken. Please choose another one.'); // User ID exists
        }

        // Inserting the new user into the database
        await pool.query('INSERT INTO users (name, user_id, password) VALUES ($1, $2, $3)', [name, user_id, password]);
        res.redirect('/signin'); // Redirecting after successful signup
    } catch (err) {
        console.error(err);
        res.send('Error creating user'); // Handling signup error
    }
});

// Rendering the signin page with an optional error message
app.get('/signin', (req, res) => {
    res.render('signin', { error: null }); 
});

// Handling signin submissions
app.post('/signin', async (req, res) => {
    const { user_id, password } = req.body; 
    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1 AND password = $2', [user_id, password]);
        if (result.rows.length === 0) {
            // Rendering the signin page with an error message for invalid credentials
            return res.render('signin', { error: 'Invalid User ID or Password. Please try again.' });
        }
        
        res.redirect('/index'); // Redirecting to index after successful sign in
    } catch (err) {
        console.error(err);
        res.send('Error signing in'); // Handling signin error
    }
});

// Rendering the index page with blog posts
app.get('/index', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM blog_posts'); // Fetching posts from the database
        const posts = result.rows; // Retrieving posts from the query result
        res.render('index', { posts }); // Passing posts to the index view
    } catch (err) {
        console.error(err);
        res.send('Error fetching posts'); // Handling fetching error
    }
});

// Rendering the create post form
app.get('/create', (req, res) => {
    res.render('create'); // Rendering create.ejs view
});

// Handling the creation of a blog post
app.post('/create', async (req, res) => {
    const { title, body, creator_name } = req.body; // Extracting form data
    try {
        // Inserting the new post into the database using the correct column names
        await pool.query('INSERT INTO blog_posts (title, body, creator_name) VALUES ($1, $2, $3)', [title, body, creator_name]);
        res.redirect('/index'); // Redirecting to index page after creation
    } catch (err) {
        console.error(err);
        res.send('Error creating post'); // Handling creation error
    }
});

// Handling the deletion of a blog post
app.post('/delete/:id', async (req, res) => {
    const { id } = req.params; // Getting the blog post ID from the URL parameters
    try {
        await pool.query('DELETE FROM blog_posts WHERE blog_id = $1', [id]); // Deleting the blog post from the database
        res.redirect('/index'); // Redirecting to index page after deletion
    } catch (err) {
        console.error(err);
        res.send('Error deleting post'); // Handling deletion error
    }
});

// Starting the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`); // Logging server status
});
