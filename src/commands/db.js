const { execSync } = require("child_process");

function migrateDB(name = "") {
  let migrationName = name;

  if (!migrationName) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    migrationName = `migration_${timestamp}`;
  }

  try {
    console.log(`🔄 Running migration: ${migrationName}`);
    execSync(`npx prisma migrate dev --name ${migrationName}`, { stdio: "inherit" });
    console.log("✨ Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed!");
  }
}

module.exports = { migrateDB };
