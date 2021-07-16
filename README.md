## Schedule API (DaLat University)

`api-dlu` is a library contains functions that helps you create easy API :D. If you get some bug, you can create an issue in repo GitHub https://github.com/trungpq163/api-dlu. Thank you <3

You can click the link here to know `api-dlu` look like: https://respected-intermediate-croissant.glitch.me/?studentID=1710289&yearStudy=2020-2021&termID=HK02&week=16

## Demo (Chatbot using API)

![Alt Text](https://github.com/trungpq163/animp3/blob/master/giphy.gif)

## Installation

With npm (node package manager)

```
npm install api-dlu --save
```

With yarn

```
yarn add api-dlu
```

## Note

You must export environment Account for post-login API

1. Export environment

```cmd
cd pj
export STUDENT_ID=studentID
export PASSWORD=yourpassword
```

2. Or you can create .env in your project

In file .env

```cmd
STUDENT_ID=studentID
PASSWORD=yourpassword
```

## Import Example

```ts
const {
    handleDataScheduleToJSON,
    performSyncScheduleFunctions,
    urlHTMLFile,
    consoleLogAPI,
} = require("api-dlu");
```

## Quick Start

```js
const express = require("express");
const {
    handleDataScheduleToJSON,
    performSyncScheduleFunctions,
    urlHTMLFile,
} = require("api-dlu");
require("dotenv").config();

const port = 8000;
const app = express();

app.use(express.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.get("/", async (req, res) => {
    console.log(Date.now() + " Ping Received");

    if (req.query.studentID) {
        await performSyncScheduleFunctions(
            req.query.studentID,
            req.query.yearStudy,
            req.query.termID,
            req.query.week
        );
    }

    if (req.query.classStudentID) {
        await performSyncScheduleFunctions(
            req.query.classStudentID,
            req.query.yearStudy,
            req.query.termID,
            req.query.week
        );
    }

    if (req.query.professorID) {
        await performSyncScheduleFunctions(
            req.query.professorID,
            req.query.yearStudy,
            req.query.termID,
            req.query.week
        );
    }

    if (
        req.query.studentID ||
        req.query.classStudentID ||
        req.query.professorID
    ) {
        let data = await handleDataScheduleToJSON();
        res.json(data);
        // res.sendFile(__dirname + urlHTMLFile);
    } else {
        const result = {
            example:
                "http://localhost:8000/?studentID={yourStudentID}&yearStudy=2019-2020&termID=HK02&week=18",
            quick: "http://localhost:8000/?studentID=1710289",
            detailExample: {
                studentID: "yourStudentID | example: 1710289, (default: empty)",
                yearStudy: "example: 2019-2020, (default: current year)",
                termID: "example: HK01 | HK02 | HK03, (default: current termID)",
                week: "example: 18, (default: current week)",
            },
        };
        res.json(result);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
```

## Documentation

### performSyncScheduleFunctions

The main function, it handles API :D

-   `performSyncScheduleFunctions(idImport, yearImport, termImport, weekImport)`

-   You must pass a value into `idImport` if not you will get nothing :(

-   yearImport, termImport, weekImport: default if you don't pass value then it will get the current value of (year, term, week)

For example:

```ts
const {
  performSyncScheduleFunctions
} from 'api-dlu';

app.get('/', async (req, res) => {
  if (req.query.studentID) {
    await performSyncScheduleFunctions(req.query.studentID, req.query.yearStudy, req.query.termID, req.query.week);
  }

  if (req.query.classStudentID) {
    await performSyncScheduleFunctions(req.query.classStudentID, req.query.yearStudy, req.query.termID, req.query.week);
  }

  if (req.query.professorID) {
    await performSyncScheduleFunctions(req.query.professorID, req.query.yearStudy, req.query.termID, req.query.week);
  }
})

```

### handleDataScheduleToJSON

Handle data schedule from index.html and convert to json :D

For example:

```ts
const { handleDataScheduleToJSON } = require("api-dlu");

async function dosomething() {
    let data = await handleDataScheduleToJSON();
    res.json(data);
}
```

### urlHTMLFile

Get url html file in api-dlu module for rendering :D

For example:

```ts
const { urlHTMLFile } = require("api-dlu");

app.get("/", async (req, res) => {
    res.sendFile(__dirname + urlHTMLFile);
});
```

### consoleLogAPI

Function display API in CLI (Terminal, CMD, ...)

For example:

```ts
const { consoleLogAPI } = require('api-dlu);
consoleLogAPI("1710289");
```
