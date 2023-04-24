const execSync = require("child_process").execSync;
const core = require("@actions/core");
const fs = require("fs");
const axios = require("axios");

const checkConfigs = require("./checkConfigs");
const checkSource = require("./checkFuncs");

async function getJsonFromFile(name, host) {
  const url = `https://t.lafa.bet/api/locale/result?code=${name}&host=${host}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

const utils = {
  getLabelFromPath: (path) => {
    const arr = path.split("/");
    const fileName = arr[arr.length - 1];

    return fileName.match(/([\S]*).json$/)[1];
  },

  getTextFromFile: (path) => fs.readFileSync(path, "utf8"),
};

const getMain = async (name, host) => {
  const result = await getJsonFromFile(name, host);

  return result;
};

const getConfigs = async (mainConfigName) => {
  const url = `https://t.lafa.bet/api/locale`;
  try {
    const response = await axios.get(url);
    return Object.keys(response.data.result).filter(
      (item) => item !== mainConfigName
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getFiles = (path) => {
  const result = execSync(
    `grep -l [[:space:]*\\{\\.\\[]t\\([\\"\\'].*[\\"\\']\\) $(find ${path} -iregex ".*\\.[t|j]sx?")`,
    { encoding: "utf8" }
  );

  return result.split("\n").filter(Boolean);
};

const main = async () => {
  const mainConfigName = core.getInput("main_file");
  const pathSource = core.getInput("source_path");
  const host = core.getInput("host");

  const mainConfig = await getMain(mainConfigName, host);
  const allConfigs = await getConfigs(mainConfigName);
  const sourceFilesPaths = getFiles(pathSource);

  const configsCheckContent = allConfigs.map(async (item) => ({
    label: item,
    langObj: await getJsonFromFile(item),
  }));

  const filesCheckContent = sourceFilesPaths.map((item) => ({
    path: item,
    content: utils.getTextFromFile(item),
  }));

  core.startGroup("Configs check");
  const isConfigsError = checkConfigs(mainConfig, configsCheckContent);
  core.endGroup();

  core.startGroup("Source check");
  const isSourceError = checkSource(mainConfig, filesCheckContent);
  core.endGroup();

  if (isConfigsError || isSourceError) {
    core.setFailed("Translation error");
  }
};

main();
