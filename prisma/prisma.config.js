require('dotenv').config();

module.exports = {
  migrate: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/boilerplate_db?schema=public',
  },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/boilerplate_db?schema=public',
  },
};
