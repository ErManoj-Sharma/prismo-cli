const chalk = require("chalk");

function prismoLogo() {
    console.log(
        chalk.cyan(`
                                                                
    _/_/_/    _/_/_/    _/_/_/    _/_/_/  _/      _/    _/_/    
   _/    _/  _/    _/    _/    _/        _/_/  _/_/  _/    _/   
  _/_/_/    _/_/_/      _/      _/_/    _/  _/  _/  _/    _/    
 _/        _/    _/    _/          _/  _/      _/  _/    _/     
_/        _/    _/  _/_/_/  _/_/_/    _/      _/    _/_/        
                                                                
`) +
        chalk.magenta.bold("          Prisma Schema Power Tools 🚀\n")
    );
}

module.exports = prismoLogo;
