import { sql } from '@vercel/postgres';

export default async (request: Request) => {
  if (request.method !== 'GET') {
      return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Verify connection to the specific Neon database
    try {
        const dbName = await sql`SELECT current_database();`;
        console.log(`Connected to database: ${dbName.rows[0].current_database}`);
    } catch (e) {
        console.error("Database connection failed:", e);
        return new Response(JSON.stringify({ 
            error: 'Database connection failed. Check POSTGRES_URL in Netlify Environment Variables.', 
            details: (e as Error).message 
        }), { status: 500 });
    }

    // Create Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        firstName VARCHAR(255),
        lastName VARCHAR(255),
        idNumber VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(255),
        province VARCHAR(255),
        highSchoolName VARCHAR(255),
        registeredAt VARCHAR(255),
        password VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      );
    `;

    // Ensure columns exist for OTP functionality (Migration logic)
    try {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)`;
        // New columns for OTP
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10)`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP`;
        
        // New columns for Registration details
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50)`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ethnicity VARCHAR(50)`;
    } catch (e) {
        console.log("Migration note: Columns might already exist or error in ALTER:", e);
    }

    // Create Applications Table (storing complex data as JSONB)
    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255),
        firstName VARCHAR(255),
        lastName VARCHAR(255),
        submittedAt VARCHAR(255),
        status VARCHAR(50),
        content JSONB
      );
    `;

    // Create Admins Table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(255) PRIMARY KEY,
        fullName VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50)
      );
    `;

    // Create Audit Logs Table (Security Requirement)
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        event_type VARCHAR(50),
        user_id VARCHAR(255),
        ip_address VARCHAR(50),
        details JSONB,
        created_at TIMESTAMP
      );
    `;

    return new Response(JSON.stringify({ message: 'Database initialized successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}