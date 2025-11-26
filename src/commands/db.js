const { execSync } = require("child_process");
const log = require("../utils/logger");

function migrateDB(name = "") {
  let migrationName = name;

  if (!migrationName) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    migrationName = `migration_${timestamp}`;
  }

  try {
    log.title("Database Migration");
    log.step(`Running migration: ${migrationName}`);

    execSync(`npx prisma migrate dev --name ${migrationName}`, { stdio: "inherit" });

    log.success("Migration complete! 🎉");
  } catch (error) {
    log.error("Migration failed!");
    log.warn("Check your schema or previous migration history.");
  }
}

module.exports = { migrateDB };
