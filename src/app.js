require('dotenv').config();
const express = require('express');
const db = require('./db/models');
const cors = require('cors');

const SERVER_PORT = process.env.SERVER_PORT || 3000;

const app = express();

app.use(express.json());

app.use(express.urlencoded({extended: true}));

if (process.env.DEBUG) {
  app.use(cors({
    origin: '*',
  }));
}

app.use((req, res, next) => {
  res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
  );
  res.header(
      'Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS',
  );
  next();
});


const url = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.DB_NAME}`;

require('./routes/users.router')(app);
require('./routes/profiles.router')(app);
require('./routes/comments.router')(app);
require('./routes/articles/index')(app);

db.mongoose.connect(url).then(() => {
  console.log(`Successfully connected to mongodb
  on port ${process.env.MONGO_PORT}`);
}).catch((err) => console.log(err));


app.listen(SERVER_PORT, () => {
  console.log('Server running on port ' + SERVER_PORT);
});
