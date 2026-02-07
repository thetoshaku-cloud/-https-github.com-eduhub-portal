import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import { Buffer } from 'buffer';
import nodemailer from 'nodemailer';

// --- HELPER: Check for Test Account ---
const isTestEmail = (email: string) => email.endsWith('@test.com') || email.endsWith('@example.com');

// --- HELPER: Send Email via Nodemailer ---
async function sendEmailOTP(to: string, otpCode: string): Promise<boolean> {
  // TEST MODE: Skip real sending
  if (isTestEmail(to)) {
      console.log(`[TEST MODE] Skipping Email Send for ${to}. OTP is ${otpCode}`);
      return true;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  // DEV FALLBACK: Log code if credentials missing
  if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn("SMTP credentials missing. OTP email not sent.");
      console.log("#############################################");
      console.log(`[DEV LOG] OTP for ${to}: ${otpCode}`);
      console.log("#############################################");
      // Return true so the frontend flow continues (assuming Dev wants to see the UI)
      return true;
  }

  try {
      const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: 587,
          secure: false, 
          auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
          from: `"EduHub Security" <${smtpUser}>`,
          to: to,
          subject: "Your EduHub Verification Code",
          text: `Your verification code is: ${otpCode}. It expires in 15 minutes.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #f5f5f4;">
                <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #ea580c; margin-bottom: 20px;">EduHub Verification</h2>
                    <p style="font-size: 16px; color: #444;">Please use the code below to verify your account:</p>
                    <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1c1917;">${otpCode}</span>
                    </div>
                    <p style="font-size: 12px; color: #78716c;">Valid for 15 minutes.</p>
                </div>
            </div>
          `
      });
      console.log(`[Email] OTP sent to ${to}`);
      return true;
  } catch (error) {
      console.error("[Email] Send Failed:", error);
      // We return true here to prevent blocking registration if email fails (User can click resend later)
      return true;
  }
}

