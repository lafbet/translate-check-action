const fs = require("fs");

module.exports = {
  getJsonFromFile: async (name, host) => {
    const response = await fetch(
      `https://t.lafa.bet/api/locale/result?host=${host}&code=${name}`
    );
    const result = await response.json();

    console.log(result);

    return JSON.parse(result);
  },

  getTextFromFile: (path) => fs.readFileSync(path, "utf8"),
};
