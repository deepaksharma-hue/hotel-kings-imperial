import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace emerald with rose
content = content.replace(/emerald-/g, 'rose-');

// replace lime with amber
content = content.replace(/lime-/g, 'amber-');

fs.writeFileSync('src/App.tsx', content);
console.log('Colors replaced successfully!');
