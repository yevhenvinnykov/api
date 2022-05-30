require('dotenv').config();
const express = require('express');
const db = require('./models');
const cors = require('cors');

const server_port = process.env.SERVER_PORT || 3000;

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: '*'
}));

app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    res.header(
        "Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS"
    );
    next();
});



const url = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.DB_NAME}`;

require('./routes/users.router')(app);
require('./routes/articles.router')(app);
require('./routes/profiles.router')(app);
require('./routes/comments.router')(app);



db.mongoose.connect(url).then(() => {
    console.log('Successfully connected to MongoDB on port ' + process.env.MONGO_PORT);
}).catch((err) => console.log(err));



app.listen(server_port, () => {
    console.log('Server running on port ' + server_port);
});