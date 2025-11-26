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

  const modelFields = fields
    .map((f) => {
      const [fieldName, type] = f.split(":");
      return `  ${fieldName} ${mapType(type)}`;
    })
    .join("\n");

  const modelBlock = `
model ${name} {
  id        String   @id @default(uuid())
${modelFields}
  createdAt DateTime @default(now())
}
`;

  // Append model at the end of file
  schema += "\n" + modelBlock;
  fs.writeFileSync(schemaPath, schema);

  console.log(`✨ Model ${name} added to schema.prisma`);
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
    date: "DateTime",
  };

  return mapping[type.toLowerCase()] || type;
}

module.exports = { addModelToPrisma };
