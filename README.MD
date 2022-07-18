# First Node API

## Table of contents

1. [Introduction](#introduction)
2. [First Node.js API](#first-nodejs-api)

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
