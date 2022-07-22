const fs = require("fs").promises;

const printLength = async (file) => {
  try {
    const data = await fs.readFile(file);
    console.log(`${file}: ${data.length}`);
  } catch (err) {
    console.error(err);
  }
};

printLength("async-await.js");
