import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Parcel } from '@/types/parcel';

export type ReceiptType = 'shipping' | 'duty';

export function generatePdfBuffer(parcel: Parcel, type: ReceiptType): Buffer {
  const doc = new jsPDF();
  buildPdfDocument(doc, parcel, type);
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

export function generatePdfBlob(parcel: Parcel, type: ReceiptType): Blob {
  const doc = new jsPDF();
  buildPdfDocument(doc, parcel, type);
  return doc.output('blob');
}

function buildPdfDocument(doc: jsPDF, parcel: Parcel, type: ReceiptType) {
  const isShipping = type === 'shipping';
  const primaryColor: [number, number, number] = isShipping ? [37, 99, 235] : [15, 118, 110]; // Blue or Teal

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SWIFTDELIVER', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('GLOBAL LOGISTICS & FREIGHT CLEARANCE NETWORK', 14, 25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(isShipping ? 'SHIPPING PAYMENT RECEIPT' : 'CUSTOM DUTY CLEARANCE', 200, 18, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`TRACKING #: ${parcel.trackingNumber}`, 200, 25, { align: 'right' });

  // Receipt Reference Info Box
  let y = 42;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 28, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  const receiptRef = isShipping ? `SHP-${parcel.trackingNumber}` : `DUTY-${parcel.trackingNumber}`;
  const paidDate = isShipping 
    ? (parcel.shippingPaidAt ? new Date(parcel.shippingPaidAt).toLocaleDateString('en-US', { dateStyle: 'full' }) : 'N/A')
    : (parcel.customDutyPaidAt ? new Date(parcel.customDutyPaidAt).toLocaleDateString('en-US', { dateStyle: 'full' }) : 'N/A');

  doc.text('Receipt Reference:', 20, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptRef, 55, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.text('Date of Payment:', 20, y + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(paidDate, 55, y + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Status:', 120, y + 9);
  doc.setFont('helvetica', 'normal');
  const statusText = isShipping ? parcel.shippingPaymentStatus : parcel.customDutyPaymentStatus;
  
  if (statusText === 'Paid') {
    doc.setTextColor(22, 101, 52); // Green
    doc.text('PAID & VERIFIED ✔', 152, y + 9);
  } else {
    doc.setTextColor(185, 28, 28); // Red
    doc.text('UNPAID / PENDING', 152, y + 9);
  }

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', 120, y + 17);
  doc.setFont('helvetica', 'normal');
  const amount = isShipping ? parcel.shippingFee : parcel.customDuty;
  doc.text(`$${amount.toFixed(2)} USD`, 152, y + 17);

  // Address Section
  y = 76;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('SENDER INFORMATION', 14, y);
  doc.text('RECIPIENT INFORMATION', 110, y);

  doc.setLineWidth(0.5);
  doc.setDrawColor(...primaryColor);
  doc.line(14, y + 2, 95, y + 2);
  doc.line(110, y + 2, 196, y + 2);

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  
  // Sender lines
  doc.setFont('helvetica', 'bold');
  doc.text(parcel.senderName, 14, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Email: ${parcel.senderEmail}`, 14, y + 14);
  const senderAddrLines = doc.splitTextToSize(`Address: ${parcel.senderAddress}`, 80);
  doc.text(senderAddrLines, 14, y + 19);

  // Recipient lines
  doc.setFont('helvetica', 'bold');
  doc.text(parcel.recipientName, 110, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Email: ${parcel.recipientEmail}`, 110, y + 14);
  const recipAddrLines = doc.splitTextToSize(`Address: ${parcel.recipientAddress}`, 80);
  doc.text(recipAddrLines, 110, y + 19);

  // Package Overview Table
  y = 108;
  autoTable(doc, {
    startY: y,
    head: [['Tracking Number', 'Origin', 'Destination', 'Weight (kg)', 'Current Status']],
    body: [
      [parcel.trackingNumber, parcel.origin, parcel.destination, `${parcel.weightKg} kg`, parcel.status]
    ],
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 },
    theme: 'grid'
  });

  // Fee Details Table
  // @ts-expect-error - jspdf-autotable attaches lastAutoTable
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(isShipping ? 'SHIPPING FEE ITEMIZED BREAKDOWN' : 'CUSTOM DUTY & ASSESSMENT DETAILS', 14, finalY);

  let tableHead: string[][];
  let tableBody: (string | number)[][];

  if (isShipping) {
    tableHead = [['Description / Charge Item', 'Rate Basis', 'Amount (USD)']];
    tableBody = [
      ['Standard Air Freight & Handling', `${parcel.weightKg} kg @ Base Freight`, `$${(parcel.shippingFee * 0.75).toFixed(2)}`],
      ['Express Security & Terminal Processing Fee', 'Flat Rate', `$${(parcel.shippingFee * 0.15).toFixed(2)}`],
      ['Fuel Surcharge & Administrative Insurance', 'Calculated', `$${(parcel.shippingFee * 0.10).toFixed(2)}`],
      ['TOTAL SHIPPING FEE', 'GUARANTEED FULL COVERAGE', `$${parcel.shippingFee.toFixed(2)}`]
    ];
  } else {
    tableHead = [['Customs Charge / Inspection Tariff', 'Regulatory Code', 'Amount (USD)']];
    tableBody = [
      ['Import Tax & International Harmonized Tariff', 'HS-CODE: 8471.60.90', `$${(parcel.customDuty * 0.70).toFixed(2)}`],
      ['Customs Inspection & Port Security Assessment', 'BORDER SEC REG 4', `$${(parcel.customDuty * 0.20).toFixed(2)}`],
      ['Administrative Duty Release Processing', 'CUSTOMS DOC ADM', `$${(parcel.customDuty * 0.10).toFixed(2)}`],
      ['TOTAL CUSTOM DUTY CLEARANCE FEE', 'OFFICIALLY CLEARED', `$${parcel.customDuty.toFixed(2)}`]
    ];
  }

  autoTable(doc, {
    startY: finalY + 4,
    head: tableHead,
    body: tableBody,
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    theme: 'striped'
  });

  // Footer & Official Stamp
  // @ts-expect-error - jspdf-autotable attaches lastAutoTable
  const bottomY = doc.lastAutoTable.finalY + 15;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, bottomY, 182, 35, 2, 2, 'F');

  doc.setLineWidth(1);
  doc.setDrawColor(...primaryColor);
  doc.rect(148, bottomY + 4, 42, 26);
  doc.setTextColor(...primaryColor);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SWIFTDELIVER', 169, bottomY + 11, { align: 'center' });
  doc.text(isShipping ? 'PAYMENT VERIFIED' : 'DUTY CLEARED', 169, bottomY + 17, { align: 'center' });
  doc.text(new Date().toISOString().split('T')[0], 169, bottomY + 23, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for choosing SwiftDeliver Global Logistics.', 20, bottomY + 10);
  doc.text('This receipt serves as official proof of payment for customs & shipping verification.', 20, bottomY + 16);
  doc.text('Support & Queries: support@swiftdeliver-global.com | www.swiftdeliver.com', 20, bottomY + 22);
  doc.text('SwiftDeliver Inc. - 100 World Trade Way, New York, NY 10048', 20, bottomY + 28);
}
