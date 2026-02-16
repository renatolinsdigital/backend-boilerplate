require('dotenv').config();
const { execSync } = require('child_process');

const url = process.env.DATABASE_URL;

if (!url) {
  console.error('ERROR: DATABASE_URL is not set in .env file');
  process.exit(1);
}

try {
  execSync(`npx prisma migrate dev --name init --url "${url}"`, { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}
