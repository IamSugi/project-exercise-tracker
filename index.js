const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
var bodyParser = require("body-parser");

const crypto = require("crypto");

var userArr = [];

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", function (req, res) {
  var userName = req.body.username;
  var userDataObj = {
    username: userName,
    _id: crypto.randomBytes(16).toString("hex"),
  };
  userArr.push(userDataObj);
  res.status(200).json(userDataObj);
});

app.get("/api/users", function (req, res) {
  res.status(200).json(userArr);
});

app.post("/api/users/:_id/exercises", function (req, res) {
  const formData = req.body;
  const userId = req.params._id;
  const userIndex = userArr.findIndex((user) => user._id === userId);

  if (userIndex === -1) {
    res.status(404).json({ error: "user id not found" });
  }

  if (!Number.isInteger(parseInt(formData.duration))) {
    return res.status(400).json({ error: "Duration must be an integer" });
  }

  let exerciseDate = formData.date
    ? formData.date
    : new Date().toISOString().slice(0, 10);

  if (formData.date !== undefined && formData.date !== "") {
    const dateFormatPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormatPattern.test(formData.date)) {
      res.status(400).json({ error: "Invalid date" });
    }
  }

  if (!userArr[userIndex].log) {
    userArr[userIndex].log = [];
  }

  const exercise = {
    description: formData.description,
    duration: parseInt(formData.duration),
    date: exerciseDate,
  };

  userArr[userIndex].log.push(exercise);
  const responseObject = {
    _id: userArr[userIndex]._id,
    username: userArr[userIndex].username,
    description: exercise.description,
    duration: exercise.duration,
    date: new Date(exercise.date).toDateString(),
  };
  res.status(200).json(responseObject);
});

app.get("/api/users/:_id/logs", function (req, res) {
  const userId = req.params._id;
  const user = userArr.find((user) => user._id === userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
  }

  let logs = user.log || [];

  const fromDate = req.query.from;
  const toDate = req.query.to;
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  if (fromDate) {
    logs = logs.filter((log) => new Date(log.date) >= new Date(fromDate));
  }
  if (toDate) {
    logs = logs.filter((log) => new Date(log.date) <= new Date(toDate));
  }
  if (limit !== undefined) {
    logs = logs.slice(0, limit);
  }
  var count = user.log.length;

  logs.forEach((log) => {
    log.date = new Date(log.date).toDateString();
  });
  res.status(200).json({
    useranem: user.username,
    count: count,
    _id: user._id,
    log: logs,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
