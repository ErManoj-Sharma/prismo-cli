const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

function destroyModel(name) {
  if (!fs.existsSync(schemaPath)) {
    console.log("❌ prisma/schema.prisma not found!");
    return;
  }

  let schema = fs.readFileSync(schemaPath, "utf8");

  const regex = new RegExp(`model\\s+${name}[\\s\\S]*?}\\s*`, "g");

  if (!schema.match(regex)) {
    console.log(`⚠️ Model "${name}" not found in schema.prisma`);
    return;
  }

  schema = schema.replace(regex, "");

  fs.writeFileSync(schemaPath, schema);

  // Format
  try {
    execSync("npx prisma format", { stdio: "ignore" });
    console.log("✨ Schema formatted");
  } catch {}

  const migrationName = `remove_${name.toLowerCase()}`;

  console.log(`\n🗑️ Model "${name}" removed successfully!`);
  console.log(`Next Step 👉 Run migration:`);
  console.log(`  prismo db:migrate "${migrationName}"\n`);
}

module.exports = { destroyModel };
