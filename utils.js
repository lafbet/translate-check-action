const fs = require("fs");

module.exports = {
  getJsonFromFile: (path) => JSON.parse(fs.readFileSync(path, "utf8")),

  getLabelFromPath: (path) => {
    const arr = path.split("/");
    const fileName = arr[arr.length - 1];

    return fileName.match(/([\S]*).json$/)[1];
  },

  getTextFromFile: (path) => fs.readFileSync(path, "utf8"),
};
