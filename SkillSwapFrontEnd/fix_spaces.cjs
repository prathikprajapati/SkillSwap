const fs = require('fs');
const path = require('path');

const targetFilePath = process.argv[2];
if (!targetFilePath) {
  console.error('Please provide a file path');
  process.exit(1);
}

const filePath = path.resolve(targetFilePath);
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/ "([^"]+?)"/g, '"$1"');
content = content.replace(/"([^"]+?) "/g, '"$1"');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Fixed spaces in ${targetFilePath}`);
