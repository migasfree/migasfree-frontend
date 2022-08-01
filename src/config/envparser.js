const DotEnv = require('dotenv')
const parsedEnv = DotEnv.config().parsed

module.exports = function () {
  // Let's stringify our variables
  for (const key in parsedEnv) {
    if (typeof parsedEnv[key] === 'string') {
      parsedEnv[key] = JSON.stringify(parsedEnv[key])
    }
  }
  return parsedEnv
}
