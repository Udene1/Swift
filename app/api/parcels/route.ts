import { NextResponse } from 'next/server';
import { getAllParcels, createParcel } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { CreateParcelInput } from '@/types/parcel';

export async function GET() {
  try {
    const parcels = await getAllParcels();
    return NextResponse.json({ success: true, data: parcels });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch parcels', details: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 401 });
    }

    const body: CreateParcelInput = await request.json();

    if (!body.senderName || !body.recipientName || !body.origin || !body.destination) {
      return NextResponse.json({ error: 'Missing required fields for parcel creation' }, { status: 400 });
    }

    const newParcel = await createParcel({
      senderName: body.senderName,
      senderEmail: body.senderEmail || '',
      senderAddress: body.senderAddress || '',
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail || '',
      recipientAddress: body.recipientAddress || '',
      origin: body.origin,
      destination: body.destination,
      currentLocation: body.currentLocation || body.origin,
      estimatedDelivery: body.estimatedDelivery || 'TBD',
      weightKg: Number(body.weightKg) || 1,
      description: body.description || 'General Goods',
      shippingFee: Number(body.shippingFee) || 0,
      customDuty: Number(body.customDuty) || 0,
    });

    return NextResponse.json({ success: true, data: newParcel }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create parcel', details: String(err) }, { status: 500 });
  }
}
