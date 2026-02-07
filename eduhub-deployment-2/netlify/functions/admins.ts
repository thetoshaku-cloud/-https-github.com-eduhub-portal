import { sql } from '@vercel/postgres';
import crypto from 'crypto';

// Security: Password Hashing Helper
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash.includes(':')) return password === storedHash;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

export default async (request: Request) => {
  if (request.method !== 'POST') {
      return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { action, ...data } = body;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (action === 'login') {
      const { email, password } = data;
      
      const { rows } = await sql`SELECT * FROM admins WHERE email = ${email} LIMIT 1`;
      
      if (rows.length > 0) {
        const admin = rows[0];
        const isValid = verifyPassword(password, admin.password);
        
        if (isValid) {
            // Log Admin Login
            const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
            await sql`
                INSERT INTO audit_logs (id, event_type, user_id, ip_address, details, created_at)
                VALUES (${logId}, 'ADMIN_LOGIN', ${admin.id}, ${ip}, ${JSON.stringify({ role: admin.role })}, NOW())
            `;

            const { password: _, ...adminWithoutPass } = admin;
            return new Response(JSON.stringify(adminWithoutPass), { status: 200 });
        }
      } 
      
      return new Response(JSON.stringify({ error: 'Invalid admin credentials' }), { status: 401 });
    } 
    
    else if (action === 'register') {
      const { id, fullName, email, password, role } = data;
      
      const hashedPassword = hashPassword(password);

      try {
        await sql`
          INSERT INTO admins (id, fullName, email, password, role)
          VALUES (${id}, ${fullName}, ${email}, ${hashedPassword}, ${role})
        `;

        // Log Admin Creation
        const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
        await sql`
            INSERT INTO audit_logs (id, event_type, user_id, ip_address, details, created_at)
            VALUES (${logId}, 'ADMIN_REGISTER', ${id}, ${ip}, ${JSON.stringify({ created_email: email })}, NOW())
        `;

        const { password: _, ...newAdmin } = data;
        return new Response(JSON.stringify(newAdmin), { status: 201 });
      } catch (e: any) {
        if (e.message.includes('unique constraint')) {
           return new Response(JSON.stringify({ error: 'Admin email already exists' }), { status: 409 });
        }
        throw e;
      }
    }

    return new Response('Invalid action', { status: 400 });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}