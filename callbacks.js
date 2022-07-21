// let count = 0;
// setInterval(() => console.log(`${++count} mississippi`), 1000);

// setTimeout(() => {
//   console.log("Hello from the past!");
//   process.exit();
// }, 5500);

// let count = 0;
// setInterval(() => console.log(`${++count} mississippi`), 1000);

// const setTimeoutSync = (ms) => {
//   const t0 = Date.now();
//   while (Date.now() - t0 < ms) {}
// };

// setTimeoutSync(5500);
// console.log("Hello from the past");
// process.exit();

// const fs = require("fs");
// const filename = "test.js";

// fs.readFile(filename, (err, fileData) => {
//   if (err) return console.error(err);
//   console.log(`${filename}: ${fileData.length}`);
// });

// const fs = require("fs");

// const mapAsync = (arr, fn, onFinish) => {
//   let prevError;
//   let nRemaining = arr.length;
//   const results = [];

//   arr.forEach((item, i) => {
//     fn(item, (err, data) => {
//       if (prevError) return;

//       if (err) {
//         prevError = err;
//         return onFinish(err);
//       }

//       results[i] = data;

//       nRemaining--;
//       if (!nRemaining) onFinish(null, results);
//     });
//   });
// };

// fs.readdir("./", (err, files) => {
//   if (err) return console.error(err);

//   mapAsync(files, fs.readFile, (err, results) => {
//     if (err) return console.error(err);

//     results.forEach((data, i) => console.log(`${files[i]}: ${data.length}`));

//     console.log("Done!");
//   });
// });

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
