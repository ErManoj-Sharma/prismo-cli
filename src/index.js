const { handleGenerate } = require("./commands/generate");

const args = process.argv.slice(2);
const [cmd, ...rest] = args;

switch (cmd) {
  case "g":
  case "generate":
    handleGenerate(rest);
    break;
  default:
    console.log("Prismo CLI Commands:");
    console.log("  prismo g model <Name> field:type field:type...");
}
