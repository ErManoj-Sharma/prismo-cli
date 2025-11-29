const chalk = require("chalk");

// Valid commands & subcommands
const validCommands = [
    "g", "generate",
    "d", "destroy",
    "db:migrate", "db:drop", "db:reset", "db:seed",
    "studio", "ui",
    "list"
];

// Levenshtein Distance for accuracy scoring
function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) =>
            i === 0 ? j : j === 0 ? i : 0
        )
    );

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
}

// Find closest match
function getSuggestion(input, list) {
    let bestMatch = null;
    let bestScore = Infinity;

    list.forEach(item => {
        const score = levenshtein(input, item);
        if (score < bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    });

    return bestScore <= 3 ? bestMatch : null;
}

function handleSuggestions(rawArgs) {
    const inputCmd = rawArgs[0];

    if (!inputCmd || ["--help", "-h"].includes(inputCmd)) return;

    if (!validCommands.includes(inputCmd)) {
        const suggestion = getSuggestion(inputCmd, validCommands);

        console.log(`\n❌ Unknown command: "${inputCmd}"`);
        if (suggestion) {
            console.log(`🤔 Did you mean: ${chalk.green(`prismo ${suggestion}`)} ?`);
        }
        console.log(`\nUse ${chalk.green("prismo --help")} to see available commands.\n`);
        process.exit(1);
    }
}
function handleSubcommandSuggestions(type) {
    const validSubCommands = ["model", "field"];

    if (!validSubCommands.includes(type)) {
        const suggestion = getSuggestion(type, validSubCommands);

        console.log(`\n❌ Unknown generate type: "${type}"`);
        if (suggestion) {
            console.log(`🤔 Did you mean: ${chalk.green(suggestion)} ?`);
        }
        console.log(`\nUse ${chalk.green("prismo --help")} for correct usage.\n`);
        process.exit(1);
    }
}




module.exports = { handleSuggestions, handleSubcommandSuggestions };
