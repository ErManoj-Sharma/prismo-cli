const { handleGenerate } = require("./commands/generate");
const { destroyModel } = require("./commands/destroy");
const { migrateDB } = require("./commands/db");
const { addFieldToModel } = require("./commands/field");
const { removeFieldFromModel } = require("./commands/field");
const { dropDB } = require("./commands/dbDrop");
const { resetDB } = require("./commands/dbReset");
const { listModels } = require("./commands/dbList");

const args = process.argv.slice(2);
const [cmd, type, name, ...rest] = args;

if (cmd === "g" || cmd === "generate") {
  // prismo g model Post title:String
  if (type === "model") {
    return handleGenerate([type, name, ...rest]);
  }

  // prismo g field Article title:String
  if (type === "field") {
    if (!name || rest.length === 0) {
      console.log("Usage: prismo g field <Model> <field:type> <field:type>...");
      return;
    }
    return addFieldToModel(name, rest);
  }

  console.log("Usage: prismo g model <Name> field:type...");
  console.log("       prismo g field <Model> field:type...");
  return;
}

if (cmd === "d" || cmd === "destroy") {

  if (type === "model") {
    if (!name) return console.log("Usage: prismo d model <Name>");
    return destroyModel(name);
  }

  if (type === "field") {
    const [model, field] = [name, ...rest];
    if (!model || !field) {
      console.log("Usage: prismo d field <Model> <FieldName>");
      return;
    }
    return removeFieldFromModel(model, field);
  }

  console.log("Usage: prismo d model <Name>");
  console.log("Usage: prismo d field <Model> <FieldName>");
  return;
}


if (cmd === "db:migrate") {
  return migrateDB(type);
}

if (cmd === "db:drop") {
  return dropDB();
}

if (cmd === "db:reset") {
  return resetDB();
}

if (cmd === "list" && type === "models") {
  return listModels();
}
console.log("Prismo CLI Commands:");
console.log("  prismo g model <Name> field:type...");
console.log("  prismo g field <Model> field:type...");
console.log("  prismo d model <Name>");
console.log("  prismo d field <Model> <FieldName>");
console.log("  prismo db:migrate <Migration Name>");
