const core = require("@actions/core");
const _ = require("lodash");

const getErrorMessage = (path, fileContent, configValue) => {
  const lines = fileContent.split("\n");

  const targetLineIndex = lines.findIndex((line) => line.includes(configValue));

  const errorMessage = [
    lines[targetLineIndex - 2],
    lines[targetLineIndex - 1],
    lines[targetLineIndex],
    lines[targetLineIndex]
      .split("")
      .map((item) => (item === " " ? " " : "^"))
      .join(""),
    lines[targetLineIndex + 1],
    lines[targetLineIndex + 2],
  ].join("\n");

  return `Error in ${path}: \n ${errorMessage}`;
};

module.exports = (mainConfig, files) => {
  let errors = [];

  if (!files) {
    core.warning("There are no files to check");

    return;
  }

  files.forEach((item) => {
    console.log("Check:", item.path);

    const allFuncs = item.content.match(/(^|\.|\{|\[)t\(["']([\w.]+)["']\)/gm);

    if (allFuncs) {
      allFuncs.forEach((value) => {
        const [, configField] = value.match(/t\(["']([\w.]+)["']\)/);

        if (!_.has(mainConfig, configField)) {
          errors = [
            ...errors,
            getErrorMessage(item.path, item.content, configField),
          ];
        }
      });
    }
  });

  if (errors.length) {
    errors.forEach((item) => core.error(item));
  }

  return !_.isEmpty(errors);
};
