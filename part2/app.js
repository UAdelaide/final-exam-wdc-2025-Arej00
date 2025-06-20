const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

app.get('/owner-dashboard.html',(req,res) => {
    if(!req.session.user || req.session.user.role !=='owner'){
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname,'public','owner-dashboard.html'));
})

// Export the app instead of listening here
module.exports = app;