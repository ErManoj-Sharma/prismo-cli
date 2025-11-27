const { execSync } = require("child_process");
const log = require("../utils/logger");

function seedDB() {
    log.title("Database Seeding");

    try {
        log.step("Running seed script...");
        execSync("npx prisma db seed", { stdio: "inherit" });

        log.success("Seed completed successfully! 🌱");
    } catch (err) {
        log.error("Failed to run seed script!");
        log.warn("Check that `prisma/seed.js` or `ts-node` config exists.");
    }
}

module.exports = { seedDB };
