const fs = require("fs").promises;

const filename = "promises.js";

fs.readFile(filename)
  .then((data) => console.log(`${filename}: ${data.length}`))
  .catch((err) => console.error(err));
