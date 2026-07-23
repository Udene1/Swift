import { Resend } from 'resend';
import { Parcel } from '@/types/parcel';
import { generatePdfBuffer, ReceiptType } from './pdf';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'SwiftDeliver <notifications@resend.dev>';

export async function sendPaymentConfirmationEmail(parcel: Parcel, receiptType: ReceiptType) {
  const isShipping = receiptType === 'shipping';
  const amount = isShipping ? parcel.shippingFee : parcel.customDuty;
  const recipientEmail = parcel.recipientEmail || parcel.senderEmail;
  const subject = isShipping
    ? `[SwiftDeliver] Shipping Fee Receipt - Parcel ${parcel.trackingNumber}`
    : `[SwiftDeliver] Custom Duty Clearance Confirmation - Parcel ${parcel.trackingNumber}`;

  const pdfBuffer = generatePdfBuffer(parcel, receiptType);
  const pdfFilename = isShipping
    ? `SwiftDeliver_Shipping_Receipt_${parcel.trackingNumber}.pdf`
    : `SwiftDeliver_Custom_Duty_Clearance_${parcel.trackingNumber}.pdf`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { background: #1e40af; color: #ffffff; padding: 28px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
          .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }
          .content { padding: 28px; }
          .badge { display: inline-block; background-color: #dcfce7; color: #15803d; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
          .card { background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .info-label { color: #64748b; font-size: 14px; }
          .info-value { font-weight: 600; color: #0f172a; font-size: 14px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SWIFTDELIVER</h1>
            <p>Global Logistics & Express Delivery Network</p>
          </div>
          <div class="content">
            <div class="badge">✔ PAYMENT VERIFIED</div>
            <h2 style="margin-top:0; color:#0f172a;">${isShipping ? 'Shipping Fee Payment Confirmed' : 'Custom Duty Clearance Confirmed'}</h2>
            <p>Dear ${parcel.recipientName},</p>
            <p>We are pleased to inform you that the payment for your parcel has been successfully processed and verified.</p>
            
            <div class="card">
              <div class="info-row">
                <span class="info-label">Tracking Number</span>
                <span class="info-value">${parcel.trackingNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Category</span>
                <span class="info-value">${isShipping ? 'Shipping & Logistics Fee' : 'Customs & Tariff Duty'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Amount Paid</span>
                <span class="info-value">$${amount.toFixed(2)} USD</span>
              </div>
              <div class="info-row">
                <span class="info-label">Current Parcel Status</span>
                <span class="info-value">${parcel.status}</span>
              </div>
              <div class="info-row" style="border-bottom:none;">
                <span class="info-label">Current Location</span>
                <span class="info-value">${parcel.currentLocation}</span>
              </div>
            </div>

            <p>Attached to this email is your official downloadable <strong>PDF Receipt (${pdfFilename})</strong> for your records.</p>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${parcel.trackingNumber}" class="btn" style="color: #ffffff;">Track Your Parcel Live</a>
            </div>
          </div>
          <div class="footer">
            <p>SwiftDeliver Logistics Inc. &bull; 100 World Trade Way, New York, NY</p>
            <p>Need support? Contact support@swiftdeliver-global.com</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: recipientEmail,
        subject,
        html: htmlContent,
        attachments: [
          {
            filename: pdfFilename,
            content: pdfBuffer,
          },
        ],
      });
      console.log(`[RESEND] Sent payment receipt email to ${recipientEmail}`);
      return { success: true };
    } catch (err) {
      console.error('[RESEND ERROR]', err);
      return { success: false, error: String(err) };
    }
  } else {
    console.log(`[EMAIL SIMULATION] RESEND_API_KEY not configured. Simulated sending email to ${recipientEmail} with attachment ${pdfFilename}`);
    return { success: true, simulated: true };
  }
}
