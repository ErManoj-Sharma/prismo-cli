const { generateModel } = require("./model");

function handleGenerate(args) {
  const [type, name, ...fields] = args;

  if (!type || !name) {
    console.log("Usage: prismo g model <Name> field:type...");
    return;
  }

  if (type === "model") {
    generateModel(name, fields);
    return;
  }

  console.log(`Unknown generate command: ${type}`);
}

module.exports = { handleGenerate };
