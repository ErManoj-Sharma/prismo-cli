const { addModelToPrisma } = require("../utils/prismaUtil");
const { execSync } = require("child_process");

function generateModel(name, fields) {
  // Add model to schema
  addModelToPrisma(name, fields);

  // Format schema (optional but recommended)
  try {
    execSync("npx prisma format", { stdio: "ignore" });
    console.log("✨ Schema formatted");
  } catch {
    console.log("⚠️ Prisma format skipped (maybe not installed?)");
  }

  const migrationName = `add_${name.toLowerCase()}`;

  console.log(`\n📌 Model "${name}" created successfully!`);
  console.log(`Next Step 👉 Run migration:`);
  console.log(`  prismo db:migrate "${migrationName}"\n`);
}

module.exports = { generateModel };
