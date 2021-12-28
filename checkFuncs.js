const core = require("@actions/core");
const _ = require("lodash");

const getFiles = require("./getFiles");
const utils = require("./utils");

const checkFiles = (mainConfig, files) => {
  let errors = [];

  if (!files) {
    core.warning("There are no files to check");

    return;
  }

  files.forEach((item) => {
    console.log("Check:", item.path);

    const allFuncs = item.content.match(
      /(^|\.|\{|\[|\s*)t\(["'][\w.]+["']\)/gm
    );

    if (allFuncs) {
      allFuncs.forEach((value) => {
        const [, configField] = value.match(/t\(["'][\w.]+["']\)/);

        if (!_.has(mainConfig, configField)) {
          errors = [...errors, `Error in ${item.path}: ${configField}`];
        }
      });
    }
  });

  if (errors.length) {
    errors.forEach(core.error);

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
