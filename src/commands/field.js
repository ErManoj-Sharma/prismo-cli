const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

/* Utility Helpers */
function normalizeModelName(name) {
  return name
    .split(/[_\s]+/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
}

function pluralize(name) {
  return name.endsWith("s") ? name : name + "s";
}

function safeFormat() {
  try {
    execSync("npx prisma format", { stdio: "ignore" });
  } catch (err) {
    console.log("⚠️ Prisma format failed");
  }
}

function getModelBlock(schema, modelName) {
  const regex = new RegExp(`model\\s+${modelName}[\\s\\S]*?}`, "m");
  return schema.match(regex);
}

function isPlural(name) {
  return name.endsWith("s");
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

/* ✨ ADD FIELD + Reverse Relation */
function addFieldToModel(modelName, fields) {
  const formattedModelName = normalizeModelName(modelName);

  if (!fs.existsSync(schemaPath)) {
    console.log("❌ prisma/schema.prisma not found!");
    return;
  }

  let schema = fs.readFileSync(schemaPath, "utf8");
  let modelMatch = getModelBlock(schema, formattedModelName);
  if (!modelMatch) {
    console.log(`❌ Model "${formattedModelName}" does not exist.`);
    return;
  }

  let modelBlock = modelMatch[0];
  let updates = [];

  fields.forEach(f => {
    const [fieldName, type] = f.split(":");
    if (!type) return;

    const cleanName = fieldName.trim();
    const relatedModel = normalizeModelName(cleanName);

    if (modelBlock.includes(`${cleanName} `)) {
      console.log(`⚠️ Field "${cleanName}" already exists in ${formattedModelName}`);
      return;
    }

    if (type === "references" || type === "ref") {

      if (isPlural(cleanName)) {
        updates.push(`  ${cleanName} ${relatedModel}[]`);
        addReverseRelation(schema, relatedModel, formattedModelName);
      } else {
        updates.push(`  ${cleanName} ${relatedModel} @relation(fields: [${cleanName}Id], references: [id])`);
        updates.push(`  ${cleanName}Id String`);
        addReverseRelation(schema, relatedModel, formattedModelName, true);
      }

    } else {
      updates.push(`  ${cleanName} ${mapType(type)}`);
    }
  });

  if (updates.length === 0) return console.log("ℹ️ No fields added");

  modelBlock = modelBlock.replace(/}$/, `${updates.join("\n")}\n}`);
  schema = schema.replace(modelMatch[0], modelBlock);

  fs.writeFileSync(schemaPath, schema);
  safeFormat();

  console.log(`✨ Fields added to ${formattedModelName}`);
  console.log(`📌 Run: prismo db:migrate "update_${formattedModelName.toLowerCase()}"`);
}

/* ➕ Insert Reverse Relation Automatically */
function addReverseRelation(schema, targetModel, originModel, single = false) {
  const reverseName = pluralize(originModel.toLowerCase());
  const reverseField = `  ${reverseName} ${originModel}[]`;

  const targetMatch = getModelBlock(schema, targetModel);
  if (!targetMatch) return;

  let updatedTarget = targetMatch[0];

  if (!updatedTarget.includes(`${reverseName} `)) {
    updatedTarget = updatedTarget.replace(/}$/, `${reverseField}\n}`);
    schema = fs.readFileSync(schemaPath, "utf8").replace(targetMatch[0], updatedTarget);
    fs.writeFileSync(schemaPath, schema);
  }
}

/* 🗑️ REMOVE FIELD + Reverse Clean Up */
function removeFieldFromModel(modelName, fieldName) {
  const formattedModelName = normalizeModelName(modelName);
  const cleanFieldName = fieldName.trim();

  if (!fs.existsSync(schemaPath)) {
    console.log("❌ prisma/schema.prisma not found!");
    return;
  }

  let schema = fs.readFileSync(schemaPath, "utf8");
  let modelMatch = getModelBlock(schema, formattedModelName);

  if (!modelMatch) return console.log(`❌ Model "${formattedModelName}" does not exist.`);

  let modelBlock = modelMatch[0];

  if (!modelBlock.includes(`${cleanFieldName} `)) {
    return console.log(`⚠️ Field "${cleanFieldName}" does not exist in ${formattedModelName}`);
  }

  let lines = modelBlock.split("\n");

  // Remove field + FK lines safely
  lines = lines.filter(
    line =>
      !line.includes(`${cleanFieldName}Id `) &&
      !line.includes(`${cleanFieldName} `) &&
      // Keep id field
      !/^\s*\}$/.test(line)
  );

  // Ensure closing brace exists once
  if (!lines[lines.length - 1].trim().endsWith("}")) {
    lines.push("}");
  }

  let cleanModelBlock = lines.join("\n");

  schema = schema.replace(modelMatch[0], cleanModelBlock);

  // Remove reverse relation
  const relatedModel = normalizeModelName(cleanFieldName);
  const reverseRelationName = pluralize(formattedModelName.toLowerCase());

  let reverseMatch = getModelBlock(schema, relatedModel);
  if (reverseMatch) {
    let reverseLines = reverseMatch[0].split("\n");
    reverseLines = reverseLines.filter(
      line => !line.includes(`${reverseRelationName} `) && !/^\s*\}$/.test(line)
    );
    if (!reverseLines[reverseLines.length - 1].trim().endsWith("}"))
      reverseLines.push("}");
    schema = schema.replace(reverseMatch[0], reverseLines.join("\n"));
  }

  fs.writeFileSync(schemaPath, schema);
  safeFormat();

  console.log(`🗑️ Field "${cleanFieldName}" removed from ${formattedModelName}`);
  console.log(`📌 Run: prismo db:migrate "update_${formattedModelName.toLowerCase()}"`);
}


module.exports = {
  addFieldToModel,
  removeFieldFromModel,
};
