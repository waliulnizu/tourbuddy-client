const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(path.join(__dirname, 'src'), (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace { ...headers(), 'Content-Type': 'multipart/form-data' } with headers()
    // Or just remove the 'Content-Type': 'multipart/form-data' part.
    if (content.includes("'Content-Type': 'multipart/form-data'")) {
      content = content.replace(/,\s*'Content-Type':\s*'multipart\/form-data'/g, "");
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
