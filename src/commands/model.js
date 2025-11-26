function generateModel(name, fields) {
  console.log(`🛠  Creating model: ${name}`);
  console.log(`📌 Fields: ${fields.join(", ")}`);
}

module.exports = { generateModel };
