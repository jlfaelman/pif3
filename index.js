const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 3000;
const fundraiser = require('./routes/fundraiser');
const donate = require('./routes/donate');
const user_fundraiser = require('./routes/user');
const settings = require('./routes/settings');
const forward = require('./routes/forward');

// config
app.set('view engine', 'ejs')
app.use(express.static("public"));
app.use(express.static("assets"));
app.use(cors());
// routes
app.use('/fundraiser', fundraiser);
app.use('/donate', donate);
app.use('/settings', settings);
app.use('/forward', forward);
app.use('/user', user_fundraiser);
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/login', (req, res) => {
    res.render('login', { 
        error: req.query.error,
        success: req.query.success,
        verified: req.query.verified
     });
});
app.get('/register', (req, res) => {
    res.render('register', { error: req.query.error });
});




app.listen(port, () => {
    console.log(`Listening on Port http://localhost:${port}`);
});