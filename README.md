# 🚀 SwiftDeliver - Full-Stack Delivery & Customs Tracking Application

SwiftDeliver is a modern full-stack parcel tracking, customs clearance, and logistics management web application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Vercel Postgres**, **jsPDF**, and **Resend**.

---

## ✨ Features & Capabilities

### 📦 Customer Portal (No Login Required)
- **Live Parcel Tracking**: Enter any valid tracking number (format: `SD` + 6 digits, e.g., `SD849201`).
- **Real-Time Telemetry**: Current status badge, current location, estimated delivery date, package weight & contents description.
- **Visual Progress Stepper**: Interactive progression from Origin to Picked Up, Customs Clearance, In Transit, and Final Delivery.
- **Full Timeline & Event History**: Chronological checkpoints with timestamps and detailed event notes.
- **Financial Breakdown & Official PDF Receipts**:
  - **Shipping Fee Payment Receipt (PDF)** - Official downloadable printable invoice.
  - **Custom Duty Clearance Receipt (PDF)** - Formal tariff clearance certificate with stamp.

### 🔐 Protected Admin Control Panel (`/admin`)
- **Credentials**: `admin` / `admin123`
- **Parcel Registration**: Auto-generates unique `SDxxxxxx` tracking numbers.
- **Data Table**: Filter by status, search by tracking number, sender, or recipient.
- **Status & Fee Management**: Edit location, status, shipping fee amount, custom duty amount, and toggle payment statuses.
- **Automated Email & PDF Dispatch**: Marking Shipping Fee or Custom Duty as **Paid** automatically triggers PDF receipt generation and emails the recipient via Resend!
- **Timeline Manager**: Append custom checkpoint events to any parcel's movement history.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Glassmorphism design system
- **Icons**: Lucide React
- **Database**: Vercel Postgres (`@vercel/postgres` or standard PostgreSQL, with automatic fallback in-memory store)
- **PDF Generation**: `jspdf` & `jspdf-autotable`
- **Email Service**: Resend API (`resend`)

---

## 🚀 Local Development Setup

1. **Navigate to project directory**:
   ```bash
   cd swiftdeliver
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(Note: The app will run out-of-the-box locally with pre-seeded sample parcels `SD849201` and `SD301948` even without configuring Postgres or Resend!)*

4. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Test Demo Parcels**:
   - Track `SD849201` (In Transit / Paid)
   - Track `SD301948` (Customs Clearance Hold)

6. **Test Admin Dashboard**:
   - Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
   - Login with: **`admin`** / **`admin123`**

---

## 🌐 Deploying to Vercel

1. **Push Repository to GitHub / GitLab**.

2. **Import Project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New Project**.
   - Select your repository.

3. **Attach Storage (Vercel Postgres)**:
   - In your Vercel project overview, click **Storage** -> **Create Database** -> **Postgres**.
   - Click **Connect** to automatically link `POSTGRES_URL` to your project environment variables.

4. **Add Environment Variables in Vercel**:
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `admin123`
   - `RESEND_API_KEY`: `re_xxxxxxxxxxxx` (Optional: Get from [resend.com](https://resend.com))
   - `RESEND_FROM_EMAIL`: `SwiftDeliver <notifications@resend.dev>`
   - `NEXT_PUBLIC_APP_URL`: `https://your-app-name.vercel.app`

5. **Deploy**:
   - Click **Deploy**. Vercel will automatically build and publish your Next.js 15 application.
