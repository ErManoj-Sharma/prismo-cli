const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const log = require("../utils/logger");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function destroyModel(name) {
  if (!fs.existsSync(schemaPath)) {
    log.error("prisma/schema.prisma not found!");
    return;
  }

  const modelName = capitalize(name);
  let schema = fs.readFileSync(schemaPath, "utf8");

  const modelRegex = new RegExp(`model\\s+${modelName}[\\s\\S]*?}`, "m");
  if (!schema.match(modelRegex)) {
    log.warn(`Model "${modelName}" not found in schema.prisma`);
    return;
  }

  // 🔍 Check for referencing models
  const referencingModels = findReferencingModels(schema, modelName);
  if (referencingModels.length > 0) {
    log.error(`Cannot destroy model "${modelName}" 🚫`);
    log.info("Other models reference it:");
    referencingModels.forEach((m) => log.warn(` - ${m}`));
    log.step(`Destroy those models first.`);
    return;
  }

  // 🗑 Safe to remove block
  schema = schema.replace(modelRegex, "");
  fs.writeFileSync(schemaPath, schema);

  try {
    execSync("npx prisma format", { stdio: "ignore" });
    log.success(`Schema formatted after removal`);
  } catch {}

  const migrationName = `remove_${modelName.toLowerCase()}`;

  log.success(`Model "${modelName}" removed successfully!`);
  log.step(`Run migration: prismo db:migrate "${migrationName}"`);
}

function findReferencingModels(schema, targetModel) {
  const blocks = schema.match(/model\s+\w+[\s\S]*?}/g) || [];
  const refs = [];

  blocks.forEach((block) => {
    const match = block.match(/model\s+(\w+)/);
    if (!match) return;

    const name = match[1];

    if (name !== targetModel && block.includes(targetModel)) {
      refs.push(name);
    }
  });

  return refs;
}

module.exports = { destroyModel };
