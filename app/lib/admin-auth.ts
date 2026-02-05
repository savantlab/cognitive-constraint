import { cookies } from 'next/headers';

const ADMIN_EMAILS = [
  'stephie.maths@icloud.com',
];

export async function isAdmin(): Promise<boolean> {
  const email = await getAccessEmail();
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function getAccessEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get('ccj_access');
  
  if (!accessCookie?.value) {
    return null;
  }
  
  try {
    const decoded = Buffer.from(accessCookie.value, 'base64').toString('utf-8');
    const [email] = decoded.split(':');
    return email || null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<{ authorized: true; email: string } | { authorized: false; email: null }> {
  const email = await getAccessEmail();
  if (!email) return { authorized: false, email: null };
  if (!ADMIN_EMAILS.includes(email.toLowerCase())) return { authorized: false, email: null };
  return { authorized: true, email };
}
