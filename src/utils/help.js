const chalk = require("chalk");

function showHelp() {
    console.log(chalk.magentaBright.bold(`
┌────────────────────────────────────────────────────────────┐
│                     Prismo CLI Help                        │
└────────────────────────────────────────────────────────────┘
`));

    console.log(chalk.whiteBright(`
Usage:
  prismo <command> [options]

Commands:
  ${chalk.cyan("Generate")}
  prismo g model <ModelName> <field:type>...       Create a new model
  prismo g field <ModelName> <field:type>...       Add fields to a model

  ${chalk.cyan("Destroy")}
  prismo d model <ModelName>                       Remove a model
  prismo d field <ModelName> <Field>               Remove a field

  ${chalk.cyan("Database")}
  prismo db:migrate <name>                         Create & apply migration
  prismo db:reset                                  Reset DB & reapply migrations
  prismo db:drop                                   Drop database
  prismo db:seed                                   Run Prisma seed script
  prismo list models                               List all models in schema
  prismo studio                                    Launch Prisma Studio UI

Options:
  -h, --help                                       Show help
  -v, --version                                    Show version

Examples:
  prismo g model User name:string email:string
  prismo g field Post title:string
  prismo d model Order
  prismo db:migrate "add_users_table"
  prismo studio
`));
}

module.exports = showHelp;
