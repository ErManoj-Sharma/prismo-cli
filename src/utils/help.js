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
${chalk.bold("Commands:")}

  ${chalk.green("g")} | ${chalk.green("generate")}        Create models / fields
      prismo g model <Name> <field:type>...
      prismo g field <Model> <field:type>...

  ${chalk.green("d")} | ${chalk.green("destroy")}         Remove models / fields
      prismo d model <Name>
      prismo d field <Model> <Field>

  ${chalk.green("db:migrate")} <name>   Create & apply a migration
  ${chalk.green("db:reset")}            Reset DB & reapply migrations
  ${chalk.green("db:drop")}             Drop the DB (fully)
  ${chalk.green("db:seed")}             Execute Prisma seed script

  ${chalk.green("list models")}         Display all available models
  ${chalk.green("studio")} | ${chalk.green("ui")}        Launch Prisma Studio UI
`);

  const options = chalk.whiteBright(`
${chalk.bold("Options:")}
  -m, --migrate        Auto-run migration after changes
  -v, --version        Show CLI version
  -h, --help           Show this help menu
`);

  const examples = chalk.whiteBright(`
${chalk.bold("Examples:")}
  prismo g model User name:string email:string --migrate
  prismo g field Post likes:int
  prismo d model Comment
  prismo db:migrate "init_users"
  prismo studio
`);

  const footer = chalk.cyanBright(`
✨ Tip: Use short aliases to save time! Happy Coding! ✨
`);

  console.log(title + header + usage + commands + options + examples + footer);
}

module.exports = showHelp;
