import { NextResponse } from 'next/server';
import { addTimelineEvent } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ trackingNumber: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 401 });
    }

    const { trackingNumber } = await params;
    const body = await request.json();

    if (!body.status || !body.location || !body.description) {
      return NextResponse.json({ error: 'Missing status, location, or description' }, { status: 400 });
    }

    const updated = await addTimelineEvent(trackingNumber, {
      status: body.status,
      location: body.location,
      description: body.description,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add timeline event', details: String(err) }, { status: 500 });
  }
}
