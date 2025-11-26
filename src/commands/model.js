const { addModelToPrisma } = require("../utils/prismaUtil");
const { execSync } = require("child_process");
const log = require("../utils/logger");

function generateModel(name, fields) {
  log.title("Creating Model");

  const didCreate = addModelToPrisma(name, fields);

  if (!didCreate) {
    log.warn(`Model "${name}" was not created.`);
    return;
  }

  try {
    execSync("npx prisma format", { stdio: "ignore" });
    log.success("Schema formatted");
  } catch {
    log.warn("Prisma format skipped (maybe not installed?)");
  }

  const migrationName = `add_${name.toLowerCase()}`;

  log.success(`Model "${name}" created successfully!`);
  log.step(`Run migration: prismo db:migrate "${migrationName}"`);
}

module.exports = { generateModel };
