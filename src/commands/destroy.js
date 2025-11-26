const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function destroyModel(name) {
  if (!fs.existsSync(schemaPath)) {
    console.log("❌ prisma/schema.prisma not found!");
    return;
  }

  const modelName = capitalize(name); // normalize name
  let schema = fs.readFileSync(schemaPath, "utf8");

  const modelRegex = new RegExp(`model\\s+${modelName}[\\s\\S]*?}`, "g");

  if (!schema.match(modelRegex)) {
    console.log(`⚠️ Model "${modelName}" not found in schema.prisma`);
    return;
  }

  // Check for referencing models
  const referencingModels = findReferencingModels(schema, modelName);
  if (referencingModels.length > 0) {
    console.log(`❌ Cannot destroy model "${modelName}" 🚫`);
    console.log("Other models reference it:");
    referencingModels.forEach((m) => console.log(` - ${m}`));
    console.log(`\n➡️ Destroy those models first.`);
    return;
  }

  // Safe to remove
  schema = schema.replace(modelRegex, "");
  fs.writeFileSync(schemaPath, schema);

  try {
    execSync("npx prisma format", { stdio: "ignore" });
    console.log("✨ Schema formatted");
  } catch {}

  const migrationName = `remove_${modelName.toLowerCase()}`;

  console.log(`\n🗑️ Model "${modelName}" removed successfully!`);
  console.log("Next Step 👉 Run migration:");
  console.log(`  prismo db:migrate "${migrationName}"\n`);
}

function findReferencingModels(schema, targetModel) {
  const blocks = schema.match(/model\s+\w+[\s\S]*?}/g) || [];
  const refs = [];

  blocks.forEach(block => {
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
