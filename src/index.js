const { handleGenerate } = require("./commands/generate");
const { destroyModel } = require("./commands/destroy");
const { migrateDB } = require("./commands/db");

const args = process.argv.slice(2);
const [cmd, type, name, ...rest] = args;

if (cmd === "g" || cmd === "generate") {
  return handleGenerate([type, name, ...rest]);
}

if (cmd === "d" || cmd === "destroy") {
  if (type === "model" && name) {
    return destroyModel(name);
  }
  console.log("Usage: prismo destroy model <Name>");
  return;
}

if (cmd === "db:migrate") {
  return migrateDB(type);
}

console.log("Prismo CLI Commands:");
console.log("  prismo g model <Name> field:type...");
console.log("  prismo destroy model <Name>");
console.log("  prismo db:migrate <Migration Name>");
