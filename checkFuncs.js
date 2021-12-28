const core = require("@actions/core");
const _ = require("lodash");

const getFiles = require("./getFiles");
const utils = require("./utils");

const checkFiles = (mainConfig, files) => {
  let isError = false;

  files.forEach((item) => {
    console.log("Check:", item.path);

    const allFuncs = item.content.match(/t\(["']([\w.]+)["']\)/gm);

    if (allFuncs) {
      allFuncs.forEach((value) => {
        const [, configField] = value.match(/t\(["']([\w.]+)["']\)/);

        if (!_.has(mainConfig, configField)) {
          isError = true;
          core.error(`Error in ${item.path}: ${value}`);
        }
      });
    }
  });

  if (isError) {
    core.setFailed("");
  }
};

const transformFiles = (paths) =>
  paths.map((item) => ({
    path: item,
    content: utils.getTextFromFile(item),
  }));

const { main, files } = getFiles(utils.getJsonFromFile, transformFiles);

checkFiles(main, files);
