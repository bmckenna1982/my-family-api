# MyFamily API server

This is the REST API server for MyFamily. It supports both open and protected endpoints and is built around PostgreSQL database.

## Set up

1. Clone this repository to your local machine `git clone https://github.com/bmckenna1982/my-family-api.git NEW-PROJECTS-NAME` 
2. `cd` into the cloned repository
3. Install the node dependencies `npm install`
4. Move the example Environment file to .env  `mv example.env .env`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Technologies

* Node
* Express
* PostgreSQL

## Endpoints

|Path       |Method    |Protected |
|:-------------|:---------|:---------|
|/api/login |POST      |        |
|/api/schedule |GET | |
| |POST |Yes |
|/api/schedule/:gameId |GET |Yes |
|/api/schedule/:gameId/rsvp |GET |Yes |
|/api/message-board |GET |Yes |
| |POST |Yes |
|/api/message-board/:messageId |GET |Yes |
| |DELETE |Yes |
|/api/latest-message |GET | |
|/api/comments |GET |Yes |
| |POST |Yes |
|/api/comments/:commentId|GET |Yes |
| |DELETE |Yes |
| |PATCH |Yes |
|/api/users |POST | |
|/api/users/:userId|GET |Yes |
| |DELETE |Yes |
| |PATCH |Yes |
