const fs = require("fs");
const path = require("path");
const log = require("../utils/logger");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

function listModels() {
  log.title("Database Models");

  if (!fs.existsSync(schemaPath)) {
    log.error("prisma/schema.prisma not found!");
    return;
  }

  const schema = fs.readFileSync(schemaPath, "utf8");
  const modelBlocks = schema.match(/model\s+\w+[\s\S]*?}/g) || [];

  if (modelBlocks.length === 0) {
    log.warn("No models found in schema.");
    return;
  }

  modelBlocks.forEach(model => {
    const header = model.match(/model\s+(\w+)/)[1];
    log.success(`\n📦 Model: ${header}`);

    const fields = model
      .split("\n")
      .slice(1, -1) // remove model {} lines
      .map(f => f.trim())
      .filter(f => f.length > 0);

    fields.forEach(field => log.info(`  - ${field}`));
  });

  log.step("\nAll models listed.");
}

module.exports = { listModels };
