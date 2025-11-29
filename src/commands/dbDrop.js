const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");
const log = require("../utils/logger");
const chalk = require("chalk");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
const generatedClientDir = path.join(process.cwd(), "app", "generated", "prisma");

function askConfirmation() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `\n${chalk.red("⚠️  WARNING: This will permanently delete DB & migrations.")}\n` +
      `   This action CANNOT be undone.\n\n` +
      `To proceed, type: prismo\n> `,
      (answer) => {
        rl.close();
        resolve(answer.trim() === "prismo");
      }
    );
  });
}

function readEnvVariable(key) {
  const envFile = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envFile)) return null;

  const envContent = fs.readFileSync(envFile, "utf8");
  const match = new RegExp(`^${key}=(.*)$`, "m").exec(envContent);
  return match ? match[1].replace(/"/g, "").trim() : null;
}

function parseDBInfo() {
  if (!fs.existsSync(schemaPath)) {
    log.error("❌ prisma/schema.prisma not found!");
    process.exit(1);
  }

  const schema = fs.readFileSync(schemaPath, "utf8");
  const datasourceMatch = schema.match(/datasource\s+db\s*{([\s\S]*?)}/);

  if (!datasourceMatch) {
    log.error("❌ No datasource 'db' found in schema.prisma");
    process.exit(1);
  }

  const block = datasourceMatch[1];
  const provider = /provider\s*=\s*"(.*?)"/.exec(block)?.[1];
  const urlDirect = /url\s*=\s*"(.*?)"/.exec(block)?.[1];
  const urlEnvKey = /url\s*=\s*env\("(.*?)"\)/.exec(block)?.[1];

  let url = urlDirect || (urlEnvKey ? readEnvVariable(urlEnvKey) : null);

  if (!provider || !url) {
    url = readEnvVariable("DATABASE_URL"); // Fallback 🎯
    if (!url) {
      log.error("❌ Could not determine database URL");
      process.exit(1);
    }
  }

  return { provider, url };
}

function resolveSQLitePath(url) {
  let dbFile = url.replace("file:", "").trim();
  if (!path.isAbsolute(dbFile)) dbFile = path.join(process.cwd(), dbFile);
  return path.resolve(dbFile);
}

function dropSQLite(url) {
  const filePath = resolveSQLitePath(url);

  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
    log.success(`SQLite DB removed: ${filePath}`);
  } else {
    log.warn("SQLite DB file already removed.");
  }
}

function dropPostgres(url) {
  const dbName = url.split("/").pop().split("?")[0];
  execSync(`psql -c "DROP DATABASE IF EXISTS \\"${dbName}\\";"`);
  log.success(`PostgreSQL database dropped: ${dbName}`);
}

function dropMySQL(url) {
  const dbName = url.split("/").pop().split("?")[0];
  execSync(`mysql -e "DROP DATABASE IF EXISTS \\\`${dbName}\\\`;"`);
  log.success(`MySQL database dropped: ${dbName}`);
}

async function dropDB(options = {}) {
  log.title("Database Drop");

  if (process.env.NODE_ENV === "production" && !options.force) {
    log.error("❌ Use --force to drop DB in production");
    process.exit(1);
  }

  if (!options.force) {
    const confirmed = await askConfirmation();
    if (!confirmed) return log.warn("Operation canceled.");
  }

  const { provider, url } = parseDBInfo();
  log.info(`Detected database provider: ${provider}`);

  if (provider === "sqlite") dropSQLite(url);
  else if (provider === "postgresql") dropPostgres(url);
  else if (provider === "mysql") dropMySQL(url);
  else {
    log.error(`❌ Unsupported provider: ${provider}`);
    process.exit(1);
  }

  if (fs.existsSync(migrationsDir)) {
    fs.rmSync(migrationsDir, { recursive: true, force: true });
    log.success("Migration history removed: prisma/migrations/");
  }

  if (fs.existsSync(generatedClientDir)) {
    fs.rmSync(generatedClientDir, { recursive: true, force: true });
    log.success("Generated Prisma client removed: app/generated/prisma/");
  }

  log.success("🎯 Database completely removed!");
  log.info(`Next: Run ${chalk.green("prismo db:migrate <name>")} to recreate schema.`);
}

module.exports = { dropDB };
