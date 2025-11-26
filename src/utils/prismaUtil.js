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
    return;
  }

  let schema = fs.readFileSync(schemaPath, "utf8");

  const modelFields = generateFieldLines(fields);

  const modelBlock = `
model ${name} {
  id        String   @id @default(uuid())
${modelFields}
  createdAt DateTime @default(now())
}
`;

  schema += "\n" + modelBlock;
  fs.writeFileSync(schemaPath, schema);

  console.log(`✨ Model ${name} added to schema.prisma`);
}

function generateFieldLines(fields) {
  let relationFields = [];
  let normalFields = [];

  fields.forEach(f => {
    const [fieldName, type] = f.split(":");

    if (!type) return;

    if (type === "references" || type === "ref") {
      const relatedModel = capitalize(fieldName);

      // Main relation field
      normalFields.push(`  ${fieldName} ${relatedModel} @relation(fields: [${fieldName}Id], references: [id])`);
      
      // Foreign key field
      relationFields.push(`  ${fieldName}Id String`);
    } else {
      normalFields.push(`  ${fieldName} ${mapType(type)}`);
    }
  });

  return [...normalFields, ...relationFields].join("\n");
}

function mapType(type) {
  if (!type) return "String";

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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { addModelToPrisma };
