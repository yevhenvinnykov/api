require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db/index');

const PORT = process.env.SERVER_PORT || 3000;

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

//if (process.env.DEBUG) {
  app.use(
    cors({
      origin: '*',
    })
  );
//}

app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  next();
});

require('./routes/users.router')(app);
require('./routes/profiles.router')(app);
require('./routes/comments.router')(app);
require('./routes/session.router')(app);
require('./routes/articles/index')(app);

db.connect();

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
