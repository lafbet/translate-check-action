const execSync = require("child_process").execSync;
const core = require("@actions/core");
const fetch = require("node-fetch");

const utils = require("./utils");
const checkConfigs = require("./checkConfigs");
const checkSource = require("./checkFuncs");

const getMain = async (name, host) => {
  const result = await utils.getJsonFromFile(name, host);

  return result;
};

const getConfigs = async (mainConfigName) => {
  const response = await fetch(`https://t.lafa.bet/api/locale`);
  const result = Object.keys(await response.json());

  return result.filter((item) => item !== mainConfigName);
};

const getFiles = (path) => {
  const result = execSync(
    `grep -l [[:space:]*\\{\\.\\[]t\\([\\"\\'].*[\\"\\']\\) $(find ${path} -iregex ".*\\.[t|j]sx?")`,
    { encoding: "utf8" }
  );

  return result.split("\n").filter(Boolean);
};

const main = async () => {
  console.log(1111);
  const mainConfigName = core.getInput("main_file");
  const pathSource = core.getInput("source_path");
  const host = core.getInput("host");

  const mainConfig = await getMain(mainConfigName, host);
  const allConfigs = await getConfigs(mainConfigName);
  const sourceFilesPaths = getFiles(pathSource);

  const langObj = async (item) => {
    return await utils.getJsonFromFile(item);
  };

  const configsCheckContent = allConfigs.map(async (item) => ({
    label: item,
    langObj: await langObj(item),
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
