const execSync = require("child_process").execSync;
const core = require("@actions/core");
const fs = require("fs");
const axios = require("axios");

const checkConfigs = require("./checkConfigs");
const checkSource = require("./checkFuncs");

async function getJsonFromFile(name, host) {
  const urlValor = `https://t.lafa.bet/api/locale/result?code=${name}&host=valor`;
  const urlLafa = `https://t.lafa.bet/api/locale/result?code=${name}&host=lafa`;
  try {
    const responses = await Promise.all([
      axios.get(urlValor),
      axios.get(urlLafa),
    ]);

    const dataValor = responses[0].data;
    const dataLafa = responses[1].data;

    const mergedValor = Object.assign({}, dataLafa, dataValor);
    const mergedLafa = Object.assign({}, dataValor, dataLafa);

    if (host === "valor") {
      return mergedValor;
    }

    return mergedLafa;
  } catch (error) {
    console.error(error);
    return null;
  }
}

const getTextFromFile = (path) => fs.readFileSync(path, "utf8");

const getMain = async (name, host) => {
  const result = await getJsonFromFile(name, host);

  return result;
};

const getConfigs = async (mainConfigName) => {
  const url = `https://t.lafa.bet/api/locale`;
  try {
    const response = await axios.get(url);
    return Object.keys(response.data).filter((item) => item !== mainConfigName);
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

  const configsCheckContent = await Promise.all(
    allConfigs.map(async (item) => ({
      label: item,
      langObj: await getJsonFromFile(item, host),
    }))
  );

  const filesCheckContent = sourceFilesPaths.map((item) => ({
    path: item,
    content: getTextFromFile(item),
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
