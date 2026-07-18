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

    // Replace string literals like 'http://localhost:5000/api...'
    if (content.includes("'http://localhost:5000")) {
      content = content.replace(/'http:\/\/localhost:5000(.*?)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
      changed = true;
    }
    if (content.includes('"http://localhost:5000')) {
      content = content.replace(/"http:\/\/localhost:5000(.*?)"/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
      changed = true;
    }

    // Replace within template literals like `http://localhost:5000/api...`
    if (content.includes('`http://localhost:5000')) {
      content = content.replace(/`http:\/\/localhost:5000(.*?)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
