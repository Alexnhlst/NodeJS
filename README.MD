# First Node API

## Table of contents

1. [Introduction](#introduction)
2. [First Node.js API](#first-nodejs-api)
3. [Serving JSON](#serving-json)
4. [Basic Routing](#basic-routing)
5. [Dynamic Responses](#dynamic-responses)
6. [File Serving](#file-serving)
7. [Express](#express)
8. [Real-Time Chat](#real-time-chat)

---

## Introduction

Node.js was first released in 2009 by Ryan Dahl as a reaction to how slow web servers servers were at the time. Most web servers would block for any I/O task. Node.js changed this model by making all I/O tasks non-blocking and asynchronous. This allowed web servers written in Node.js to serve thousands of requests concurrently. Over time Node.js became good at system tasks other than web serving and started to shine as a flexible yet lower level server-side language. It could do anything typically done with Python, Ruby, Perl, and PHP, and it was faster, used less memory, and in most cases had better APIs for the system calls. For example, with Node.js we can create HTTP and TCP servers with only a few lines of code

```javascript
require("http")
  .createServer((req, req) => res.end("Hello world!"))
  .listen(8080);
```

Node.js began to shine with the introduction of `npm`, the package manager bundled with Node.js. A core philosophy of Node.js is to have only a small collection of built-in modules that come preinstalled with the language. Examples of these modules are `fs`, `http`, `tcp`, `dns`, `events`, `child_process`, and `crypto`[^1] Node.js wanted to encourage a rich ecosystem of third-party modules. Any module that becomes a built-in, core module will automatically prevent competition for its features. In addition, the core module can only be updated on each release of Node.js. This strategy has been a great success. `npm` modules have grown at an incredible pace, overtaking all other package managers. In fact, one of the best things about Node.js is having access to a gigantic number of modules. Node.js is a great choice for any task or project where one would typically use a dynamic language like Python, PHP, Perl, or Ruby. Node.js particularly shines when used for:

- HTTP APIs
- distributed systems
- command-line tools
- cross-platform desktop application

Web servers and HTTP APIs built with Node.js generally have much higher performance than other dynamic languages like Python, PHP, Perl, and Ruby. This is partly because of its non-blocking nature, and partly because the Node.js V8 JavaScript interpreter is so well optimized. There are many popular web and API frameworks built with Node.js such as `express`[^2], `hapi`[^3], and `restify`[^4]. Distributed systems are also very easy to build with Node.js. The core `tcp` module makes it very easy to communicate over the network, and useful abstractions like streams allow us to build systems using composable modules like `dnode`.[^5] There are tons of Node.js modules like `yargs`[^6], `chalk`[^7], and `blessed`[^8] that make writing CLIs a breeze. `Electron`[^9], allows us to build cross-platform desktop applications using JavaScript, HTML, and CSS. It combines a browser GUI with Node.js. Using Node.js we're able to access the filesystem, network, and other operating system resources.

<details>
    <summary>When Node.js may not be the best choice</summary>

> Node.js is a dynamic, interpreted language. It is very fast compared to other dynamic languages thanks to the V8 JIT compiler. However, if you are looking for a language that can squeeze the most performance out of your computing resources, Node.js is not the best. CPU-bound workloads can typically benefit from using a lower-level language like C, C++, Go, Java, or Rust. When generating fibonacci numbers Rust and C are about three times faster than Node.js. If you have a specialized task that is particularly sensitive to performance, and does not need to be actively developed and maintained, consider using a lower-level level language. Certain specialized software communities like machine learning, scientific computing, and data science have traditionally used languages other than JavaScript. Over time they have created many packages, code examples, tutorials, and books using languages like Python, R, and Java that either do not exist in JavaScript, are not at the same level of maturity, or do not have the same level of optimization and performance. Node.js might become more popular for these tasks in the future as more flagship projects like `TensorFlow.js`[^10] are developed.

</details>

The biggest difference between Node.js and running JavaScript in the browser is the lack of globals and common browser APIs. For example, `window` and `document` are unavailable in Node.js. Node.js does not need to maintain a DOM or other browser-related technologies to function. [^11]

---

## First Node.js API

```javascript
const http = require("http");
const port = process.env.PORT || 1337;
const server = http.createServer((req, res) => {
  res.end("Hi");
});
server.listen(port);
console.log(`Server listening on port ${port}`);
```

Running this file should output `Server listening on port 1337`

```sh
❯ node server.js
Server listening on port 1337
```

And visiting `http://localhost:1337/` should output the message.

```javascript
const http = require("http");
```

This loads the core `http` module and stores it in our `http` variable. `require()` is a globally accessible function in Node.js and is always available.

```javascript
const port = process.env.PORT || 1337;
```

Here we choose which port our web server should listen for requests. We store the port number in our `port` variable.

> Port numbers are limited to a single process. If we start a server and have it listen to a particular port number, it will continue to run until we kill it or it crashes. If we try to run a new server process that uses the same port as an already-running server process we'll get an error. This can be avoided by using a single terminal window or making sure that we close previously running server processes before starting new ones.

`process`[^14] is a global object[^15] with information about the currently running process. The `process` object is always available when running Node.js. `process.env` is an object that contains all environment variables. If we were to run the server with `PORT=3000 node server.js` instead, `process.env.PORT` would be set to `3000`

```javascript
const server = http.createServer((req, res) => {
  res.end("Hi");
});
```

With `http.createServer()`[^16] we create a HTTP server object and assign it to the `server` variable. It accepts a single argument: a request listener function. Our request listener function will be called every time there's an HTTP request to our server. Every time it is called, this function will receive two arguments: a request object (`req`[^17]) and a response object (`res`[^18]). The only thing left to do, is to allow our server object to listen for requests on a particular port:

```javascript
server.listen(port);
```

---

## Serving JSON

When building web apps and distributed systems, it's common to use JSON APIs to serve data.

```javascript
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ text: "Hi", numbers: [1, 2, 3] }));
});
```

When building a production server, it's best to explicit with responses so that clients don't handle our data in unexpected ways. By sending plain text without `Content-Type` header, we didn't tell the client what kind of data it should expect. To set the `Content-Type` we use the `res.setHeader()`[^19] method. Visiting `http://localhost:1337/` will return the JSON object

```json
{
  "text": "Hi",
  "numbers": [1, 2, 3]
}
```

---

## Basic Routing

Not all client requests are the same, and to create a useful API, we should be able to respond differently depending on the requested url path. We're going to change our request listener function to perform different actions depending on the value of `req.url`[^20] The `url` property of the `req` object will always contain the full path of the client request. For example, when we navigate to `http://localhost:1337` in the browser, the path is `/`, and when we navigate to `http://localhost:1337/fullstack`, the path is `/fullstack`. We need to create our different functions -- one for each behavior. We'll start with the functions for responding with plain-text and JSON. These new functions will use the same arguments as our request listener function and behave exactly the same as they did before:

```javascript
const respondText = (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.end("Hi");
};

const respondJson = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ text: "Hi", numbers: [1, 2, 3] }));
};
```

The third function will handle a 404 "Not Found" error. To do this, we use the `res.writeHead()`[^21] method. This method will let us set both a response status code and header. The 404 status code tells the client that the communication to the server was successful, but the server is unable to find the requested data.

```javascript
const responsdNotFound = (req, res) => {
  res.writeHead(404, { "Content-Type": "text/plain " });
  res.end("Not Found");
};
```

We can create a request listener function that calls each one depending on the path in `req.url`

```javascript
const server = http.createServer((req, res) => {
  if (req.url === "/") return respondText(req, res);
  if (req.url === "/json") return respondJson(req, res);

  responsdNotFound(req, res);
});
```

---

## Dynamic Responses

For apps and services in the real-world, the API will be responsible for pulling data out of a database or other resource according to specific queries sent by the client and filtered by authorization rules. To add this style of functionality to our API, we're going to add an endpoint that accepts arguments via query parameters. We'll then use the information provided by the client to create the response. Our new endpoint will be `/echo` and the client will provide input via the input query parameter. For example, to provide "fullstack" as `input`, the client will use `/echo?input=fullstack` as the url path. Our new endpoint will respond with a JSON object with the following properties:

- `normal`: the input string without a transformation
- `shouty`: all caps
- `characterCount`: the number of characters in the input string
- `backwards`: the input string ordered in reverse

To begin, we'll first have our request listener function check to see if the `request.url` begins with `/echo`, the endpoint that we're interested in. If it is, we'll call our soon-to-be-created function `respondEcho()`:

```javascript
const server = http.createServer((req, res) => {
  if (req.url === "/") return respondText(req, res);
  if (req.url === "/json") return respondJson(req, res);
  if (req.url.match(/^\/echo/)) return respondEcho(req, res);

  responsdNotFound(req, res);
});
```

Next, we create the respondEcho() function that will accept the request and response objects.

```javascript
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
```

The important thing to notice is that the first line of our function uses the `querystring.parse()`[^22] method. To be able to use this, we first need to use `require()` to load the `querystring` core module. Like `http`, this module is installed with Node.js and is always available.

> The `querystring` API is considered Legacy. While it is still maintained, new code should use the `URLSearchParams`[^23] API instead.

We expect the client to access this endpoint with a url like `/echo?input=someinput`. `querystring.parse()` accepts a raw querystring argument. It expects the format to be something like `query1=value1&query2=value2`. The important thing to note is that `querystring.parse()` does not want the leading `?`. Using some quick string transformations we can isolate the input=someinput part of the url, and pass that in as our argument. `querystring.parse()` will return a simple JavaScript object with query param key and value pairs.

---

## File Serving

One of the most common uses of a web server is to serve html and other static files. What we want to do is to create a local directory and serve all files in that directory to the browser. If we create a local directory called `public` and we place two files in there, `index.html` and `ember.jpg`, we should be able to visit `http://localhost:1337/static/index.html` and `http://localhost:1337/static/ember.jpg` to receive them. If we were to place more files in that directory, they would behave the same way. The first thing we'll need to do is to create a new function for static file serving and call it when a request comes in with an appropriate `req.url` property. To do this we'll add a fourth conditional to our request listener that checks for paths that begin with `/static` and calls `respondStatic()`

```javascript
const server = http.createServer((req, res) => {
  if (req.url === "/") return respondText(req, res);
  if (req.url === "/json") return respondJson(req, res);
  if (req.url.match(/^\/echo/)) return respondEcho(req, res);
  if (req.url.match(/^\/static/)) return respondStatic(req, res);

  responsdNotFound(req, res);
});
```

```javascript
const respondStatic = (req, res) => {
  const filename = `${__dirname}/public${req.url.split("/static")[1]}`;
  fs.createReadStream(filename)
    .on("error", () => responsdNotFound(req, res))
    .pipe(res);
};
```

We perform a simple conversion so that we can translate the incoming `req.url` path to an equivalent file in our local directory. For example, if the `req.url` is `/static/index.html`, this conversion will translate it to `public/index.html`. Once we have our `filename` from the first line, we want to open that file and send it to the browser. We need to use a module that will allow us to interact with the filesystem. `fs` is a core module that we can load with `require()`. We use `fs.createReadStream()` method to create a `Stream` object representing our chosen file. We than use that stream object's `pipe()` method to connect it to the response object. Behind the scenes, this efficiently loads data from the filesystem and sends it to the client via the response object. We also use the stream object's `on()` method to listen for an error.

---

## Express

`express` is a fast, unopinionated, minimalist web framework for Node.js used in production environments. It is a drop-in replacement for the core `http` module. `express` comes with a built-in router.

```javascript
const fs = require("fs");
const express = require("express");
const port = process.env.PORT || 1337;
const app = express();

app.get("/", respondText);
app.get("/json", respondJson);
app.get("/echo", respondEcho);
app.get("/static/*", respondStatic);
```

Unlike previous examples, `express` is a third-party module and it does not come with our installation of Node.js. If we were to run this file before installing `express`, we would see a `Cannot find module 'express'` error

```sh
❯ node express-server.js
node:internal/modules/cjs/loader:949
  throw err;
  ^

Error: Cannot find module 'express'
Require stack:
- /mnt/c/Users/Alex/Documents/Development/NodeJS/express-server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:946:15)
    at Module._load (node:internal/modules/cjs/loader:787:27)
    at Module.require (node:internal/modules/cjs/loader:1012:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/mnt/c/Users/Alex/Documents/Development/NodeJS/express-server.js:2:17)
    at Module._compile (node:internal/modules/cjs/loader:1112:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1166:10)
    at Module.load (node:internal/modules/cjs/loader:988:32)
    at Module._load (node:internal/modules/cjs/loader:834:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/mnt/c/Users/Alex/Documents/Development/NodeJS/express-server.js'
  ]
}
```

We need to install `express` using `npm`, running `npm install express`. `npm` will go fetch `express` from its repository and place the `express` module in a folder called `node_modules`. When we run a JavaScript file with Node.js, Node.js will look for modules in the `node_modules` folder. Node.js will also look in other places for modules such as parent directories and the global `npm` installation directory. The next thing to notice is that we no longer use `http.createServer()` and pass it a request listener function. Instead we create a server instance with `express()`. By `express` convention we call this `app`. Once we've created our server instance, `app`, we take advantage of `express` routing. By using `app.get()` we can associate a path with an endpoint function. For example, `app.get('/', respondText)` makes it so that when we receive an HTTP GET request to '/', the `respondText()` function will run. The nice thing about `express` is that it gives us a lot of helpers and niceties that can make our code more succinct. For example, because responding with JSON is so common, `express` adds a `json()` function to the response object. By calling `res.json()`, `express` will automatically send the correct `Content-Type` header and stringify our response body for us.

```javascript
const respondJson = (req, res) => {
  res.json({ text: "Hi", numbers: [1, 2, 3] });
};
```

Another difference with `express` routing is that we don't have to worry about search query parameters when defining our routes.

```javascript
const respondEcho = (req, res) => {
  const { input = "" } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    characterCount: input.length,
    backwards: input.split("").reverse().join(""),
  });
};
```

The last thing to notice about express routing is that we can add regex wildcards like `*` to our routes. This means that our server will call `respondStatic()` for any path that begins with `/static/`. What makes this particularly helpful is that express will make the wildcard match available on the request object.Behind the scenes, express uses `path-to-regexp`[^24] to convert route strings into regular expressions. To see how different route strings are transformed into regular expressions and how parts of the path are stored in `req.params` there's the excellent Express Route Tester tool.[^25]

```javascript
const respondStatic = (req, res) => {
  const filename = `${__dirname}/public${req.params[0]}`;
  fs.createReadStream(filename)
    .on("error", () => responsdNotFound(req, res))
    .pipe(res);
};
```

---

## Real-Time Chat

When Node.js was young, some of the most impressive demos involved real-time communication. Because Node.js is so efficient at handling I/O, it became easy to create real-time applications like chat and games. To show off the real-time capabilities of Node.js we're going to build a chat application. Our application will allow us to open multiple browsers where each has a chat window. Any browser can send a message, and it will appear in all the other browser windows. Our chat messages will be sent from the browser to our server, and our server will in turn send each received message to all connected clients. Traditionally, for a browser to receive data from the server, the browser has to make a request. This is how all of our previous examples work. o create a chat application using this model, the browser would have to constantly make requests to the server to ask for new messages. While this would work, there is a much better way. We're going to create a chat application where the server can push messages to the browser without the browser needing to make multiple requests. To do this, we'll use a technology called SSE (Server-Sent Events). SSE is available in most browsers through the EventSource API, and is a very simple way for the server to "push" messages to the browser.

> Much like websockets, SSE is a good way to avoid having the browser poll for updates. SSE is much simpler than websockets and provide us the same functionality.[^26]

To set this up we'll need to create a simple client app. We'll create a chat.html page with a little bit of HTML and JavaScript. We'll need a few things:

- JavaScript function to receive new messages from our server
- JavaScript function to send messages to the server
- HTML element to display messages
- HTML form element to enter messages

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chat App</title>
    <link rel="stylesheet" href="tachyons.min.css" />
    <link rel="stylesheet" href="chat.css" />
  </head>
  <body>
    <div id="messages">
      <h4>Chat Messages</h4>
    </div>
    <form id="form">
      <input type="text" id="input" placeholder="Your message..." />
    </form>

    <script src="chat.js"></script>
  </body>
</html>
```

```javascript
new window.EventSource("/sse").onmessage = (event) => {
  window.messages.innerHTML += `<p>${event.data}</p>`;
};

window.FormData.addEventListener("submit", (evt) => {
  evt.preventDefault();

  window.fetch(`/chat?message=${window.InputDeviceInfo.value}`);
  window.input.value = "";
});
```

When our soon-to-be-created `/sse` route sends new messages, we add them to the `div` element on the page with the `id` `"messages"`. We listen for when the user enters a message into the text box. We do this by adding an event listener function to our `form` element. Within this listener function we take the value of the input box `window.input.value` and send a request to our serv with the message. We do this by sending a GET request to the `/chat` path with the message encoding in the query parameters. After we send the message, we clear the text box so the user can enter a new message. We need to create a `/chat` route that will receive chat messages from a client and a `/sse` route that will send those messages to all connected clients. Our `/chat` endpoint will be similar to our `/echo` endpoint in that we'll be taking data (a message) from the url's query parameters. Instead of looking at the `?input=` query parameter like we did in `/echo`, we'll be looking at `?message=`. However, there will be two important differences. First, unlike `/echo` we don't need write any data when we end our response. Our chat clients will be receiving message data from `/sse`. In this route, we can simply end the response. Because our server will send a `200` "OK" HTTP status code by default, this will act as a sufficient signal to our client that the message was received and correctly handled. The second difference is that we will need to take the message data and put it somewhere our other route will be able to access it. To do this we're going to instantiate an object outside of our route function's scope so that when we create another route function, it will be able to access this "shared" object. This shared object will be an instance of `EventEmitter` that we will call `chatEmitter`. The `EventEmitter` class is available through the core `events` module, and `EventEmitter` objects have an `emit(eventName[, ...args])` method that is useful for broadcasting data. When a message comes in, we will use `chatEmitter.emit()` to broadcast the message. Later, when we create the `/sse` route we can listen for these broadcasts. [^27]

```javascript
const respondChat = (req, res) => {
  const { message } = req.query;

  chatEmitter.emit("message", message);
  res.end();
};

app.get("/chat", respondChat);
```

We access the message sent from the browser in similar way to how we access `input` in the `/echo` route, but this time use the `message` property instead. Second, we're calling a function on an object that we haven't created yet: `chatEmitter.emit('message', message)`. If we were to visit `http://localhost:1337/chat?message=hi` in our browser right now, we would get an error

```javascript
const EventEmitter = require("events");

const chatEmitter = new EventEmitter();
```

Now our app can receive messages, but we don't do anything with them yet. If you'd like to verify that this route is working, you can add a line that logs messages to the console. After the `chatEmitter` object is declared, add a line that listens messages like this:

```javascript
const chatEmitter = new EventEmitter();
chatEmitter.on("message", console.log);
```

Then visit `http://localhost:1337/chat?message=hello!` in your browser and verify that the message "hello!" is logged to your terminal. With that working, we can now add our `/sse` route that will send messages to our chat clients once they connect with the new` window.EventSource('/sse')` described above:

```javascript
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

app.get("/sse", respondSSE);
```

1. We establish the connection by sending a 200 OK status code, appropriate HTTP headers according to the `SSE specification`[^28]
2. We listen for `message` events from our `chatEmitter` object, and when we receive them, we write them to the response body using `res.write()`. We use `res.write()` instead of `res.end()` because we want to keep the connection open, and we use the data format from the SSE specification
3. We listen for when the connection to the client has been closed, and when it happens we disconnect our `onMessage()` function from our `chatEmitter` object. This prevents us from writing messages to a closed connection.

After adding this route and function, we now have a functioning real-time chat app. If you open `http://localhost:1337/static/chat.html` in multiple browsers you'll be able to send messages back and forth:

[^1]: [Node.js API documentation](https://nodejs.org/api/index.html)
[^2]: [express](https://expressjs.com/)
[^3]: [hapi](https://hapi.dev/)
[^4]: [restify](http://restify.com/)
[^5]: [dnode](https://www.npmjs.com/package/dnode)
[^6]: [yargs](https://yargs.js.org/)
[^7]: [chalk](https://github.com/chalk/chalk#readme)
[^8]: [blessed](https://github.com/chjj/blessed)
[^9]: [electron](https://www.electronjs.org/)
[^10]: [TensorFlow.js](https://www.tensorflow.org/js/)
[^11]: [Standard built-in objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)
[^12]: [http](https://nodejs.org/api/http.html)
[^13]: [require()](https://nodejs.org/api/modules.html#modules_require_id)
[^14]: [process](https://nodejs.org/api/process.html#process_process)
[^15]: [Global Object](https://nodejs.org/api/globals.html#globals_require)
[^16]: [createServer()](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener)
[^17]: [req](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
[^18]: [res](https://nodejs.org/api/http.html#http_class_http_serverresponse)
[^19]: [setHeader()](https://nodejs.org/api/http.html#http_request_setheader_name_value)
[^20]: [req.url](https://nodejs.org/api/http.html#http_message_url)
[^21]: [writeHead()](https://nodejs.org/api/http.html#http_response_writehead_statuscode_statusmessage_headers)
[^22]: [querystring](https://nodejs.org/api/querystring.html)
[^23]: [URLSearchParams](https://nodejs.org/api/url.html#class-urlsearchparams)
[^24]: [path-to-regexp](https://www.npmjs.com/package/path-to-regexp)
[^25]: [Express Route Tester](https://forbeslindesay.github.io/express-route-tester/)
[^26]: [SSE](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
[^27]: [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)
[^28]: [SSE specification](https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events)
