import { sql } from '@vercel/postgres';
import { Parcel, CreateParcelInput, TimelineEvent } from '@/types/parcel';

// Seed parcels for initial state / local demo mode
const sampleParcels: Parcel[] = [
  {
    id: 'p-1',
    trackingNumber: 'SD849201',
    senderName: 'Apex Electronics Trading Co.',
    senderEmail: 'shipping@apexelectronics.com',
    senderAddress: '742 Industrial Parkway, Building 4, Frankfurt, Germany',
    recipientName: 'David H. Sterling',
    recipientEmail: 'david.sterling@example.com',
    recipientAddress: '1048 Ocean Avenue, Suite 3B, San Francisco, CA 94112, USA',
    origin: 'Frankfurt, Germany',
    destination: 'San Francisco, CA, USA',
    currentLocation: 'San Francisco Hub - Sorting Facility',
    status: 'In Transit',
    estimatedDelivery: '2026-07-26',
    weightKg: 4.85,
    description: 'High-precision Audio Equipment & Circuit Assemblies',
    shippingFee: 145.50,
    shippingPaymentStatus: 'Paid',
    shippingPaidAt: '2026-07-21T09:14:00Z',
    customDuty: 62.20,
    customDutyPaymentStatus: 'Paid',
    customDutyPaidAt: '2026-07-23T14:30:00Z',
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-23T14:30:00Z',
    timeline: [
      {
        id: 't-1',
        status: 'Pending',
        location: 'Frankfurt Hub',
        description: 'Shipment label created and dispatch order received.',
        timestamp: '2026-07-20T10:30:00Z'
      },
      {
        id: 't-2',
        status: 'Picked Up',
        location: 'Frankfurt Logistics Center',
        description: 'Package picked up by SwiftDeliver courier line.',
        timestamp: '2026-07-20T16:45:00Z'
      },
      {
        id: 't-3',
        status: 'Customs Clearance',
        location: 'US International Port of Entry, NY',
        description: 'Customs clearance completed successfully. Duty payment verified.',
        timestamp: '2026-07-22T11:20:00Z'
      },
      {
        id: 't-4',
        status: 'In Transit',
        location: 'San Francisco Hub - Sorting Facility',
        description: 'Arrived at destination sorting facility. Processing for final delivery route.',
        timestamp: '2026-07-23T14:30:00Z'
      }
    ]
  },
  {
    id: 'p-2',
    trackingNumber: 'SD301948',
    senderName: 'Nordic Craft Design AB',
    senderEmail: 'logistics@nordiccraft.se',
    senderAddress: 'Storgatan 45, Stockholm, Sweden',
    recipientName: 'Elena Rostova',
    recipientEmail: 'elena.rostova@example.com',
    recipientAddress: '240 Park Avenue South, New York, NY 10003, USA',
    origin: 'Stockholm, Sweden',
    destination: 'New York, NY, USA',
    currentLocation: 'JFK Customs Inspection Depot',
    status: 'Customs Clearance',
    estimatedDelivery: '2026-07-28',
    weightKg: 2.30,
    description: 'Handcrafted Designer Ceramic Vases & Glassware',
    shippingFee: 98.00,
    shippingPaymentStatus: 'Paid',
    shippingPaidAt: '2026-07-21T16:00:00Z',
    customDuty: 45.00,
    customDutyPaymentStatus: 'Unpaid',
    createdAt: '2026-07-21T08:00:00Z',
    updatedAt: '2026-07-23T11:00:00Z',
    timeline: [
      {
        id: 't-201',
        status: 'Pending',
        location: 'Stockholm Hub',
        description: 'Parcel registered in SwiftDeliver Global Network.',
        timestamp: '2026-07-21T08:00:00Z'
      },
      {
        id: 't-202',
        status: 'Picked Up',
        location: 'Stockholm Air Cargo Center',
        description: 'Dispatched on international flight SD-809.',
        timestamp: '2026-07-21T18:30:00Z'
      },
      {
        id: 't-203',
        status: 'Customs Clearance',
        location: 'JFK Customs Inspection Depot',
        description: 'Awaiting Custom Duty payment processing before release.',
        timestamp: '2026-07-23T11:00:00Z'
      }
    ]
  }
];

// Helper to check if Postgres env is provided
function isPostgresConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

let memoryParcelsStore: Parcel[] = [...sampleParcels];

