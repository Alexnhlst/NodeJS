const fs = require("fs");
const express = require("express");

const port = process.env.PORT || 1337;

const respondText = (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.end("Hi");
};

const respondJson = (req, res) => {
  res.json({ text: "Hi", numbers: [1, 2, 3] });
};

const responsdNotFound = (req, res) => {
  res.writeHead(404, { "Content-Type": "text/plain " });
  res.end("Not Found");
};

const respondEcho = (req, res) => {
  const { input = "" } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    characterCount: input.length,
    backwards: input.split("").reverse().join(""),
  });
};

const respondStatic = (req, res) => {
  const filename = `${__dirname}/public${req.params[0]}`;
  fs.createReadStream(filename)
    .on("error", () => responsdNotFound(req, res))
    .pipe(res);
};

const app = express();

app.get("/", respondText);
app.get("/json", respondJson);
app.get("/echo", respondEcho);
app.get("/static/*", respondStatic);

app.listen(port, () => console.log(`Server listening on port ${port}`));
