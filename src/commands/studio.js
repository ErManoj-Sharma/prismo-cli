const { execSync } = require("child_process");
const log = require("../utils/logger");

function studio() {
    try {
        log.title("Prisma Studio");
        log.step("Opening Prisma Studio in your browser...");

        execSync(`npx prisma studio`, { stdio: "inherit" });

        log.success("Prisma Studio is running! 🚀");
        log.info("Press Ctrl + C to exit.\n");
    } catch (error) {
        log.error("Failed to launch Prisma Studio!");
        log.warn("Make sure Prisma is installed and schema is valid.");
    }
}

module.exports = { studio };
