import { sql } from '@vercel/postgres';

export default async (request: Request) => {
  try {
      // --- GET: Fetch Applications ---
      if (request.method === 'GET') {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        let result;
        if (userId) {
            result = await sql`SELECT content FROM applications WHERE userId = ${userId} ORDER BY submittedAt DESC`;
        } else {
            result = await sql`SELECT content FROM applications ORDER BY submittedAt DESC LIMIT 50`;
        }
        const apps = result.rows.map(row => row.content);
        return new Response(JSON.stringify(apps), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // --- POST: Save Application ---
      if (request.method === 'POST') {
        const appData = await request.json();
        const { id, userId, firstName, lastName, submittedAt, status } = appData;
        const ip = request.headers.get('x-forwarded-for') || 'unknown';

        await sql`
            INSERT INTO applications (id, userId, firstName, lastName, submittedAt, status, content)
            VALUES (${id}, ${userId}, ${firstName}, ${lastName}, ${submittedAt}, ${status}, ${JSON.stringify(appData)})
        `;

        // Log Audit Event
        const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
        const institutionsCount = appData.selectedInstitutions?.length || 0;
        
        await sql`
            INSERT INTO audit_logs (id, event_type, user_id, ip_address, details, created_at)
            VALUES (${logId}, 'APP_SUBMIT', ${userId}, ${ip}, ${JSON.stringify({ 
                institutions: institutionsCount,
                hasNSFAS: appData.nsfasRequired 
            })}, NOW())
        `;

        return new Response(JSON.stringify(appData), { status: 201 });
      }

      return new Response("Method Not Allowed", { status: 405 });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process application request', details: (error as Error).message }), { status: 500 });
  }
}