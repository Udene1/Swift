import { NextResponse } from 'next/server';
import { getParcelByTracking } from '@/lib/db';
import { generatePdfBuffer, ReceiptType } from '@/lib/pdf';

interface RouteParams {
  params: Promise<{ trackingNumber: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { trackingNumber } = await params;
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type') || 'shipping';
    const receiptType: ReceiptType = typeParam === 'duty' ? 'duty' : 'shipping';

    const parcel = await getParcelByTracking(trackingNumber);
    if (!parcel) {
      return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
    }

    if (receiptType === 'shipping' && parcel.shippingPaymentStatus !== 'Paid') {
      return NextResponse.json(
        { error: 'Shipping receipt is locked. Payment must be verified and marked as Paid by Administrator.' },
        { status: 403 }
      );
    }

    if (receiptType === 'duty' && parcel.customDutyPaymentStatus !== 'Paid') {
      return NextResponse.json(
        { error: 'Custom duty clearance receipt is locked. Duty payment must be verified and marked as Paid by Administrator.' },
        { status: 403 }
      );
    }

    const pdfBuffer = generatePdfBuffer(parcel, receiptType);
    const filename = receiptType === 'shipping' 
      ? `SwiftDeliver_Shipping_Receipt_${parcel.trackingNumber}.pdf` 
      : `SwiftDeliver_Duty_Clearance_${parcel.trackingNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate PDF receipt', details: String(err) }, { status: 500 });
  }
}
