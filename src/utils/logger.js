const chalk = require("chalk");

const log = {
  success: (msg) => console.log(chalk.greenBright(`✔ ${msg}`)),
  info: (msg) => console.log(chalk.blueBright(`ℹ ${msg}`)),
  warn: (msg) => console.log(chalk.yellowBright(`⚠ ${msg}`)),
  error: (msg) => console.log(chalk.redBright(`✖ ${msg}`)),
  step: (msg) => console.log(chalk.cyanBright(`→ ${msg}`)),
  title: (msg) => console.log(chalk.magentaBright.bold(`\n📌 ${msg}`)),
};

module.exports = log;
