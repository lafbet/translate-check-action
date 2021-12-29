const core = require("@actions/core");
const _ = require("lodash");

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

    _.forIn(obj, (value, key) => {
      const translate = _.get(langObj, `${prevKey}.${key}`);

      if (_.isObject(value)) {
        check(value, `${prevKey}.${key}`);
      } else if (!translate) {
        _.setWith(errorsObj, `${label}.${prevKey}.${key}`, "-EMPTY-", Object);
      } else if (typeof translate !== typeof _.get(obj, key)) {
        _.setWith(
          errorsObj,
          `${label}.${prevKey}.${key}`,
          "-DIFFERENT_TYPE-",
          Object
        );
      } else if (translate === value) {
        _.setWith(warningsObj, `${label}.${prevKey}.${key}`, translate, Object);
      }
    });
  };
};

module.exports = (main, langsForCheck) => {
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

  langsForCheck.forEach((item) => {
    const check = getCheckFunc(item.label, item.langObj);

    _.forIn(main, (value, key) => check(value, key));
  });

  if (!_.isEmpty(warningsObj)) {
    _.forIn(warningsObj, (value, key) =>
      core.warning(JSON.stringify({ [key]: value }))
    );
  }

  if (!_.isEmpty(errorsObj)) {
    _.forIn(errorsObj, (value, key) =>
      core.error(JSON.stringify({ [key]: value }))
    );
  }

  return !_.isEmpty(errorsObj);
};
