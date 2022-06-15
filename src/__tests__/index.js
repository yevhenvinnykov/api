const express = require('express');
const mongoose = require('mongoose');
const TEST_DB_URL = 'mongodb://127.0.0.1:27017/test_DB';
mongoose.connect(TEST_DB_URL);

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

require('../routes/users.router')(app);
require('../routes/session.router')(app);
require('../routes/profiles.router')(app);
require('../routes/comments.router')(app);
require('../routes/articles/index')(app);


module.exports = app;
