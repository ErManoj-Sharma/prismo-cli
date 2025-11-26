const log = require("../utils/logger");
const { generateModel } = require("./model");

function handleGenerate(args) {
  const [type, name, ...fields] = args;

  if (!type || !name) {
    log.warn("Usage: prismo g model <Name> field:type...");
    return;
  }

  switch (type.toLowerCase()) {
    case "model":
      return generateModel(name, fields);

    case "field":
      log.warn("Use: prismo g field <ModelName> field:type");
      return;

    default:
      log.error(`Unknown generate command: "${type}"`);
      log.info("Supported:");
      log.info("  prismo g model <Name> field:type...");
      return;
  }
}

module.exports = { handleGenerate };