async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  if (isTestEmail(to)) {
      console.log(`[TEST MODE] Welcome Email simulated for ${to}`);
      return true;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) return false;

  try {
      const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: 587,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
          from: `"EduHub Team" <${smtpUser}>`,
          to: to,
          subject: "Welcome to EduHub!",
          html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #f5f5f4;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #1c1917; font-size: 24px;">Welcome, ${name}!</h1>
                    <p style="font-size: 16px; line-height: 1.5; color: #444;">
                        Your account has been successfully verified. You are now ready to apply to South Africa's top institutions.
                    </p>
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="https://eduhub.co.za" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold;">Start Applying</a>
                    </div>
                </div>
            </div>
          `
      });
      console.log(`[Email] Welcome sent to ${to}`);
      return true;
  } catch (error) {
      console.error("[Email] Welcome Send Failed:", error);
      return false;
  }
}

// --- HELPER: Send Real SMS via Twilio ---
async function sendTwilioSMS(to: string, body: string): Promise<boolean> {
  if (isTestEmail(to)) return true; // Skip SMS for test users

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) return false;

  try {
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', fromNumber);
    params.append('Body', body);

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    return response.ok;
  } catch (error) {
    console.error("[SMS] Send Failed:", error);
    return false;
  }
}

// Security: Password Hashing
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
  try {
    // --- GET: Fetch Users (Admin) ---
    if (request.method === 'GET') {
        const { rows } = await sql`SELECT id, firstName, lastName, idNumber, email, phone, province, highSchoolName, registeredAt, is_verified, gender, ethnicity FROM users ORDER BY registeredAt DESC LIMIT 100`;
        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // --- POST: Actions ---
    if (request.method === 'POST') {
        const body = await request.json();
        const { action, ...data } = body;
        const ip = request.headers.get('x-forwarded-for') || 'unknown';

        if (action === 'login') {
            const email = data.email.toLowerCase().trim();
            const { password } = data;
            
            const { rows } = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
            
            if (rows.length > 0) {
                const user = rows[0];
                
                // CRITICAL: Block Login if not verified
                if (user.is_verified !== true) {
                   return new Response(JSON.stringify({ 
                       error: 'Account not verified. Please verify your email or phone.',
                       needsVerification: true,
                       email: user.email
                   }), { status: 403 });
                }

                const isValid = verifyPassword(password, user.password);
                
                if (isValid) {
                    const { password: _, verification_token: __, otp_code: ___, ...userWithoutPass } = user;
                    return new Response(JSON.stringify(userWithoutPass), { status: 200 });
                }
            }
            
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        } 
        
        else if (action === 'register') {
            const { id, firstName, lastName, idNumber, phone, province, highSchoolName, registeredAt, password, gender, ethnicity } = data;
            const email = data.email.toLowerCase().trim();
            
            const hashedPassword = hashPassword(password);
            
            // Generate OTP (Default random, but fixed for Test Mode)
            let otpCode = Math.floor(10000 + Math.random() * 90000).toString();
            if (isTestEmail(email)) {
                otpCode = '12345';
                console.log(`[TEST MODE] Registered ${email} with OTP 12345`);
            }

            try {
                // Use Postgres interval for expiry to avoid JS timezone issues
                await sql`
                INSERT INTO users (id, firstName, lastName, idNumber, email, phone, province, highSchoolName, registeredAt, password, is_verified, otp_code, otp_expires_at, gender, ethnicity)
                VALUES (${id}, ${firstName}, ${lastName}, ${idNumber}, ${email}, ${phone}, ${province}, ${highSchoolName}, ${registeredAt}, ${hashedPassword}, FALSE, ${otpCode}, NOW() + INTERVAL '15 minutes', ${gender}, ${ethnicity})
                `;

                // Send OTP via BOTH channels (Promise.allSettled ensures one failure doesn't block response)
                const smsPromise = sendTwilioSMS(phone, `EduHub Code: ${otpCode}`);
                const emailPromise = sendEmailOTP(email, otpCode);
                
                await Promise.allSettled([smsPromise, emailPromise]);

                const { password: _, ...newUser } = data;
                return new Response(JSON.stringify({ 
                    ...newUser, 
                    email: email, // ensure lowercase email is returned
                    message: 'OTP sent to Email and SMS.'
                }), { status: 201 });

            } catch (e: any) {
                if (e.message.includes('unique constraint')) {
                    return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 409 });
                }
                throw e;
            }
        }

        else if (action === 'resend_otp') {
            const email = data.email.toLowerCase().trim();
            
            let otpCode = Math.floor(10000 + Math.random() * 90000).toString();
            if (isTestEmail(email)) {
                otpCode = '12345';
            }

            const { rows } = await sql`
                UPDATE users 
                SET otp_code = ${otpCode}, otp_expires_at = NOW() + INTERVAL '15 minutes'
                WHERE email = ${email} 
                RETURNING phone, id
            `;

            if (rows.length === 0) {
                 return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
            }

            const phone = rows[0].phone;
            
            const smsPromise = sendTwilioSMS(phone, `EduHub Code: ${otpCode}`);
            const emailPromise = sendEmailOTP(email, otpCode);
            await Promise.allSettled([smsPromise, emailPromise]);

            return new Response(JSON.stringify({ message: 'Code resent' }), { status: 200 });
        }

        else if (action === 'verify_otp') {
            const email = data.email.toLowerCase().trim();
            const code = data.code.toString().trim();

            // Check Code and Expiry in SQL directly
            const { rows } = await sql`
                SELECT * FROM users 
                WHERE email = ${email} 
                AND otp_code = ${code}
                AND otp_expires_at > NOW()
                LIMIT 1
            `;

            if (rows.length === 0) {
                return new Response(JSON.stringify({ error: 'Invalid or Expired Code.' }), { status: 400 });
            }

            const user = rows[0];

            // Verify
            await sql`
                UPDATE users 
                SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL 
                WHERE id = ${user.id}
            `;
            
            // Send Welcome Email
            try {
                const name = user.firstName || user.firstname || 'Student';
                await sendWelcomeEmail(email, name);
            } catch (emailErr) {
                console.error("Welcome email failed", emailErr);
            }

            const { password: _, otp_code: __, ...verifiedUser } = user;
            verifiedUser.is_verified = true;

            return new Response(JSON.stringify(verifiedUser), { status: 200 });
        }

        return new Response('Invalid action', { status: 400 });
    }

    return new Response("Method Not Allowed", { status: 405 });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}