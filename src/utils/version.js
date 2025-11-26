const path = require("path");
const fs = require("fs");

function getPrismoVersion() {
    const pkgPath = path.join(__dirname, "../../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    return pkg.version;
}

module.exports = getPrismoVersion;
