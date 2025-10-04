const { program } = require('commander');
const fs = require('fs');

program
  .option('--first')
  .option('-s, --separator <char>')
  .option('-f, --file <a.txt>', 'a.txt')
  .argument('<string>');

program.parse();

const options = program.opts();
const limit = options.first ? 1 : undefined;
let inputString = program.args[0];
if (options.file) {
    inputString = fs.readFileSync(options.file, 'utf-8');
    console.log(`File content:\n${inputString}`);
}

const splitResult = inputString.split(options.separator, limit);
console.log(splitResult);

const words = inputString.trim().split(/\s+/);
const wordCount = words.length;
console.log(`Number of words : ${wordCount}`);