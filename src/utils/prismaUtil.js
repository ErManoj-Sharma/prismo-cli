const fs = require("fs");
const path = require("path");
const log = require("./logger");

const PRISMA_DIR = "prisma";
const SCHEMA_FILE = "schema.prisma";

/**
 * Return absolute schema.prisma file path
 */
function getSchemaPath() {
  return path.join(process.cwd(), PRISMA_DIR, SCHEMA_FILE);
}

/**
 * Format model name — PascalCase ensured
 */
function normalizeName(name) {
  return name
    .split(/[_\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/**
 * Convert short form types → Prisma types
 */
function mapType(type) {
  const mapping = {
    // Text Types
    string: "String",
    str: "String",
    text: "String",
    varchar: "String",
    char: "String",

    // Numeric
    int: "Int",
    integer: "Int",
    number: "Int",
    smallint: "Int",
    mediumint: "Int",

    bigint: "BigInt",
    long: "BigInt",

    float: "Float",
    double: "Float",
    "double precision": "Float",

    decimal: "Decimal",
    numeric: "Decimal",
    money: "Decimal",

    // Boolean
    bool: "Boolean",
    boolean: "Boolean",

    // Date / Time
    date: "DateTime",
    datetime: "DateTime",
    timestamp: "DateTime",

    // JSON (Postgres / MySQL)
    json: "Json",
    jsonb: "Json",

    // Binary types
    blob: "Bytes",
    bytea: "Bytes",
    binary: "Bytes",
    varbinary: "Bytes",

    // UUID (many DBs support UUID type)
    uuid: "String",
  };

  return mapping[type.toLowerCase()] || type;
}


/**
 * Generate model fields based on user input
 */
function generateModelFields(fields) {
  const fieldLines = [];
  const fkLines = [];

  fields.forEach(field => {
    const [rawName, rawType] = field.split(":");
    if (!rawType) return;

    const fieldName = rawName.trim();
    const isEmail = fieldName.toLowerCase() === "email";
    const type = rawType.toLowerCase();

    // Relation Handling
    if (type === "references" || type === "ref") {
      const relatedModel = normalizeName(fieldName);

      fieldLines.push(
        `  ${fieldName} ${relatedModel} @relation(fields: [${fieldName}Id], references: [id])`
      );
      fkLines.push(`  ${fieldName}Id String`);
    } else {
      const unique = isEmail ? " @unique" : "";
      fieldLines.push(`  ${fieldName} ${mapType(type)}${unique}`);
    }
  });

  return [...fieldLines, ...fkLines].join("\n");
}

/**
 * Add a new model to schema.prisma with checks
 */
function addModelToPrisma(name, fields = []) {
  const schemaPath = getSchemaPath();

  if (!fs.existsSync(schemaPath)) {
    log.error("No prisma/schema.prisma found in this project!");
    return false;
  }

  const modelName = normalizeName(name);
  let schema = fs.readFileSync(schemaPath, "utf8");

  // Avoid duplicate models
  const existingModel = new RegExp(`model\\s+${modelName}\\b`, "i");
  if (existingModel.test(schema)) {
    log.warn(`Model "${modelName}" already exists in schema.prisma`);
    return false;
  }

  const fieldBlock = generateModelFields(fields);

  const modelBlock = `
model ${modelName} {
  id        String   @id @default(uuid())
${fieldBlock}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;

  // Append with spacing
  if (!schema.endsWith("\n")) schema += "\n";
  schema += `\n${modelBlock}\n`;

  fs.writeFileSync(schemaPath, schema);
  log.success(`Model "${modelName}" added successfully!`);

  return true;
}

module.exports = {
  addModelToPrisma,
};
