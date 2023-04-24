const execSync = require("child_process").execSync;
const core = require("@actions/core");

const utils = require("./utils");
const checkConfigs = require("./checkConfigs");
const checkSource = require("./checkFuncs");

const getMain = (name, pathToTranslates) => {
  const result = utils.getJsonFromFile(`${pathToTranslates}/${name}`);

  console.log(name);

  return result;
};

const getConfigs = (mainConfigName, pathToTranslates) => {
  const result = execSync(`find ${pathToTranslates} -type f -name '*.json'`, {
    encoding: "utf8",
  });

  return result
    .split("\n")
    .filter((item) => item && utils.getLabelFromPath(item) !== mainConfigName);
};

const getFiles = (path) => {
  const result = execSync(
    `grep -l [[:space:]*\\{\\.\\[]t\\([\\"\\'].*[\\"\\']\\) $(find ${path} -iregex ".*\\.[t|j]sx?")`,
    { encoding: "utf8" }
  );

  return result.split("\n").filter(Boolean);
};

const main = () => {
  const mainConfigName = core.getInput("main_file");
  const pathToFiles = core.getInput("path_to_configs");
  const pathSource = core.getInput("source_path");

  const mainConfig = getMain(mainConfigName, pathToFiles);
  const allConfigs = getConfigs(mainConfigName, pathToFiles);
  const sourceFilesPaths = getFiles(pathSource);

  const configsCheckContent = allConfigs.map((item) => ({
    label: utils.getLabelFromPath(item),
    langObj: utils.getJsonFromFile(item),
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
