const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const OLD_PATTERN = /import\.meta\.env\.VITE_API_URL \|\| \(import\.meta\.env\.PROD \? 'https:\/\/tourbuddy-server-wlkl\.onrender\.com' : 'http:\/\/localhost:5000'\)/g;
const NEW_VALUE = "import.meta.env.VITE_API_URL";

walk(path.join(__dirname, 'src'), (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (OLD_PATTERN.test(content)) {
      // Reset lastIndex after test()
      OLD_PATTERN.lastIndex = 0;
      content = content.replace(OLD_PATTERN, NEW_VALUE);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned: ${filePath}`);
    }
  }
});
