import { config } from 'dotenv';

// Load environment variables from .env file
config();

export default {
  datasource: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/boilerplate_db?schema=public',
  },
};
