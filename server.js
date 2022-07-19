const http = require("http");
const querystring = require("querystring");
const fs = require("fs");

const port = process.env.PORT || 1337;

const respondText = (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.end("Hi");
};

const respondJson = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ text: "Hi", numbers: [1, 2, 3] }));
};

const responsdNotFound = (req, res) => {
  res.writeHead(404, { "Content-Type": "text/plain " });
  res.end("Not Found");
};

const respondEcho = (req, res) => {
  const { input = "" } = querystring.parse(
    req.url.split("?").slice(1).join("")
  );

  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      normal: input,
      shouty: input.toUpperCase(),
      characterCount: input.length,
      backwards: input.split("").reverse().join(""),
    })
  );
};

const respondStatic = (req, res) => {
  const filename = `${__dirname}/public${req.url.split("/static")[1]}`;
  fs.createReadStream(filename)
    .on("error", () => responsdNotFound(req, res))
    .pipe(res);
};

const server = http.createServer((req, res) => {
  if (req.url === "/") return respondText(req, res);
  if (req.url === "/json") return respondJson(req, res);
  if (req.url.match(/^\/echo/)) return respondEcho(req, res);
  if (req.url.match(/^\/static/)) return respondStatic(req, res);

  responsdNotFound(req, res);
});

server.listen(port);
console.log(`Server listening on port ${port}`);
