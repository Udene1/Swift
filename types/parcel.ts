export type ParcelStatus = 
  | 'Pending'
  | 'Picked Up'
  | 'In Transit'
  | 'Customs Clearance'
  | 'Out for Delivery'
  | 'Delivered'
  | 'On Hold';

export type PaymentStatus = 'Paid' | 'Unpaid';

export interface TimelineEvent {
  id: string;
  status: ParcelStatus;
  location: string;
  description: string;
  timestamp: string;
}

export interface Parcel {
  id: string;
  trackingNumber: string; // Format: SD + 6 digits (e.g. SD492018)
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  recipientName: string;
  recipientEmail: string;
  recipientAddress: string;
  origin: string;
  destination: string;
  currentLocation: string;
  status: ParcelStatus;
  estimatedDelivery: string;
  weightKg: number;
  description: string;
  
  // Financial & Fee details
  shippingFee: number;
  shippingPaymentStatus: PaymentStatus;
  shippingPaidAt?: string;

  customDuty: number;
  customDutyPaymentStatus: PaymentStatus;
  customDutyPaidAt?: string;

  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateParcelInput {
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  recipientName: string;
  recipientEmail: string;
  recipientAddress: string;
  origin: string;
  destination: string;
  currentLocation: string;
  estimatedDelivery: string;
  weightKg: number;
  description: string;
  shippingFee: number;
  customDuty: number;
}
