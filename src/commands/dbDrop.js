const { execSync } = require("child_process");
const log = require("../utils/logger");

function dropDB() {
  log.title("Database Drop");

  try {
    execSync("npx prisma migrate reset --force --skip-generate", { stdio: "inherit" });
    log.success("Database dropped successfully!");
  } catch (err) {
    log.error("Failed to drop database.");
  }
}

module.exports = { dropDB };
