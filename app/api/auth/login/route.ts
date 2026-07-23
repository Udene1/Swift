import { NextResponse } from 'next/server';
import { validateCredentials, createAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (validateCredentials(username, password)) {
      await createAdminSession();
      return NextResponse.json({ success: true, message: 'Authentication successful' });
    }

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}
