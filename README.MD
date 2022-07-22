# Fullstack Node.JS [^1] :book:

## Table of contents

1. [Introduction](#introduction)
2. [Callbacks](#callbacks)
   - [Async in Series and Parallel](#async-in-series-and-parallel)
   - [Creating A function](#creating-a-function)
   - [Wrapping Up](#wrapping-up)
3. [Promises](#promises)
   - [Real World Promises](#real-world-promises)
   - [Creating A Function](#creating-a-function-1)
   - [Wrapping Up](#wrapping-up-1)

---

## Introduction

Node.js was created in reaction to slow web servers in Ruby and other dynamic languages at that time. These servers were slow because they were only capable of handling a single request at a time. Any work that involved I/O was blocking. The program would not be able to perform any work while waiting on these blocking resources. Node.js is able to hanlde many requests concurrently because it is non-blocking by default. Node.js can continue to perform while waiting on slow resources. The simplest, and most common form of asynchronous execution within Node.js is the callback. A callback is a way to specify that after X happens, do Y. Typically, "X" will be some form of slow I/O (e.g. reading a file), and "Y" will be work that incorporates the result (e.g. processing data from that file).

```javascript
window.addEventListener("resize", () =>
  console.log("window has been resized!")
);
```

To translate this back into words: "After the window is resized, print 'window has been resized!'" In other languages, we expect work to be performed in the order it is written in the file. However in JavaScript, we can make the following lines print in the reverse order from how they are written:

```javascript
const tenYears = 10 * 365 * 24 * 60 * 60 * 1000;
setTimeout(() => console.log("Hello from the past"), tenYears);
console.log("Hello from the present");
```

If we were to run the above code, you would immediately see "Hello from the present", and 10 years later, you would see "Hello from the past". Because setTimeout() is non-blocking, we don't need to wait 10 years to print "hello from the present" -- it happens immediately after.

```javascript
let count = 0;
setInterval(() => console.log(`${++count} mississippi`), 1000);

setTimeout(() => {
  console.log("Hello from the past!");
  process.exit();
}, 5500);
```

Running this code, we should expect something like this

```sh
❯ node main.js
1 mississippi
2 mississippi
3 mississippi
4 mississippi
5 mississippi
Hello from the past!
```

Let's comapre this to what would happen if instead of using a non-blocking `setTimeout()` we use a blocking `setTimeoutSync()` function

```javascript
let count = 0;
setInterval(() => console.log(`${++count} mississippi`), 1000);

const setTimeoutSync = (ms) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {}
};

setTimeoutSync(5500);
console.log("Hello from the past");
process.exit();
```

We've created our own `setTimeoutSync()` function that will block execution for the specified number of milliseconds. This will behave more similarly to other blocking languages.

```sh
❯ node main.js
Hello from the past
```

In our previous example, Node.js was able to perform two sets of instructions concurrently. While we were waiting on the "hello from the past!" message, we were seeing the seconds get counted. However, in this example, Node.js is blocked and is never able to count the seconds. Node.js is non-blocking by default, but as we can see, it's still possible to block. Node.js is single-threaded, so long running loops like the one in `setTimeoutSync()` will prevent other work from being performed

---

## Callbacks

Node.js-style callbacks are very similar to how we would perform asynchronous execution in the browser and are just a slight variation on our `setTimeout()` example above. Interacting with the filesystem is extremely slow relative to interacting with system memory or the CPU. This slowness makes it conceptually similar to `setTimeout()`. While loading a small file may only take two milliseconds to complete, that's still a really long time -- enough to do over 10,000 math operations. Node.js provides us asynchronous methods to perform these tasks so that our applications can continue to perform operations while waiting on I/O and other slow tasks.

Here's what it looks like to read a file using the core `fs`[^1] module:

```javascript
const fs = require("fs");
const filename = "main.js";

fs.readFile(filename, (err, fileData) => {
  if (err) return console.error(err);
  console.log(`${filename}: ${fileData.length}`);
});
```

​
From this example we can see that `fs.readFile()` expects two arguments, `filename` and `callback`. In Node.js official APIs (and most third-party libraries) the callback is always the last argument. The callback to `fs.readFile` accepts two arguments: `err` and `fileData`. This shows off another important Node.js convention: the `error` (or `null` if no error occurred) is the first argument when executing a provided callback. This convention signifies the importance of error handling in Node.js. The error is the first argument because we are expected to check and handle the error first before moving on. In this example, that means first checking to see if the error exists and if so, printing it out with `console.error()` and skipping the rest of our function by returning early. Only if err is falsy, do we print the filename and file size

```sh
❯ node main.js
[Error: ENOENT: no such file or directory, open 'test.js'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: 'test.js'
}
```

If instead of reading a file, we wanted to get a directory list, it would work similarly. We would call `fs.readdir()`, and because of Node.js convention, we could guess that the first argument is the directory path and the last argument is a callback. Furthermore, we know the callback that we pass should expect error as the first argument, and the directory listing as the second argument.

> `readdir` is a system call[^2], and `fs.readdir()` follows its C naming convention

### Async in Series and Parallel

Our program will:

1. Get a directory list
2. For each item on that list, print the file's name and size
3. Once all names and sizes have been printed, print "Done!"

We might be tempted to write something like this:

```javascript
const fs = require("fs");

fs.readdir("./", (err, files) => {
  if (err) return console.error(err);

  files.forEach((file) => {
    fs.readFile(file, (err, fileData) => {
      if (err) return console.error(err);

      console.log(`${file}: ${fileData.length}`);
    });
  });

  console.log("Done!");
});
```

```sh
❯ node main.js
Done!
main.js: 980
README.MD: 6120
```

> If you see an error like `Error: EISDIR: illegal operation on a directory, read` check to see if you have subdirectories present. `fs.readFile()` will throw an error if called on a directory instead of a file

Two problems jump out at us. First, we can see that "done!" is printed before all of our files, and second, our files are not printed in the alphabetical order that `fs.readdir()` returns them. `fs.readFile()` does not block execution. Therefore, Node.js is not going to wait for the file data to be read before printing "done!". If we can't use `Array.forEach()` to do what we want, what can we do? The answer is to create our own async iterator. Just like how there can be synchronous variants of asynchronous functions, we can make async variants of synchronous functions.

```javascript
const mapAsync = (arr, fn, onFinish) => {
  let prevError;
  let nRemaining = arr.length;
  const results = [];

  arr.forEach((item, i) => {
    fn(item, (err, data) => {
      if (prevError) return;

      if (err) {
        prevError = err;
        return onFinish(err);
      }

      results[i] = data;

      nRemaining--;
      if (!nRemaining) onFinish(null, results);
    });
  });
};
```

For comparison, let's look at a simple synchronous version of `Array.map()`

```javascript
function mapSync(arr, fn) {
  const results = [];

  arr.forEach(function (item, i) {
    const data = fn(item);
    results[i] = data;
  });

  return results;
}
```

At a high level, our `mapAsync()` is very similar to `mapSync()`, but it needs a little extra functionality to make async work. The main additions are that it (1) keeps track of how many items from the array have been processed, (2) whether or not there's been an error, and (3) a final callback to run after all items have been successfully processed or an error occurs. Just like `mapSync()`, the first two arguments of `mapAsync()` are `arr`, an array of items, and `fn`, a function to be executed for each item in the array. Unlike `mapSync()`, `mapAsync()` expects `fn` to be an asynchronous function. This means that when we execute `fn()` for an item in the array, it won't immediately return a result; the result will be passed to a callback. Therefore, instead of being able to synchronously assign values to the results array in `mapSync()`

```javascript
arr.forEach((item, i) => {
  const data = fn(item);
  results[i] = data;
});
```

We need to assign values to the results within the `callback` of `fn()` in `mapAsync()`:

```javascript
arr.forEach((item, i) => {
  fn(item, (err, data) => {
    results[i] = data;
  });
});
```

This means that when using `mapAsync()`, we expect the given iterator function, `fn()`, to follow Node.js convention by accepting an `item` from `arr` as its first argument and a callback as the last argument. This ensures that any function following Node.js convention can be used. Because the `fn()` callback for each item will execute in a different order than the items array, we need a way to know when we are finished processing all items in the array. In our synchronous version, we know that we're finished when the last item is processed, but that doesn't work for `mapAsync()`. To solve this problem, we need to keep track of how many items have been completed successfully. By keeping track, we can make sure that we only call `onFinish()` after all items have been completed successfully. Specifically, within the `fn()` callback, after we assign value to our `results` array, we check to see if we have processed all items. If we have, we call `onFinish()` with the results, and if we haven't we do nothing. At this point, after everything goes well, we'll call `onFinish()` with a correctly ordered results array. Node.js convention is to call callbacks with an error as the first argument if one exists. For example, if we were to use it with `fs.readFile()` on files that don't exist

```javascript
mapAsync(["file1.js", "file2.js"], fs.readFile, (err, filesData) => {
  if (err) return console.error(err);
  console.log(filesData);
});
```

Our output would be `[undefined, undefined]`. This is because `err` is `null`, and without proper error handling, our `mapAsync()` function will push `undefined` values into the `results` array. We've received a faulty results array instead of an error. This is the opposite of what we want; we want to follow Node.js convention so that we receive an error instead of the results array. Now, if we run into an error, we'll immediately call `onFinish(err)`. In addition, because we don't decrease our `nRemaining` count for the item with an error, `nRemaining` never reaches `0` and `onFinish(null, results)` is never called. Unfortunately, this opens us up to another problem. If we have multiple errors, `onFinish(err)` will be called multiple times; `onFinish()` is expected to be called only once. Preventing this is simple. Once we encounter an error, we immediately call `onFinish(err)`. Work may still be in progress after that point, so we keep track of that error and use that information to prevent calling `onFinish()` again. By taking advantage of and following Node.js convention, our `mapAsync()` is directly compatible with most core Node.js API methods and third-party modules. Here's how we can use it for our directory listing challenge:

```javascript
fs.readdir("./", (err, files) => {
  if (err) return console.error(err);

  mapAsync(files, fs.readFile, (err, results) => {
    if (err) return console.error(err);

    results.forEach((data, i) => console.log(`${files[i]}: ${data.length}`));

    console.log("Done!");
  });
});
```

### Creating A function

Now that we have a general-purpose async map and we've used it to get a directory listing and read each file in the directory, let's create a general-purpose function that can perform this task for any specified directory. To achieve this we'll create a new function `getFileLengths()` that accepts two arguments, a directory and a callback. This function will first call `fs.readdir()` using the provided directory, then it pass the file list and `fs.readFile` to `mapAsync()`, and once that is all finished, it will call the callback with an error (if one exists) or the results array -- pairs of filenames and lengths. Once we've created `getFileLengths()` we'll be able to use it like this

```javascript
const targetDirectory = process.argb[2] || "./";

getFileLengths(targetDirectory, (err, results) => {
  if (err) return console.error(err);

  results.forEach(([file, length]) => console.log(`${file}: ${length}`));

  console.log("Done!");
});
```

> `process.argv` is an globally available array of the command line arguments used to start Node.js. If you were to run a script with the command `node file.js`, `process.argv` would be equal to `['node', 'file.js']`. In this case we allow our file to be run like `node test.js ../another-directory`. In that case `process.argv[2]` will be `../another-directory`.

```javascript
const fs = require("fs");
const path = require("path");

const getFileLengths = (dir, cb) => {
  fs.readdir(dir, (err, files) => {
    if (err) return cb(err);

    const filePaths = files.map((file) => path.join(dir, file));

    mapAsync(filePaths, readFile, cb);
  });
};
```

The first thing we do is use `fs.readdir()` to get the directory listing. We also follow Node.js convention, and if there's an error, we'll return early, and call the callback `cb` with the error. We need to perform a little extra work on our file for this function to be generalizable to any specified directory. `fs.readdir()` will only return file names -- it will not return the full directory paths. We use the built-in `path` module to combine our specified directory with each file name to get an array of file paths. After we have our file paths array, we pass it to our `mapAsync()` function along with a customized `readFile()` function. It's often useful to wrap an async function with your own to make small changes to expected inputs and/or outputs. Here's what our customized `readFile()` function looks like

```javascript
const readFile = (file, cb) => {
  fs.readFile(file, (err, fileData) => {
    if (err) {
      if (err.code === "EISDIR") return cb(null, [file, 0]);
      return cb(err);
    }
    cb(null, [file, fileData.length]);
  });
};
```

In our previous example, we could be sure that there were no subdirectories. When accepting an arbitrary directory, we can't be so sure. Therefore, we might be calling `fs.readFile()` on a directory. If this happens, `fs.readFile()` will give us an error. Instead of halting the whole process, we'll treat directories as having a length of 0. Additionally, we want our `readFile()` function to return an array of both the file path and the file length. If we were to use the stock `fs.readFile()` we would only get the data. `readFile()` will be called once for each file path, and after they have all finished, the callback passed to `mapAsync()` will be called with an array of the results. In this case, the results will be an array of arrays. Each array within the results array will contain a file path and a length. Looking back at where we call `mapAsync()` within our `getFileLengths()` definition, we can see that we're taking the callback `cb` passed to `getFileLengths()` and handing it directly to `mapAsync()`. Here's our full implementation of `getFileLengths()`

```javascript
const fs = require("fs");
const path = require("path");

const readFile = (file, cb) => {
  fs.readFile(file, (err, fileData) => {
    if (err) {
      if (err.code === "EISDIR") return cb(null, [file, 0]);
      return cb(err);
    }
    cb(null, [file, fileData.length]);
  });
};

const mapAsync = (arr, fn, onFinish) => {
  let prevError;
  let nRemaining = arr.length;
  const results = [];

  arr.forEach((item, i) => {
    fn(item, (err, data) => {
      if (prevError) return;

      if (err) {
        prevError = err;
        return onFinish(err);
      }

      results[i] = data;

      nRemaining--;
      if (!nRemaining) onFinish(null, results);
    });
  });
};

const getFileLengths = (dir, cb) => {
  fs.readdir(dir, (err, files) => {
    if (err) return cb(err);

    const filePaths = files.map((file) => path.join(dir, file));

    mapAsync(filePaths, readFile, cb);
  });
};

const targetDirectory = process.argv[2] || "./";

getFileLengths(targetDirectory, (err, results) => {
  if (err) return console.error(err);

  results.forEach(([file, length]) => console.log(`${file}: ${length}`));

  console.log("Done!");
});
```

### Wrapping up

Callbacks can be quite confusing at first because how different they can be from working with other languages. However, they are a powerful convention that allows us to create async variations of common synchronous tasks. Additionally, because of their ubiquity in Node.js core modules, it's important to be comfortable with them.

---

## Promises

A promise is an object that represents a future action and its result. This is in contrast to callbacks which are just conventions around how we use functions. Let's take a look to see how we can use `fs.readFile()` with promises

```javascript
const fs = require("fs").promises;

const filename = "promises.js";

fs.readFile(filename)
  .then((data) => console.log(`${filename}: ${data.length}`))
  .catch((err) => console.error(err));
```

So far, the biggest difference is that the promise has separate methods for success and failure. Unlike callbacks that are a single function with both error and results arguments, promises have separate methods `then()` and `catch()`. If the action is successful, `then()` is called with the result. If not, `catch()` is called with an error.

### Real World Promises

```javascript
const fs = require("fs").promises;

fs.readdir("./")
  .catch((err) => console.error(err))
  .then((files) => {
    files.forEach((file) => {
      fs.readFile(file)
        .catch((err) => console.error(err))
        .then((data) => console.log(`${file}: ${data.length}`));
    });

    console.log("Done!");
  });
```

When used this way, we'll run into the same issue with promises as we did with callbacks. within the `files.forEach()` iterator, our use of the `fs.readFile()` promise is non-blocking. This means that we're going to see `Done!` printed to the terminal before any of the results, and we're going get the results out of order. To be able to perform multiple async actions concurrently, we'll need to use `Promise.all()`. It is globally available in Node.js, and it execute an array of promises at the same time.

```javascript
fs.readdir("./")
  .then((fileList) =>
    Promise.all(
      fileList
        .map((file) => fs.readFile(file))
        .then((data) => [file, data.length])
    )
  )
  .then((results) => {
    results.forEact(([file, length]) => console.log(`${file}: ${length}`));
    console.log("Done!");
  })
  .catch((err) => console.error(err));
```

After we receive the file list `fileList` from `fs.readdir()` we use `fileList.map()` to transform it into an array of promises. Once we have an array of promises, we use `Promise.all()` to execute them all in parallel. When `Promise.all()` finishes, `results` will simply be an array of file data. Without also having the file names, we no longer will know which files the lengths belong to. In order to keep each length properly labeled, we need to modify what each promise returns. We do this by adding `.then()` returning `[file, data.length]`.

### Creating A Function

We can create a generalized function that can be used for any directory. Once we've generalized it, we can use it like this:

```javascript
const targetDirectory = process.argv[2] || "./";

getFileLengths(targetDirectory)
  .then((results) => {
    results.forEach(([file, length]) => console.log(`${file}: ${length}`));
    console.log("done!");
  })
  .catch((err) => console.error(err));
```

First we read the directory list, and then we use `fileList.map()` to transform that list into an array of promises. However, just like our callback example, we need some extra logic to handle arbitrary directories. Before creating a promise to read a file, we use `path.join()` to combine the directory with the file name to create a usable file path.

```javascript
const getFileLengths = (dir) => {
  return fs.readdir(dir).then((fileList) => {
    const readFiles = fileList.map((file) => {
      const filePath = path.join(dir, file);
      return readFile(filePath);
    });
    return Promise.all(readFiles);
  });
};
```

Just like our callback example, we use a customized readFile() function so that we can both ensure that our final result array is made up of file path, file length pairs, and that subdirectories are correctly handled.

```javascript
const readFile = (filePath) => {
  return fs
    .readFile(filePath)
    .then((data) => [filePath, data.length])
    .catch((err) => {
      if (err.code === "EISDIR") return [filePath, 0];
      throw err;
    });
};
```

The promise version of `readFile()` behaves similarly, but the implementation is a little different. As mentioned above, one of the biggest differences between callbacks and promises is error handling. In contrast to callbacks, the success and error paths of callbacks are handled with separate functions. When `then()` is called, we can be certain that we have not run into an error. We will have access to the file's data, and we can return a `[filePath, data.length]` pair as the result. With promises, errors flow into a the separate `catch()` function. We can intercept `EISDIR` errors and prevent them from breaking the chain. If the error code is `EISDIR`, we return with our modified result, `[filePath, 0]`. By using return within a `catch()`, we prevent the error from propagating. To downstream code, it will look like the operation successful returned this result. If any other error is thrown, we make sure not to return with a value. Instead, we re-throw the error. This will propagate the error down the chain -- successive `then()` calls will be skipped, and the next `catch()` will be run instead. Each call to `readFile()` will return a promise that results in a file path and length pair. Therefore when we use `Promise.all()` on an array of these promises, we will ultimately end up with an array of these pairs -- our desired outcome.

### Wrapping Up

Promises give us new ways of handling sequential and parallel async tasks, and we can take advantage of chaining `.then()` and `.catch()` calls to compose a series of tasks into a single function. Compared to callbacks, we can see that promises have two nice properties. First, we did not need to use our own `mapAsync()` function -- `Promise.all()` is globally available and handles that functionality for us. Second, errors are automatically propagated along the promise chain for us. When using callbacks, we need to check for errors and use early returns to manage this ourselves.

[^1]: [fs](https://nodejs.org/api/fs.html)
[^2]: [System call](https://man7.org/linux/man-pages/man3/readdir.3.html)
