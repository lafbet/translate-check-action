const core = require("@actions/core");
const _ = require("lodash");
const fs = require("fs");

const errorsObj = {};
const warningsObj = {};

const getCheckFunc = (label, langObj) => {
  return function check(obj, prevKey) {
    if (!_.isObject(obj)) {
      const translate = _.get(langObj, `${prevKey}`);

      if (!translate) {
        _.set(errorsObj, `${label}.${prevKey}`, "-EMPTY-");
      } else if (typeof translate !== typeof obj) {
        _.set(errorsObj, `${label}.${prevKey}`, "-DIFFERENT_TYPE-");
      } else if (translate === obj) {
        _.setWith(warningsObj, `${label}.${prevKey}`, obj, Object);
      }

      return;
    }

    const keys = Object.keys(obj);

    keys.forEach((key) => {
      const translate = _.get(langObj, `${prevKey}.${key}`);

      if (_.isObject(obj[key])) {
        check(obj[key], `${prevKey}.${key}`);
      } else if (!translate) {
        _.set(errorsObj, `${label}.${prevKey}.${key}`, "-EMPTY-");
      } else if (typeof translate !== typeof _.get(obj, key)) {
        _.set(errorObj, `${label}.${prevKey}.${key}`, "-DIFFERENT_TYPE-");
      } else if (translate === obj[key]) {
        _.setWith(
          warningsObj,
          `${label}.${prevKey}.${key}`,
          JSON.stringify(translate),
          Object
        );
      }
    });
  };
};

function check(main, langsForCheck) {
  if (!main) {
    core.error(`Main file not found`);
    core.setFailed("");

    return;
  }

  if (!langsForCheck.length) {
    core.error(`Langs for check not found`);
    core.setFailed("");

    return;
  }

  langsForCheck = langsForCheck.map((item) => {
    const check = getCheckFunc(item.label, item.langObj);

    _.forIn(main, (value, key) => check(value, key));
  });

  if (!_.isEmpty(warningsObj)) {
    _.forIn(warningsObj, (value, key) =>
      core.warning(JSON.stringify({ [key]: value }, null, 2))
    );
  }

  if (!_.isEmpty(errorsObj)) {
    _.forIn(errorsObj, (value, key) =>
      core.error(JSON.stringify({ [key]: value }, null, 2))
    );
  }
}

const getJsonFromFile = (path) => JSON.parse(fs.readFileSync(path, "utf8"));

const getLabelFromPath = (path) => {
  const arr = path.split("/");
  const fileName = arr[arr.length - 1];

  return fileName.match(/([\S]*).json$/)[1];
};

const getFiles = () => {
  const { argv } = process;

  const mainParamIndex = argv.findIndex((value) => value === "-m");
  const fileParamIndex = argv.findIndex((value) => value === "-f");

  let main;
  let files;

  if (mainParamIndex !== -1) {
    main = getJsonFromFile(argv[mainParamIndex + 1]);
  }

  if (fileParamIndex !== -1) {
    let filesPaths = [];

    const endOfFilesIndex = argv
      .slice(fileParamIndex + 1, argv.length)
      .findIndex((value) => value.startsWith("-"));

    if (endOfFilesIndex !== -1) {
      filesPaths = argv.slice(fileParamIndex + 1, endOfFilesIndex + 1);
    } else {
      filesPaths = argv.slice(fileParamIndex + 1, argv.length);
    }

    if (filesPaths.length) {
      files = filesPaths.map((item) => ({
        label: getLabelFromPath(item),
        langObj: getJsonFromFile(item),
      }));
    }
  }

  return { main, files };
};

const { main, files } = getFiles();

check(main, files);
