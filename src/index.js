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
const { generateRelation } = require("./commands/relation");

const {
  handleSuggestions,
  handleSubcommandSuggestions,
} = require("./utils/suggestions");

// Disable default commander help
program.helpOption(false);
program.addHelpCommand(false);

// CLI metadata
program
  .name("prismo")
  .description("Prisma Schema Power Tools 🚀")
  .version(getPrismoVersion(), "-v, --version", "Show version");

// Migration reminder
function notifyMigration(message) {
  console.log(`\n⚠️  ${message}`);
  console.log(
    `   Run ${chalk.green("prismo db:migrate <name>")} or use ${chalk.green("-m")} flag next time.\n`
  );
}

/* ===============================
   GENERATE COMMAND
================================ */
program
  .command("g")
  .alias("generate")
  .argument("<type>", "model | field | relation")
  .argument("<name>", "Model name or relation type")
  .argument("[rest...]", "Fields or relation models")
  .option("-m, --migrate", "Run migration after schema update")
  .option("--migration", "Alias for migrate")
  .option("--cascade", "Enable cascade delete for relation")
  .action((type, name, rest, opts) => {
    const shouldMigrate = opts.migrate || opts.migration;
    handleSubcommandSuggestions(type);

    /* Create Model */
    if (type === "model") {
      const fields = rest || [];
      handleGenerate(["model", name, ...fields]);

      shouldMigrate
        ? migrateDB(`add_${name.toLowerCase()}`)
        : notifyMigration(`Model "${name}" created but migration not executed.`);
      return;
    }

    /* Create Field */
    if (type === "field") {
      const fields = rest || [];
      addFieldToModel(name, fields);

      shouldMigrate
        ? migrateDB(`update_${name.toLowerCase()}`)
        : notifyMigration(`Fields updated in "${name}" but migration not executed.`);
      return;
    }

    /* Create Relationship */
    if (type === "relation") {
      const [modelA, modelB] = rest || [];

      if (!modelA || !modelB) {
        console.log(
          `Usage: prismo g relation <1to1|1toM|Mto1|MtoM> <ModelA> <ModelB> [-m] [--cascade]`
        );
        return;
      }

      const ok = generateRelation(name, modelA, modelB, {
        cascade: !!opts.cascade,
      });
      if (!ok) return;

      const migName = `relation_${name.toLowerCase()}_${modelA.toLowerCase()}_${modelB.toLowerCase()}`;
      shouldMigrate ? migrateDB(migName) : notifyMigration(`Relation added but migration not executed.`);
      return;
    }

    console.log(`❌ Unknown generate type "${type}"`);
  });

/* ===============================
   RELATION SHORT ALIAS
================================ */
program
  .command("r")
  .alias("rel")
  .argument("<relationType>", "1to1 | 1toM | Mto1 | MtoM")
  .argument("<modelA>")
  .argument("<modelB>")
  .option("-m, --migrate")
  .option("--migration")
  .option("--cascade")
  .action((relationType, modelA, modelB, opts) => {
    const ok = generateRelation(relationType, modelA, modelB, {
      cascade: !!opts.cascade,
    });
    if (!ok) return;

    const migName = `relation_${relationType.toLowerCase()}_${modelA.toLowerCase()}_${modelB.toLowerCase()}`;
    opts.migrate || opts.migration
      ? migrateDB(migName)
      : notifyMigration(`Relation added but migration not executed.`);
  });

/* ===============================
   DESTROY COMMANDS
================================ */
program
  .command("d")
  .alias("destroy")
  .argument("<type>", "model | field")
  .argument("<name>", "Model name")
  .argument("[field]", "Field name")
  .option("-m, --migrate")
  .option("--migration")
  .action((type, name, field, opts) => {
    handleSubcommandSuggestions(type);

    const shouldMigrate = opts.migrate || opts.migration;

    if (type === "model") {
      destroyModel(name);
      shouldMigrate
        ? migrateDB(`remove_${name.toLowerCase()}`)
        : notifyMigration(`Model removed but migration not executed.`);
      return;
    }

    if (type === "field") {
      removeFieldFromModel(name, field);
      shouldMigrate
        ? migrateDB(`update_${name.toLowerCase()}`)
        : notifyMigration(`Field removed but migration not executed.`);
      return;
    }

    console.log("❌ Unknown destroy type");
  });

/* ===============================
   DB / STUDIO / LIST COMMANDS
================================ */
program.command("db:migrate").argument("[name]").action(migrateDB);
program.command("db:drop")
  .option("--force", "Skip confirmation and force database deletion")
  .action((opts) => dropDB(opts));

program.command("db:reset").action(resetDB);
program.command("db:seed").action(seedDB);
program.command("list models").action(listModels);
program.command("studio").alias("ui").action(studio);

/* ===============================
   CUSTOM HELP + SUGGESTIONS
================================ */
const rawArgs = process.argv.slice(2);

handleSuggestions(rawArgs);

if (
  rawArgs.length === 0 ||
  rawArgs.includes("-h") ||
  rawArgs.includes("--help") ||
  rawArgs[0] === "help"
) {
  showHelp();
  process.exit(0);
}

program.parse(process.argv);
