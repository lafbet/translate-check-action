module.exports = (transformMain, transformCallback) => {
  const { argv } = process;

  const mainParamIndex = argv.findIndex((value) => value === "-m");
  const fileParamIndex = argv.findIndex((value) => value === "-f");

  let main;
  let files;

  if (mainParamIndex !== -1) {
    main = transformMain(argv[mainParamIndex + 1]);
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
      files = transformCallback(filesPaths);
    }
  }

  return { main, files };
};
