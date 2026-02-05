import { cookies } from 'next/headers';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get('ccj_access');
  return !!accessCookie?.value;
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
    return email ?? null;
  } catch {
    return null;
  }
}