// Initialize DB schema on Postgres if available
let tablesInitialized = false;
async function initDbTables() {
  if (!isPostgresConfigured() || tablesInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS parcels (
        id VARCHAR(255) PRIMARY KEY,
        tracking_number VARCHAR(50) UNIQUE NOT NULL,
        sender_name TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        sender_address TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        recipient_email TEXT NOT NULL,
        recipient_address TEXT NOT NULL,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        current_location TEXT NOT NULL,
        status VARCHAR(50) NOT NULL,
        estimated_delivery VARCHAR(50) NOT NULL,
        weight_kg NUMERIC NOT NULL,
        description TEXT NOT NULL,
        shipping_fee NUMERIC NOT NULL,
        shipping_payment_status VARCHAR(20) NOT NULL,
        shipping_paid_at TEXT,
        custom_duty NUMERIC NOT NULL,
        custom_duty_payment_status VARCHAR(20) NOT NULL,
        custom_duty_paid_at TEXT,
        timeline JSONB NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;
    tablesInitialized = true;
  } catch (err) {
    console.warn('Postgres connection failed, using memory store:', err);
  }
}

// Generate random tracking number SD + 6 digits
export function generateTrackingNumber(): string {
  let num: string;
  do {
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    num = `SD${randomDigits}`;
  } while (memoryParcelsStore.some(p => p.trackingNumber === num));
  return num;
}

export async function getAllParcels(): Promise<Parcel[]> {
  if (isPostgresConfigured()) {
    try {
      await initDbTables();
      const { rows } = await sql`SELECT * FROM parcels ORDER BY created_at DESC;`;
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          trackingNumber: r.tracking_number,
          senderName: r.sender_name,
          senderEmail: r.sender_email,
          senderAddress: r.sender_address,
          recipientName: r.recipient_name,
          recipientEmail: r.recipient_email,
          recipientAddress: r.recipient_address,
          origin: r.origin,
          destination: r.destination,
          currentLocation: r.current_location,
          status: r.status,
          estimatedDelivery: r.estimated_delivery,
          weightKg: Number(r.weight_kg),
          description: r.description,
          shippingFee: Number(r.shipping_fee),
          shippingPaymentStatus: r.shipping_payment_status,
          shippingPaidAt: r.shipping_paid_at || undefined,
          customDuty: Number(r.custom_duty),
          customDutyPaymentStatus: r.custom_duty_payment_status,
          customDutyPaidAt: r.custom_duty_paid_at || undefined,
          timeline: typeof r.timeline === 'string' ? JSON.parse(r.timeline) : r.timeline,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }
    } catch (e) {
      console.warn('Fallback to memory parcels store:', e);
    }
  }
  return memoryParcelsStore;
}

export async function getParcelByTracking(trackingNumber: string): Promise<Parcel | null> {
  const normalized = trackingNumber.trim().toUpperCase();
  if (isPostgresConfigured()) {
    try {
      await initDbTables();
      const { rows } = await sql`SELECT * FROM parcels WHERE tracking_number = ${normalized} LIMIT 1;`;
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          trackingNumber: r.tracking_number,
          senderName: r.sender_name,
          senderEmail: r.sender_email,
          senderAddress: r.sender_address,
          recipientName: r.recipient_name,
          recipientEmail: r.recipient_email,
          recipientAddress: r.recipient_address,
          origin: r.origin,
          destination: r.destination,
          currentLocation: r.current_location,
          status: r.status,
          estimatedDelivery: r.estimated_delivery,
          weightKg: Number(r.weight_kg),
          description: r.description,
          shippingFee: Number(r.shipping_fee),
          shippingPaymentStatus: r.shipping_payment_status,
          shippingPaidAt: r.shipping_paid_at || undefined,
          customDuty: Number(r.custom_duty),
          customDutyPaymentStatus: r.custom_duty_payment_status,
          customDutyPaidAt: r.custom_duty_paid_at || undefined,
          timeline: typeof r.timeline === 'string' ? JSON.parse(r.timeline) : r.timeline,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      }
    } catch (e) {
      console.warn('Fallback to memory lookup:', e);
    }
  }
  return memoryParcelsStore.find(p => p.trackingNumber.toUpperCase() === normalized) || null;
}

