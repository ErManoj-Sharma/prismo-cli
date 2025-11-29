// File: src/commands/relation.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const log = require("../utils/logger");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

function normalizeModelName(name) {
    if (!name) return "";
    return name
        .split(/[_\s]+/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join("");
}

function lowerFirst(str) {
    if (!str) return "";
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function pluralize(name) {
    if (!name) return "";
    return name.endsWith("s") ? name : name + "s";
}

function safeFormat() {
    try {
        execSync("npx prisma format", { stdio: "ignore" });
    } catch {
        log.warn("Prisma format failed (is Prisma installed?)");
    }
}

function loadSchema() {
    if (!fs.existsSync(schemaPath)) {
        log.error("No prisma/schema.prisma found in this project!");
        return null;
    }
    return fs.readFileSync(schemaPath, "utf8");
}

function getModelBlock(schema, modelName) {
    const regex = new RegExp(`model\\s+${modelName}\\b[\\s\\S]*?}`, "m");
    return schema.match(regex);
}

function hasField(block, fieldName) {
    const regex = new RegExp(`\\b${fieldName}\\b\\s+`, "m");
    return regex.test(block);
}

function appendLines(block, lines) {
    if (!lines || !lines.length) return block;
    const injection = "\n" + lines.join("\n");
    return block.replace(/}\s*$/, injection + "\n}");
}

/**
 * 1to1: ModelA ↔ ModelB
 * FK lives on ModelB (second model)
 */
function addOneToOne(schema, modelA, modelB, cascade) {
    const matchA = getModelBlock(schema, modelA);
    const matchB = getModelBlock(schema, modelB);

    if (!matchA) {
        log.error(`Model "${modelA}" not found in schema.prisma`);
        return null;
    }
    if (!matchB) {
        log.error(`Model "${modelB}" not found in schema.prisma`);
        return null;
    }

    let blockA = matchA[0];
    let blockB = matchB[0];

    const fieldNameA = lowerFirst(modelB);       // profile
    const fieldNameB = lowerFirst(modelA);       // user
    const fkName = `${fieldNameB}Id`;            // userId

    const relAttr = cascade ? ", onDelete: Cascade" : "";

    const linesA = [];
    if (!hasField(blockA, fieldNameA)) {
        linesA.push(`  ${fieldNameA} ${modelB}?`);
    } else {
        log.warn(`Field "${fieldNameA}" already exists on model "${modelA}"`);
    }

    const linesB = [];
    if (!hasField(blockB, fieldNameB)) {
        linesB.push(
            `  ${fieldNameB} ${modelA} @relation(fields: [${fkName}], references: [id]${relAttr})`
        );
    } else {
        log.warn(`Field "${fieldNameB}" already exists on model "${modelB}"`);
    }

    if (!hasField(blockB, fkName)) {
        linesB.push(`  ${fkName} String @unique`);
    } else {
        log.warn(`Field "${fkName}" already exists on model "${modelB}"`);
    }

    if (linesA.length) blockA = appendLines(blockA, linesA);
    if (linesB.length) blockB = appendLines(blockB, linesB);

    let updated = schema.replace(matchA[0], blockA);
    updated = updated.replace(matchB[0], blockB);

    return updated;
}

/**
 * 1toM: ModelOne → ModelMany
 * FK lives on ModelMany
 */
function addOneToMany(schema, modelOne, modelMany, cascade) {
    const matchOne = getModelBlock(schema, modelOne);
    const matchMany = getModelBlock(schema, modelMany);

    if (!matchOne) {
        log.error(`Model "${modelOne}" not found in schema.prisma`);
        return null;
    }
    if (!matchMany) {
        log.error(`Model "${modelMany}" not found in schema.prisma`);
        return null;
    }

    let blockOne = matchOne[0];
    let blockMany = matchMany[0];

    const listFieldName = pluralize(lowerFirst(modelMany)); // posts
    const singleFieldName = lowerFirst(modelOne);           // user
    const fkName = `${singleFieldName}Id`;                  // userId
    const relAttr = cascade ? ", onDelete: Cascade" : "";

    const linesOne = [];
    if (!hasField(blockOne, listFieldName)) {
        linesOne.push(`  ${listFieldName} ${modelMany}[]`);
    } else {
        log.warn(`Field "${listFieldName}" already exists on model "${modelOne}"`);
    }

    const linesMany = [];
    if (!hasField(blockMany, singleFieldName)) {
        linesMany.push(
            `  ${singleFieldName} ${modelOne} @relation(fields: [${fkName}], references: [id]${relAttr})`
        );
    } else {
        log.warn(`Field "${singleFieldName}" already exists on model "${modelMany}"`);
    }

    if (!hasField(blockMany, fkName)) {
        linesMany.push(`  ${fkName} String`);
    } else {
        log.warn(`Field "${fkName}" already exists on model "${modelMany}"`);
    }

    if (linesOne.length) blockOne = appendLines(blockOne, linesOne);
    if (linesMany.length) blockMany = appendLines(blockMany, linesMany);

    let updated = schema.replace(matchOne[0], blockOne);
    updated = updated.replace(matchMany[0], blockMany);

    return updated;
}

/**
 * MtoM: ModelA ↔ ModelB
 * Implicit many-to-many using array fields on both sides
 */
function addManyToMany(schema, modelA, modelB) {
    const matchA = getModelBlock(schema, modelA);
    const matchB = getModelBlock(schema, modelB);

    if (!matchA) {
        log.error(`Model "${modelA}" not found in schema.prisma`);
        return null;
    }
    if (!matchB) {
        log.error(`Model "${modelB}" not found in schema.prisma`);
        return null;
    }

    let blockA = matchA[0];
    let blockB = matchB[0];

    const fieldA = pluralize(lowerFirst(modelB)); // courses
    const fieldB = pluralize(lowerFirst(modelA)); // students

    const linesA = [];
    if (!hasField(blockA, fieldA)) {
        linesA.push(`  ${fieldA} ${modelB}[]`);
    } else {
        log.warn(`Field "${fieldA}" already exists on model "${modelA}"`);
    }

    const linesB = [];
    if (!hasField(blockB, fieldB)) {
        linesB.push(`  ${fieldB} ${modelA}[]`);
    } else {
        log.warn(`Field "${fieldB}" already exists on model "${modelB}"`);
    }

    if (linesA.length) blockA = appendLines(blockA, linesA);
    if (linesB.length) blockB = appendLines(blockB, linesB);

    let updated = schema.replace(matchA[0], blockA);
    updated = updated.replace(matchB[0], blockB);

    return updated;
}

/**
 * Main entry: prismo g relation <type> <ModelA> <ModelB> [--cascade]
 */
function generateRelation(type, rawModelA, rawModelB, options = {}) {
    const cascade = !!options.cascade;

    let schema = loadSchema();
    if (!schema) return false;

    const relationType = String(type || "").toLowerCase(); // 1to1 / 1tom / mto1 / mtom
    const modelA = normalizeModelName(rawModelA);
    const modelB = normalizeModelName(rawModelB);

    if (!modelA || !modelB) {
        log.error("Both ModelA and ModelB must be provided.");
        return false;
    }

    log.title("Create Relation");
    log.step(`Type: ${relationType} between ${modelA} ↔ ${modelB}`);

    let updated = null;

    switch (relationType) {
        case "1to1":
            updated = addOneToOne(schema, modelA, modelB, cascade);
            break;
        case "1tom":
            updated = addOneToMany(schema, modelA, modelB, cascade);
            break;
        case "mto1":
            // swap roles: many ModelA → one ModelB
            updated = addOneToMany(schema, modelB, modelA, cascade);
            break;
        case "mtom":
            updated = addManyToMany(schema, modelA, modelB);
            if (cascade) {
                log.warn("Cascade is not applied for implicit many-to-many relations.");
            }
            break;
        default:
            log.error(`Unknown relation type "${type}"`);
            log.info('Valid types: 1to1, 1toM, Mto1, MtoM');
            return false;
    }

    if (!updated) {
        log.error("Failed to create relation.");
        return false;
    }

    fs.writeFileSync(schemaPath, updated);
    safeFormat();

    log.success(`Relation "${type}" between "${modelA}" and "${modelB}" created in schema.prisma`);

    return true;
}

module.exports = {
    generateRelation,
};
