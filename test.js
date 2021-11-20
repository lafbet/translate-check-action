const _ = require("lodash");

let obj = {};

obj = _.set(obj, "t.t2.t3.t4.t5.t6", "");

console.log(JSON.stringify(obj, null, 2));
