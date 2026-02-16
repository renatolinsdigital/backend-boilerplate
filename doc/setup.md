# Setup & Getting Started

## Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 10
- **PostgreSQL** running locally or accessible from a development machine

## Installation

1. **Install dependencies**

   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   ```

2. **Configure database**

   **Install PostgreSQL:**
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/), run installer, note the password you set for the `postgres` user
   - **macOS**: `brew install postgresql@18` then `brew services start postgresql@18`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib` (Debian/Ubuntu) or `sudo dnf install postgresql-server` (Fedora)

   **Create a database:**

   ```bash
   psql -U postgres # or psql -U postgres -p <port_number> if you need to inform the port
   CREATE DATABASE boilerplate_db;
   \q
   ```

   **Configure connection:**
   - Copy `.env.example` to `.env` (after creating the `.env` file)
   - Update `DATABASE_URL` with your PostgreSQL credentials
   - Example: `postgresql://postgres:yourpassword@localhost:5432/boilerplate_db?schema=public`
   - Replace `yourpassword` with the password you set during PostgreSQL installation
   - Default port is `5432`

   Ps. If you are facing user or password connection problems, try using the entire connection string in the terminal: `psql "host=127.0.0.1 port=5433 user=postgres dbname=postgres"`

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open `http://localhost:3000` in your browser
   - The root endpoint will show API information and available endpoints

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Run production build
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations

## Creating Your First User

Send a POST request to `/users/register`:

```json
{
  "email": "jane@example.com",
  "name": "Jane Doe",
  "password": "secret"
}
```

## Logging In

Send a POST request to `/auth/login`:

```json
{
  "email": "jane@example.com",
  "password": "secret"
}
```

The password will be hashed before being stored in the database, and validated using bcryptjs during login.
