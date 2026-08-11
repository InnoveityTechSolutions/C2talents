const fs = require('fs');
const content = fs.readFileSync('d:/C2talents-main/C2talents-main/src/app/api/admin/ai/fetch-website/route.ts', 'utf8');

let level = 0;
let inString = false;
let stringChar = '';
let inSingleLineComment = false;
let inMultiLineComment = false;

for (let i = 0; i < content.length; i++) {
  const c = content[i];
  const nextC = content[i+1];
  
  if (inSingleLineComment) {
    if (c === '\n') inSingleLineComment = false;
    continue;
  }
  if (inMultiLineComment) {
    if (c === '*' && nextC === '/') {
      inMultiLineComment = false;
      i++;
    }
    continue;
  }
  if (inString) {
    if (c === '\\') { i++; continue; } // skip escaped
    if (c === stringChar) { inString = false; }
    // Skip template literal interpolations because they have braces
    // Actually, if we see `${` inside template literal, it opens a brace context, but we are just doing dumb parsing.
    // Let's just skip all braces inside strings.
    continue;
  }
  
  if (c === '/' && nextC === '/') { inSingleLineComment = true; i++; continue; }
  if (c === '/' && nextC === '*') { inMultiLineComment = true; i++; continue; }
  
  if (c === '"' || c === "'" || c === '`') {
    inString = true;
    stringChar = c;
    continue;
  }
  
  // Real brace?
  if (c === '{') {
    level++;
    // console.log('Open { at line ' + content.slice(0, i).split('\n').length + ' | Level ' + level);
  } else if (c === '}') {
    level--;
    // console.log('Close } at line ' + content.slice(0, i).split('\n').length + ' | Level ' + level);
  }
}
console.log('Final Level: ' + level);
