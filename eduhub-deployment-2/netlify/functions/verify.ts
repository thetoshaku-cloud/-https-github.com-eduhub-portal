import { sql } from '@vercel/postgres';

export default async (request: Request) => {
  if (request.method !== 'GET') {
      return new Response("Method Not Allowed", { status: 405 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
      return new Response('Invalid verification link: Token missing', { status: 400 });
  }

  try {
    // Update user status
    const result = await sql`
        UPDATE users 
        SET is_verified = TRUE, verification_token = NULL 
        WHERE verification_token = ${token} 
        RETURNING email
    `;

    if (result.rowCount === 0) {
        return new Response('Invalid or expired verification link.', { status: 400 });
    }
    
    // Redirect user to the login page with a success flag
    const appUrl = new URL(request.url).origin; 
    return Response.redirect(`${appUrl}/?view=login&verified=true`);

  } catch (error) {
    console.error("Verification error:", error);
    return new Response('Internal Server Error during verification', { status: 500 });
  }
}