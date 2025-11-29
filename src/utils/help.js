const chalk = require("chalk");
const getPrismoVersion = require("./version");

function showHelp() {
  const title = chalk.magentaBright.bold(`
┌────────────────────────────────────────────────────────────┐
│                      Prismo CLI Help 🛠️                     │
└────────────────────────────────────────────────────────────┘`);

  const header = `
${chalk.cyanBright("Prisma Schema Power Tools 🚀")}
Version: ${chalk.white(getPrismoVersion())}
`;

  const usage = chalk.whiteBright(`
${chalk.bold("Usage:")}
  prismo <command> [options]
`);

  const commands = chalk.whiteBright(`
${chalk.bold("Core Commands:")}

  ${chalk.green("g")} | ${chalk.green("generate")}        Create models / fields / relations
      prismo g model <Name> <field:type>...
      prismo g field <Model> <field:type>...

  ${chalk.green("d")} | ${chalk.green("destroy")}         Remove models / fields
      prismo d model <Name>
      prismo d field <Model> <Field>

${chalk.bold("Database Commands:")}

  ${chalk.green("db:migrate")} <name>     Create & apply migration
  ${chalk.green("db:reset")}               Reset DB + reapply migrations
  ${chalk.green("db:drop")}                ⚠ Fully delete DB + migration history
  ${chalk.green("db:seed")}                Run Prisma seed script

${chalk.bold("Tools:")}

  ${chalk.green("list models")}            Show all Prisma models
  ${chalk.green("studio")} | ${chalk.green("ui")}         Launch Prisma Studio UI
`);

  const relationSection = chalk.white(`
${chalk.bold.cyanBright("Relationship Commands:")}

📍 Format:
  prismo g relation <type> <ModelA> <ModelB> [options]

🧩 Available Types:
  ${chalk.green("1to1")}   One-to-One
  ${chalk.green("1toM")}   One-to-Many
  ${chalk.green("Mto1")}   Many-to-One
  ${chalk.green("MtoM")}   Many-to-Many

📌 Examples:
  prismo g relation 1to1 User Profile --cascade -m
  prismo g relation 1toM User Post -m
  prismo g relation Mto1 Order User
  prismo g relation MtoM User Role --cascade
`);

  const options = chalk.whiteBright(`
${chalk.bold("Options:")}
  -m, --migrate         Auto-run migration after schema changes
  --cascade             Enable cascade delete on foreign key
  -v, --version         Show CLI version
  -h, --help            Show help menu
`);

  const warnings = chalk.red(`
⚠ IMPORTANT NOTES:

- ${chalk.bold("db:drop")} will delete:
    ✔ Database file/instance
    ✔ All migrations
    ✘ But keeps schema.prisma intact (safe for regeneration)

${chalk.yellowBright(`- When not using ${chalk.green("-m")}, you MUST run:
    ${chalk.gray("prismo db:migrate <name>")}
  to sync database after schema changes`)}
`);

  const examples = chalk.whiteBright(`
${chalk.bold("Quick Examples:")}

  prismo g model User name:string age:int --migrate
  prismo g field Post likes:int
  prismo g relation 1toM User Post --cascade -m
  prismo db:migrate "init"
  prismo studio
`);

  const footer = chalk.cyanBright(`
✨ Tip: Short aliases speed up workflow → try: prismo g model Post title:string ✨
`);

  console.log(
    title +
    header +
    usage +
    commands +
    relationSection +
    options +
    warnings +
    examples +
    footer
  );
}

module.exports = showHelp;
