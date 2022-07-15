# Backend Project

Example Node (Express + Mongoose/Sequelize) app containing real world examples (CRUD, auth) that adheres to the RealWorld API spec.

### To get the Node server running locally:

- ✅ Install MongoDB Community Edition (v5.0.7) and run it by executing mongod
- ✅ npm start to start the local server
- ✅ node v16.13
- 🔹 process.env.ORM="MONGOOSE" - to use MongoDB database
- 🔹 process.env.ORM="SEQUELIZE" - to use SQLite database

## Code Overview

### Dependencies

- expressjs - The server for handling and routing HTTP requests
- bcrypt - For encrypting and validating passwords
- jsonwebtoken - For generating JWTs used by authentication
- mongoose - For modeling and mapping MongoDB data to javascript
- sequelize - For modeling and mapping SQLite data to javascript
- sqlite3

### Application Structure

- app.js - The entry point to the application. This file defines the express server and connects it either to MongoDB using mongoose, or SQLite using sequelize. The database configuration depends on the environment variable ORM. The app.js also requires the routes and models that will be used in the application.
- routes/ - This folder contains the route definitions for the API.
- db/ - This folder contains database models and repositories for operations with data from the database. It also contains normalizer.js, which creates response objects out of database documents.
- controllers/ - This folder contains controllers responsible for server-client data transfer and error handling.
- middleware/ - This folder contains middleware for validation of tokens and passwords, and ensures uniqueness.
- services/ - This folder contains classes responsible for bridging the controllers and the DB, adding additional data to the response object before it gets sent.
- **tests**/ - This folder contains integration tests for every endpoint.

## Authentication

Requests are authenticated using the **x-access-token** header with a valid JWT. The middlewares in the routes are used to authenticate requests. The **token middleware** will return a 401 status code if the request cannot be authenticated. The payload of the JWT can then be accessed from req.userId in the endpoint. The **optional token** will not return a 401 status code if the request cannot be authenticated.
