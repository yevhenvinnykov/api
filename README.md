# Backend Project
Example Node (Express + Mongoose) app containing real world examples (CRUD, auth) that adheres to the RealWorld API spec.

### To get the Node server running locally:

* ✅ Clone this repo
* ✅ npm install to install all required dependencies
* ✅ Install MongoDB Community Edition (instructions) and run it by executing mongod
* ✅ npm start to start the local server
* ✅ node v16.13

## Code Overview
### Dependencies
* expressjs - The server for handling and routing HTTP requests
* bcrypt - For encrypting and validating passwords
* jsonwebtoken - For generating JWTs used by authentication
* mongoose - For modeling and mapping MongoDB data to javascript

### Application Structure
* app.js - The entry point to the application. This file defines the express server and connects it to MongoDB using mongoose. It also requires the routes and models that will be used in the application.
* routes/ - This folder contains the route definitions for the API.
* models/ - This folder contains the schema definitions for the Mongoose models.
* controllers/ - This folder containes controllers responsible for business logic
* middleware/ - This route containes middleware for validation of tokens and passwords, and ensures uniqueness 
* utils/ - This folder contains miscellaneous utilities

## Authentication
Requests are authenticated using the **x-access-token** header with a valid JWT. The middlewares in the routes are used to authenticate requests. The **token middleware** will return a 401 status code if the request cannot be authenticated. The payload of the JWT can then be accessed from req.userId in the endpoint. The **optional token** will not return a 401 status code if the request cannot be authenticated.
