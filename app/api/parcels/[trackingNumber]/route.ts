import { NextResponse } from 'next/server';
import { getParcelByTracking, updateParcel } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { sendPaymentConfirmationEmail } from '@/lib/email';

interface RouteParams {
  params: Promise<{ trackingNumber: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { trackingNumber } = await params;
    const parcel = await getParcelByTracking(trackingNumber);

    if (!parcel) {
      return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: parcel });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch parcel', details: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 401 });
    }

    const { trackingNumber } = await params;
    const existing = await getParcelByTracking(trackingNumber);

    if (!existing) {
      return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
    }

    const body = await request.json();

    const updatedParcel = await updateParcel(trackingNumber, body);

    if (!updatedParcel) {
      return NextResponse.json({ error: 'Failed to update parcel' }, { status: 500 });
    }

    // Trigger email notifications if payment statuses transition to Paid
    let emailSentShipping = false;
    let emailSentDuty = false;

    if (body.shippingPaymentStatus === 'Paid' && existing.shippingPaymentStatus !== 'Paid') {
      const emailResult = await sendPaymentConfirmationEmail(updatedParcel, 'shipping');
      emailSentShipping = emailResult.success;
    }

    if (body.customDutyPaymentStatus === 'Paid' && existing.customDutyPaymentStatus !== 'Paid') {
      const emailResult = await sendPaymentConfirmationEmail(updatedParcel, 'duty');
      emailSentDuty = emailResult.success;
    }

    return NextResponse.json({
      success: true,
      data: updatedParcel,
      notifications: {
        shippingEmailSent: emailSentShipping,
        dutyEmailSent: emailSentDuty,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update parcel', details: String(err) }, { status: 500 });
  }
}
