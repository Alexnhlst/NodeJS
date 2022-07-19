const fs = require("fs");
const express = require("express");
const EventEmitter = require("events");

const chatEmitter = new EventEmitter();
chatEmitter.on("message", console.log);

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
  const filename = `${__dirname}/public/${req.params[0]}`;
  fs.createReadStream(filename)
    .on("error", () => respondNotFound(req, res))
    .pipe(res);
};

const respondChat = (req, res) => {
  const { message } = req.query;

  chatEmitter.emit("message", message);
  res.end();
};

const respondSSE = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });

  const onMessage = (msg) => res.write(`data: ${msg}\n\n`);
  chatEmitter.on("message", onMessage);

  res.on("close", () => {
    chatEmitter.off("message", onMessage);
  });
};

const app = express();

app.get("/", respondText);
app.get("/json", respondJson);
app.get("/echo", respondEcho);
app.get("/static/*", respondStatic);
app.get("/chat", respondChat);
app.get("/sse", respondSSE);

app.listen(port, () => console.log(`Server listening on port ${port}`));
