const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning project based on .gitignore...');
console.log(
  '⚠️  Warning: This will delete node_modules, .env, dist, coverage, and other .gitignore patterns.\n',
);

const projectRoot = path.resolve(__dirname, '..');
const gitignorePath = path.join(projectRoot, '.gitignore');

// Items to exclude from deletion for safety (critical project files)
const safetyExclusions = [
  '.git',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.build.json',
  'nest-cli.json',
  'jest.config.js',
  'eslint.config.js',
  '.prettierrc',
  '.prettierignore',
  'prisma/schema.prisma',
  'prisma/prisma.config.ts',
  'prisma/prisma.config.js',
  'src',
  'scripts',
  'doc',
  '.gitignore',
  '.env.example',
  'README.md',
];

/**
 * Parse .gitignore and extract cleanable patterns
 */
function parseGitignore() {
  try {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    const lines = content.split('\n');
    const patterns = [];

    for (let line of lines) {
      line = line.trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        continue;
      }

      // Skip negations (lines starting with !)
      if (line.startsWith('!')) {
        continue;
      }

      // Remove trailing slashes
      line = line.replace(/\/$/, '');

      // Check if pattern is safe to delete
      const isSafe = !safetyExclusions.some((exclusion) => {
        if (exclusion.includes('*')) {
          const regex = new RegExp('^' + exclusion.replace(/\*/g, '.*') + '$');
          return regex.test(line);
        }
        return line === exclusion || line.startsWith(exclusion + '/');
      });

      if (isSafe) {
        patterns.push(line);
      }
    }

    return patterns;
  } catch (error) {
    console.error('✗ Failed to read .gitignore:', error.message);
    process.exit(1);
  }
}

/**
 * Safely delete a file or directory
 */
function deleteItem(itemPath) {
  try {
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      fs.rmSync(itemPath, { recursive: true, force: true });
      console.log(`✓ Deleted directory: ${path.relative(projectRoot, itemPath)}`);
      return true;
    } else if (stats.isFile()) {
      fs.unlinkSync(itemPath);
      console.log(`✓ Deleted file: ${path.relative(projectRoot, itemPath)}`);
      return true;
    }
  } catch (error) {
    // Ignore if file/directory doesn't exist
    if (error.code !== 'ENOENT') {
      console.error(`✗ Failed to delete ${itemPath}:`, error.message);
    }
  }
  return false;
}

/**
 * Find files matching a glob pattern
 */
function findMatchingFiles(dir, pattern) {
  const matches = [];

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      // Skip protected items
      if (safetyExclusions.includes(item.name)) {
        continue;
      }

      // Check if matches pattern
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
        const regex = new RegExp('^' + regexPattern + '$');
        if (regex.test(item.name)) {
          matches.push(fullPath);
        }
      } else if (item.name === pattern) {
        matches.push(fullPath);
      }

      // Recurse into directories (except protected ones)
      if (item.isDirectory() && !safetyExclusions.includes(item.name)) {
        matches.push(...findMatchingFiles(fullPath, pattern));
      }
    }
  } catch (error) {
    // Ignore permission errors
  }

  return matches;
}

// Parse .gitignore
console.log('📖 Reading .gitignore...');
const patterns = parseGitignore();
console.log(`Found ${patterns.length} cleanable patterns\n`);

// Clean each pattern
let deletedCount = 0;

for (const pattern of patterns) {
  if (pattern.includes('*')) {
    // Handle glob patterns
    const matches = findMatchingFiles(projectRoot, pattern);
    for (const match of matches) {
      if (deleteItem(match)) {
        deletedCount++;
      }
    }
  } else {
    // Handle direct paths
    const itemPath = path.join(projectRoot, pattern);
    if (fs.existsSync(itemPath)) {
      if (deleteItem(itemPath)) {
        deletedCount++;
      }
    }
  }
}

console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} items.`);
console.log(
  '\n⚠️  Note: This script deletes all .gitignore patterns including node_modules and .env files.',
);
console.log('   Protected: Source code, config files, and .git directory.');
console.log('   To reinstall dependencies: npm install\n');
