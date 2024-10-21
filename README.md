# Node.js Simple CRUD API

This repository contains solution for a CRUD API assignment using Node.js.

The project was completed as part of the [RS School](https://rs.school/) [NodeJS 2024 Q3 course (CRUD API task)](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md).

## Assignment Description

The goal of this assignment is to create a simple CRUD API for managing users. The API should expose endpoints to perform the following operations:

* Create a new user
* Retrieve a list of users
* Get a single user by uuid
* Update an existing user
* Delete a user

## Technical Details

This application is built with the following technical considerations:

* **Node.js Version:** Requires Node.js version 22.9.0 or higher for execution.

* **Dependencies:** The production environment relies solely on the `dotenv` and `uuid` packages for minimal overhead.

* **Asynchronous Programming:**  The application leverages asynchronous APIs for improved performance and responsiveness.

* **Horizontal Scaling:** To maximize resource utilization and throughput, the application is designed for horizontal scaling based on available CPU cores. 

* **Cluster API:** Node.js's Cluster API is employed to manage worker processes. The master process acts as a load balancer, distributing incoming requests among the worker processes using a round-robin algorithm. This strategy ensures efficient workload distribution and enhances the application's ability to handle concurrent requests effectively.

## API Endpoints

The API exposes the following endpoints:

| Method | Endpoint | Description | Response Structure | Status Codes |
|---|---|---|---|---|
| **`GET`** | `/api/users` | Get all users |  `[{user}, {user}, ...]` | `200 OK` |
| **`GET`** | `/api/users/{userId}` | Get a single user by uuid | `{user}` | `200 OK`, `400 Bad Request` - userId is invalid (not uuid), `404 Not Found` |
| **`POST`** | `/api/users` | Create a new user | `{createdUser}` | `201 Created` - newly created record, `400 Bad Request` |
| **`PUT`** | `/api/users/{userId}` | Update an existing user | `{updatedUser}` | `200 OK`, `400 Bad Request` - userId is invalid (not uuid), `404 Not Found` |
| **`DELETE`** | `/api/users/{userId}` | Delete a user | (No Content) | `204 No Content` - record is found and deleted,  `400 Bad Request` - userId is invalid (not uuid), `404 Not Found` |

Status Code `500 Internal Server Error` - return if server error

## API Specifications

The API adheres to the following specifications:

### Data Format

* The API uses JSON format:
  - `id` — unique identifier (`string`, `uuid`) generated on server side
  - `username` — user's name (`string`, **required**)
  - `age` — user's age (`number`, **required**)
  - `hobbies` — user's hobbies (`array` of `strings` or empty `array`, **required**)
* The `Content-Type` header for requests should be set to `application/json`.

### Response Structure

* Successful requests will return a status code of `200 OK`, `201 Created`, `204 No Content` and provide JSON response body.
* Error responses will include a status code other than `200 OK`, `201 Created`, `204 No Content` and a JSON response body with an error message.

### Error Handling

* The API handles invalid requests and returns appropriate error codes and messages.

## Project Setup

1. **Clone the repository:**
```
git clone https://github.com/SunSundr/nodejs-simple-CRUD-API
```
2. **Navigate to the project directory:**
```
cd nodejs-simple-CRUD-API
```
3. **Define the `.env` file:**
```
cp .env.example .env
```
Then, open the newly created `.env` file and set the `PORT` variable to the desired port number for your application.

4. **Install the dependencies:**
```
npm install
```

## Running the Application

To run the application, you can use the following commands:

1. **Start the development server:**
   ```bash
   npm run start:dev
   ```
   This command will start the application in development mode using nodemon, which will automatically restart the server when changes are made to the code.
2. **Start the application in multi-process mode:** (horizontal scaling for application)
   ```bash
   npm run start:multi
   ```
   This command will start the application in multi-process mode using nodemon, which will automatically restart the server when changes are made to the code.
3. **Build and start the application in production mode:**
   ```bash
   npm run start:prod
   ```
   This command will first build the application in production mode using webpack, and then start the application using the built files.
4. **Build and start the application in production mode with multi-process support:** (horizontal scaling for application)
   ```bash
   npm run start:prod:multi
   ```
   This command will first build the application in production mode using webpack, and then start the application in multi-process mode using the built files.
5. **Build the application in development mode:**
   ```bash
   npm run build:dev
   ```
   This command will build the application in development mode using webpack.
6. **Build the application in production mode:**
   ```bash
   npm run build:prod
   ```
   This command will build the application in production mode using webpack.

For your convenience, the following npm scripts are defined in the `package.json` file:

- `start:dev`
- `start:multi`
- `start:prod`
- `start:prod:multi`
- `build:dev`
- `build:prod`

## Testing

This project includes a suite of tests to ensure the functionality and reliability of the CRUD API. The tests are located in the `src/tests` directory and are written using the Jest testing framework.

Several key usage scenarios are covered in the test suite. To execute the tests, utilize the following npm scripts defined in the `package.json` file:

- **`test`**: Runs all tests in silent mode, suppressing unnecessary output.
- **`test:verbose`**: Runs all tests with detailed output, providing comprehensive information about the test execution. 

This approach simplifies the testing process and promotes confidence in the application's stability. 
