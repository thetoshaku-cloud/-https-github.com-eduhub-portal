import { sql } from '@vercel/postgres';

export default async (request: Request) => {
  if (request.method !== 'GET') {
      return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { rows } = await sql`
      SELECT * FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `;
    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}