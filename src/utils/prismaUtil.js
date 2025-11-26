const fs = require("fs");
const path = require("path");

const PRISMA_DIR = "prisma";
const SCHEMA_FILENAME = "schema.prisma";

function getSchemaPath() {
  return path.join(process.cwd(), PRISMA_DIR, SCHEMA_FILENAME);
}

function addModelToPrisma(name, fields) {
  const schemaPath = getSchemaPath();

  if (!fs.existsSync(schemaPath)) {
    console.error("❌ No prisma/schema.prisma found in this project!");
    return false;
  }

  const modelName = normalizeModelName(name);
  let schema = fs.readFileSync(schemaPath, "utf8");

  // 🛑 Prevent duplicate model
  const existsRegex = new RegExp(`model\\s+${modelName}\\b`, "i");
  if (existsRegex.test(schema)) {
    console.log(`⚠️ Model "${modelName}" already exists in schema.prisma`);
    return false;
  }

  const modelFields = generateFieldLines(fields);

  const modelBlock = `
model ${modelName} {
  id         String   @id @default(uuid())
${modelFields}
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
`;

  schema += "\n" + modelBlock;
  fs.writeFileSync(schemaPath, schema);

  console.log(`✨ Model "${modelName}" added to schema.prisma`);
  return true;
}

function generateFieldLines(fields) {
  let relationFields = [];
  let normalFields = [];

  fields.forEach(f => {
    const [fieldName, type] = f.split(":");
    if (!type) return;

    const clean = fieldName.trim();

    // 🧠 Auto @unique for emails
    const isEmail = clean.toLowerCase() === "email";

    if (type === "references" || type === "ref") {
      const relatedModel = normalizeModelName(clean);

      normalFields.push(
        `  ${clean} ${relatedModel} @relation(fields: [${clean}Id], references: [id])`
      );
      relationFields.push(`  ${clean}Id String`);
    } else {
      const prismaType = mapType(type);
      const uniqueRule = isEmail ? " @unique" : "";

      normalFields.push(`  ${clean} ${prismaType}${uniqueRule}`);
    }
  });

  return [...normalFields, ...relationFields].join("\n");
}


function mapType(type) {
  const mapping = {
    string: "String",
    str: "String",
    text: "String",
    int: "Int",
    number: "Int",
    bool: "Boolean",
    boolean: "Boolean",
    date: "DateTime"
  };
  return mapping[type.toLowerCase()] || type;
}

function normalizeModelName(name) {
  return name
    .split(/[_\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

module.exports = { addModelToPrisma };
