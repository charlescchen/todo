// Imports
const mysql = require("mysql");
const express = require("express");
require('dotenv').config();
const app = express();

// Port Number
const port = 3000;

// Serve files in "public" folder
app.use(express.static("public"));
app.use(express.json());

// Database connection information
const mySqlInfo = {
    host: "localhost",
    user: "root",
    password: process.env.MYSQLPASSWORD,
    database: "tasks"
};

// Get all incomplete tasks
app.get("/tasks/incomplete", (req, res) => {
    const con = mysql.createConnection(mySqlInfo);

    // Connect to database
    con.connect((err) => {
        if (err) throw err;

        // Query to get all incomplete tasks
        const query = "SELECT * FROM task WHERE complete=0 ORDER BY due;";

        // Perform query
        con.query(query, (err, result) => {
            if (err) throw err;
            // Send JSON response back
            res.json(result);
        });
    });
});

// Get all completed tasks
app.get("/tasks/complete", (req, res) => {
    const con = mysql.createConnection(mySqlInfo);

    // Connect to database
    con.connect((err) => {
        if (err) throw err;

        // Query to get all completed tasks
        const query = "SELECT * FROM task WHERE complete=1 ORDER BY due DESC;";

        // Perform query
        con.query(query, (err, result) => {
            if (err) throw err;
            // Send JSON response back
            res.json(result);
        });
    });
});

// Add new task
app.post("/tasks/addtask", (req, res) => {
    // Ensure task is valid
    const trimTask = req.body.task.trim(); // Trim task
    if (trimTask == "") {
        return res.status(400).send("ERROR: Task cannot be empty.");
    } else if (trimTask.length > 100) {
        return res.status(400).send("ERROR: Task is too long.");
    }

    // Ensure date is valid
    if (req.body.date != "") {
        const dateInfo = req.body.date.split("-");
        if (dateInfo[0].length > 4) {
            return res.status(400).send("ERROR: Invalid year.");
        }

        // Get current date
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;

        // Get info from task date
        const taskYear = Number(dateInfo[0]);
        const taskMonth = Number(dateInfo[1]);
        const taskDay = Number(dateInfo[2]);

        // Ensure task due date is not in past
        if (taskYear < currentDate.getFullYear()) {
            return res.status(400).send("ERROR: Date cannot be in the past.");
        } else if (taskYear == currentDate.getFullYear()) {
            if (taskMonth < currentMonth) {
                return res.status(400).send("ERROR: Date cannot be in the past.");
            } else if (taskMonth == currentMonth && taskDay < currentDate.getDate()) {
                return res.status(400).send("ERROR: Date cannot be in the past.");
            }
        }
    }

    const con = mysql.createConnection(mySqlInfo);

    // Connect to database
    con.connect((err) => {
        if (err) throw err;

        let query = "";
        if (req.body.date == "") {
            query = `INSERT INTO task (item, complete) VALUES ('${trimTask}', 0);`;
        } else {
            query = `INSERT INTO task (item, due, complete) VALUES ('${trimTask}', '${req.body.date}', 0);`;
        }

        // Perform query
        con.query(query, (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    });
});

// Mark task as completed
app.post("/tasks/finishtask", (req, res) => {
    const con = mysql.createConnection(mySqlInfo);

    // Connect to database
    con.connect((err) => {
        if (err) throw err;

        // Query
        const idNum = req.body.taskid.substring(4);
        const query = `UPDATE task SET complete=1 WHERE taskid=${idNum};`;

        // Perform query
        con.query(query, (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    });
});

// Restore task
app.post("/tasks/restoretask", (req, res) => {
    const con = mysql.createConnection(mySqlInfo);

    // Connect to database
    con.connect((err) => {
        if (err) throw err;

        // Query
        const query = `UPDATE task SET complete=0 WHERE taskid=${req.body.taskid};`;

        // Perform query
        con.query(query, (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    });
});

// Delete task
app.delete("/tasks/deletetask", (req, res) => {
    const con = mysql.createConnection(mySqlInfo);

    // Connect to database
    con.connect((err) => {
        if (err) throw err;

        // Query
        const query = `DELETE FROM task WHERE taskid=${req.body.taskid};`;

        // Perform query
        con.query(query, (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});