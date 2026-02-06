import { cookies } from 'next/headers';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'stephie.maths@icloud.com';

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('ccj_admin');
  
  if (!adminCookie?.value) {
    return false;
  }
  
  try {
    const decoded = Buffer.from(adminCookie.value, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    const prefix = parts[0];
    const email = parts[1];
    return prefix === 'admin' && email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  } catch {
    return false;
  }
}

export async function getAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('ccj_admin');
  
  if (!adminCookie?.value) {
    return null;
  }
  
  try {
    const decoded = Buffer.from(adminCookie.value, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    const prefix = parts[0];
    const email = parts[1];
    if (prefix === 'admin' && email) {
      return email;
    }
    return null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<{ authorized: true; email: string } | { authorized: false; email: null }> {
  const email = await getAdminEmail();
  if (!email) return { authorized: false, email: null };
  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return { authorized: false, email: null };
  return { authorized: true, email };
}

// Alias for backward compatibility
export const isAdminAuthenticated = isAdmin;
