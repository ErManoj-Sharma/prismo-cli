#!/usr/bin/env node

const prismoLogo = require("../src/utils/logo");
const getPrismoVersion = require("../src/utils/version");

const args = process.argv.slice(2);

// Show logo + version if no arguments
if (args.length === 0) {
    prismoLogo();
    console.log(`v${getPrismoVersion()}`);
    process.exit(0);
}

// Handle version commands
if (
    args.includes("-v") ||
    args.includes("--version") ||
    args[0] === "version"
) {
    console.log(`Prismo CLI v${getPrismoVersion()}`);
    process.exit(0);
}

require("../src/index");
