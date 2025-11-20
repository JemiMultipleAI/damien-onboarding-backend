# Connecting to Neon PostgreSQL

This guide explains how to connect your backend to a Neon PostgreSQL database.

## Prerequisites

- A Neon account (sign up at [neon.tech](https://neon.tech))
- A Neon project created
- Your Neon connection string

## Setup Steps

### 1. Get Your Neon Connection String

1. Log in to your [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to the **Connection Details** section
4. Copy your connection string (it will look like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### 2. Configure Environment Variables

1. Copy the example environment file if you haven't already:
   ```bash
   cp .env.example .env
   ```

2. Edit your `.env` file and set the `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

   **Important**: Make sure your connection string includes `?sslmode=require` or the connection will fail.

### 3. No Additional Commands Needed!

The backend will automatically:
- ✅ Connect to Neon when you start the server
- ✅ Initialize the database schema (tables and indexes)
- ✅ Use SSL encryption (required by Neon)

### 4. Start Your Backend

```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Database schema initialized
🚀 Backend server running on http://localhost:3001
```

## Troubleshooting

### Connection Issues

If you see connection errors:

1. **Check your connection string**: Make sure it's correct and includes SSL mode
2. **Verify Neon project is active**: Check your Neon dashboard
3. **Check network access**: Ensure your IP isn't blocked (Neon allows all IPs by default)
4. **SSL errors**: The connection code automatically enables SSL for Neon connections

### Schema Already Exists

If you see "relation already exists" errors, that's normal - the schema initialization uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

## Alternative: Using Individual Parameters

If you prefer not to use a connection string, you can use individual parameters:

```env
DB_HOST=ep-xxx-xxx.region.aws.neon.tech
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
```

However, **you must also set SSL manually** in this case. The connection string method is recommended for Neon.

## Production Deployment

When deploying to production (Railway, Render, etc.), simply set the `DATABASE_URL` environment variable in your hosting platform's dashboard. The connection code will automatically handle SSL for Neon connections.

