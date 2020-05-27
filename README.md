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
|/api/events |GET | |
| |POST |Yes |
|/api/events/upcoming |GET |Yes |
|/api/families/ |GET |Yes |
| |POST |Yes |
|/api/families/:familyId |GET |Yes |
|/api/lists |GET |Yes |
| |POST |Yes |
|/api/listItems/ |GET |Yes |
|/api/listItems/:listItemsId |GET |Yes |
| |DELETE |Yes |
|/api/points |GET |Yes |
|/api/rewards |GET |Yes |
| |POST |Yes |
|/api/rewards/:rewardId |PATCH |YES |
|/api/tasks |GET |Yes |
|/api/tasks/:task_Id|GET |Yes |
| |DELETE |Yes |
| |PATCH |Yes |
|/api/users |POST | |
|/api/users/:userId|GET |Yes |
| |DELETE |Yes |
| |PATCH |Yes |
