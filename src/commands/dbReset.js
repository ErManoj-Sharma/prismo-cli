const { execSync } = require("child_process");
const log = require("../utils/logger");

function resetDB() {
  log.title("Database Reset");

  try {
    execSync("npx prisma migrate reset --force --skip-generate", { stdio: "inherit" });
    execSync("npx prisma migrate dev", { stdio: "inherit" });
    
    log.success("Database reset and migrations applied successfully!");
  } catch (err) {
    log.error("Database reset failed!");
  }
}

module.exports = { resetDB };
