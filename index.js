const core = require("@actions/core");
const get = require("lodash/get");

const getCheckFunc = (label, langObj) => {
  return function check(obj, prevKey) {
    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
      const s = get(langObj, `${prevKey}.${keys[i]}`);

      if (!s) return { success: false, path: `${prevKey}.${keys[i]}` };
      if (typeof s === "string") {
        if (s === obj[keys[i]]) {
          core.warning(`${label} SAME TRANSLATE: ${prevKey}.${keys[i]}`);
        }

        continue;
      }

      if (!check(obj[keys[i]], `${prevKey}.${keys[i]}`))
        return { success: false, path: `${prevKey}.${keys[i]}` };
    }

    return { success: true };
  };
};

function check(main, langsForCheck) {
  langsForCheck = langsForCheck.map((item) => {
    const errors = [];

    const check = getCheckFunc(item.label, item.langObj);

    Object.keys(main).forEach((key) => {
      const result = check(main[key], key);

      if (!result.success) {
        errors.push(result.path);
      }
    });

    if (errors.length) {
      core.error(`${item.label} errors: ${errors}`);
    }

    return errors;
  });

  langsForCheck.forEach((item) => {
    if (item.length) {
      core.setFailed("");
    }
  });
}

const fs = require("fs");

const getJsonFromFile = (path) => JSON.parse(fs.readFileSync(path, "utf8"));

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
        label: item,
        langObj: getJsonFromFile(item),
      }));
    }
  }

  return { main, files };
};

const { main, files } = getFiles();

check(main, files);