export async function createParcel(input: CreateParcelInput): Promise<Parcel> {
  const id = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const trackingNumber = generateTrackingNumber();
  const now = new Date().toISOString();

  const initialTimeline: TimelineEvent = {
    id: `t-${Date.now()}`,
    status: 'Pending',
    location: input.origin,
    description: 'Parcel registered in SwiftDeliver system. Shipping label generated.',
    timestamp: now,
  };

  const newParcel: Parcel = {
    id,
    trackingNumber,
    senderName: input.senderName,
    senderEmail: input.senderEmail,
    senderAddress: input.senderAddress,
    recipientName: input.recipientName,
    recipientEmail: input.recipientEmail,
    recipientAddress: input.recipientAddress,
    origin: input.origin,
    destination: input.destination,
    currentLocation: input.currentLocation || input.origin,
    status: 'Pending',
    estimatedDelivery: input.estimatedDelivery,
    weightKg: input.weightKg,
    description: input.description,
    shippingFee: input.shippingFee,
    shippingPaymentStatus: 'Unpaid',
    customDuty: input.customDuty,
    customDutyPaymentStatus: 'Unpaid',
    timeline: [initialTimeline],
    createdAt: now,
    updatedAt: now,
  };

  if (isPostgresConfigured()) {
    try {
      await initDbTables();
      await sql`
        INSERT INTO parcels (
          id, tracking_number, sender_name, sender_email, sender_address,
          recipient_name, recipient_email, recipient_address, origin, destination,
          current_location, status, estimated_delivery, weight_kg, description,
          shipping_fee, shipping_payment_status, custom_duty, custom_duty_payment_status,
          timeline, created_at, updated_at
        ) VALUES (
          ${newParcel.id}, ${newParcel.trackingNumber}, ${newParcel.senderName}, ${newParcel.senderEmail}, ${newParcel.senderAddress},
          ${newParcel.recipientName}, ${newParcel.recipientEmail}, ${newParcel.recipientAddress}, ${newParcel.origin}, ${newParcel.destination},
          ${newParcel.currentLocation}, ${newParcel.status}, ${newParcel.estimatedDelivery}, ${newParcel.weightKg}, ${newParcel.description},
          ${newParcel.shippingFee}, ${newParcel.shippingPaymentStatus}, ${newParcel.customDuty}, ${newParcel.customDutyPaymentStatus},
          ${JSON.stringify(newParcel.timeline)}, ${newParcel.createdAt}, ${newParcel.updatedAt}
        );
      `;
    } catch (e) {
      console.warn('Failed to insert in Postgres, saved in memory:', e);
    }
  }

  memoryParcelsStore.unshift(newParcel);
  return newParcel;
}

export async function updateParcel(
  trackingNumber: string,
  updates: Partial<Parcel>
): Promise<Parcel | null> {
  const existing = await getParcelByTracking(trackingNumber);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Parcel = {
    ...existing,
    ...updates,
    updatedAt: now,
  };

  if (updates.shippingPaymentStatus === 'Paid' && existing.shippingPaymentStatus !== 'Paid') {
    updated.shippingPaidAt = now;
  }
  if (updates.customDutyPaymentStatus === 'Paid' && existing.customDutyPaymentStatus !== 'Paid') {
    updated.customDutyPaidAt = now;
  }

  if (isPostgresConfigured()) {
    try {
      await initDbTables();
      await sql`
        UPDATE parcels SET
          current_location = ${updated.currentLocation},
          status = ${updated.status},
          shipping_fee = ${updated.shippingFee},
          shipping_payment_status = ${updated.shippingPaymentStatus},
          shipping_paid_at = ${updated.shippingPaidAt || null},
          custom_duty = ${updated.customDuty},
          custom_duty_payment_status = ${updated.customDutyPaymentStatus},
          custom_duty_paid_at = ${updated.customDutyPaidAt || null},
          timeline = ${JSON.stringify(updated.timeline)},
          updated_at = ${updated.updatedAt}
        WHERE tracking_number = ${existing.trackingNumber};
      `;
    } catch (e) {
      console.warn('Failed to update Postgres, updating memory:', e);
    }
  }

  const idx = memoryParcelsStore.findIndex(p => p.trackingNumber === existing.trackingNumber);
  if (idx !== -1) {
    memoryParcelsStore[idx] = updated;
  }

  return updated;
}

export async function addTimelineEvent(
  trackingNumber: string,
  event: Omit<TimelineEvent, 'id' | 'timestamp'>
): Promise<Parcel | null> {
  const existing = await getParcelByTracking(trackingNumber);
  if (!existing) return null;

  const newEvent: TimelineEvent = {
    id: `t-${Date.now()}`,
    ...event,
    timestamp: new Date().toISOString(),
  };

  const updatedTimeline = [...existing.timeline, newEvent];
  return updateParcel(trackingNumber, {
    status: event.status,
    currentLocation: event.location,
    timeline: updatedTimeline,
  });
}
