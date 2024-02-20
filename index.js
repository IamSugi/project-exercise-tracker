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
  const userId = formData[":_id"];
  const user = userArr.find((user) => user._id === userId);

  if (!user) {
    res
      .status(404)
      .json({ error: "user id not found", id: userId, hint: "try again" });
  }

  if (!Number.isInteger(parseInt(formData.duration))) {
    return res.status(400).json({ error: "Duration must be an integer" });
  }

  if (formData.date !== undefined && formData.date !== "") {
    const dateFormatPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormatPattern.test(formData.date)) {
      res.status(400).json({ error: "Invalid date" });
    }
  }

  if (!user.log) {
    user.log = [];
  }
  const exercise = {
    description: formData.description,
    duration: parseInt(formData.duration),
    date: formData.date || new Date().toISOString().slice(0, 10),
  };
  user.log.push(exercise);
  res.status(200).json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id,
  });
});

app.get("/api/users/:_id/logs", function (req, res) {
  const userId = req.params._id;
  const user = userArr.find((user) => user._id === userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
  }
  var count = user.log.length;
  res.status(200).json({
    useranem: user.username,
    count: count,
    _id: user._id,
    log: user.log,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
