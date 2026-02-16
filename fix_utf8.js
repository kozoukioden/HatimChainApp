const fs = require('fs');
const files = [
  'app/tools/mosques.tsx',
  'app/tools/qibla.tsx',
  'app/tools/dhikr.tsx',
  'app/tools/kazatracker.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let count = 0;

  // Find all \uXXXX patterns (literal backslash + u + 4 hex digits)
  const regex = /\\u([0-9a-fA-F]{4})/g;
  const newContent = content.replace(regex, (match, hex) => {
    const code = parseInt(hex, 16);
    // Only replace Turkish/special chars, keep Arabic chars as-is in string literals
    count++;
    return String.fromCharCode(code);
  });

  if (count > 0) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(file + ': ' + count + ' replacements');
  } else {
    console.log(file + ': no changes');
  }
});
console.log('Done!');
