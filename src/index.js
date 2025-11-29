#!/usr/bin/env node
const { Command } = require("commander");
const chalk = require("chalk");
const program = new Command();

const showHelp = require("./utils/help");
const getPrismoVersion = require("./utils/version");

const { handleGenerate } = require("./commands/generate");
const { destroyModel } = require("./commands/destroy");
const { migrateDB } = require("./commands/db");
const { addFieldToModel, removeFieldFromModel } = require("./commands/field");
const { dropDB } = require("./commands/dbDrop");
const { resetDB } = require("./commands/dbReset");
const { listModels } = require("./commands/dbList");
const { studio } = require("./commands/studio");
const { seedDB } = require("./commands/dbSeed");

// Disable Commander default help so only custom help appears
program.helpOption(false);
program.addHelpCommand(false);

// Metadata
program
  .name("prismo")
  .description("Prisma Schema Power Tools 🚀")
  .version(getPrismoVersion(), "-v, --version", "Show version");

// Helper: Migration reminder
function notifyMigration(message) {
  console.log(`\n⚠️  ${message}`);
  console.log(
    `   Run ${chalk.green("prismo db:migrate <name>")} or use ${chalk.green("-m")} flag next time.\n`
  );
}

// -------------------
// Generate Commands
// -------------------
program
  .command("g")
  .alias("generate")
  .argument("<type>", "model | field")
  .argument("<name>", "Model or field name")
  .argument("[fields...]", "field:type format")
  .option("-m, --migrate", "Run migration after generation")
  .option("--migration", "Alias for migrate")
  .action((type, name, fields, opts) => {
    const shouldMigrate = opts.migrate || opts.migration;

    if (type === "model") {
      handleGenerate(["model", name, ...fields]);

      if (shouldMigrate) {
        migrateDB(`add_${name.toLowerCase()}`);
      } else {
        notifyMigration(`Model "${name}" created but migration not executed.`);
      }

      return;
    }

    if (type === "field") {
      addFieldToModel(name, fields);

      if (shouldMigrate) {
        migrateDB(`update_${name.toLowerCase()}`);
      } else {
        notifyMigration(`Fields updated in "${name}" but migration not executed.`);
      }

      return;
    }

    console.log("Unknown generate type!");
  });

// -------------------
// Destroy Commands
// -------------------
program
  .command("d")
  .alias("destroy")
  .argument("<type>", "model | field")
  .argument("<name>", "Model")
  .argument("[field]", "Field")
  .option("-m, --migrate", "Run migration after deletion")
  .option("--migration", "Alias for migrate")
  .action((type, name, field, opts) => {
    const shouldMigrate = opts.migrate || opts.migration;

    if (type === "model") {
      destroyModel(name);

      if (shouldMigrate) {
        migrateDB(`remove_${name.toLowerCase()}`);
      } else {
        notifyMigration(`Model "${name}" removed but migration not executed.`);
      }

      return;
    }

    if (type === "field") {
      removeFieldFromModel(name, field);

      if (shouldMigrate) {
        migrateDB(`update_${name.toLowerCase()}`);
      } else {
        notifyMigration(`Field "${field}" removed but migration not executed.`);
      }

      return;
    }

    console.log("Unknown destroy type");
  });

// -------------------
// DB Commands
// -------------------
program.command("db:migrate")
  .argument("[name]", "Migration name")
  .action(migrateDB);

program.command("db:drop").action(dropDB);
program.command("db:reset").action(resetDB);
program.command("db:seed").action(seedDB);

// -------------------
// Studio + List
// -------------------
program.command("list models").action(listModels);
program.command("studio").alias("ui").action(studio);

// ---------------------
// Custom Help Override
// ---------------------
const rawArgs = process.argv.slice(2);

// Show help BEFORE Commander parses unknown flags
if (
  rawArgs.length === 0 ||
  rawArgs.includes("--help") ||
  rawArgs.includes("-h") ||
  rawArgs[0] === "help"
) {
  showHelp();
  process.exit(0);
}

// Parse everything else
program.parse(process.argv);
