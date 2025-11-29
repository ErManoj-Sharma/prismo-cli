const chalk = require("chalk");

// 🔹 Valid root-level CLI commands
const validRootCommands = [
    "g", "generate",
    "d", "destroy",
    "r", "rel", "relation",
    "db:migrate", "db:drop", "db:reset", "db:seed",
    "studio", "ui",
    "list", "help",
];

// 🔹 Valid generate subcommands
const validSubCommands = [
    "model",
    "field",
    "relation"
];

// Levenshtein Distance Algorithm
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

// Suggest best alternative based on similarity
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

/* ======================================
   Primary Suggestion Handler (Root)
====================================== */
function handleSuggestions(rawArgs) {
    const inputCmd = rawArgs[0];
    if (!inputCmd) return;

    if (["--help", "-h"].includes(inputCmd)) return; // Help handled separately

    if (!validRootCommands.includes(inputCmd)) {
        const suggestion = getSuggestion(inputCmd, validRootCommands);

        console.log(chalk.red(`\n✖ Unknown command: "${inputCmd}"`));
        if (suggestion) {
            console.log(`🤔 Did you mean: ${chalk.green(`prismo ${suggestion}`)} ?`);
        }
        console.log(`\nRun ${chalk.cyan("prismo --help")} to see available commands.\n`);

        process.exit(1);
    }
}

/* ======================================
   Subcommand Suggestion Handler
====================================== */
function handleSubcommandSuggestions(type) {
    if (!type) return;

    if (!validSubCommands.includes(type)) {
        const suggestion = getSuggestion(type, validSubCommands);

        console.log(chalk.red(`\n✖ Unknown subcommand type: "${type}"`));
        if (suggestion) {
            console.log(`🤔 Did you mean: ${chalk.green(suggestion)} ?`);
        }
        console.log(`\nValid subcommands: ${chalk.yellow(validSubCommands.join(", "))}`);
        console.log(`Run ${chalk.cyan("prismo --help")} for usage examples.\n`);

        process.exit(1);
    }
}

module.exports = {
    handleSuggestions,
    handleSubcommandSuggestions,
};
