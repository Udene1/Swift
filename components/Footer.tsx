import Link from 'next/link';
import { Truck, ShieldCheck, Globe, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Swift<span className="text-blue-500">Deliver</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Global express logistics, customs clearance, and real-time parcel tracking network. Serving over 180+ international destinations.
            </p>
          </div>

          {/* Col 2: Fast Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Services & Tracking</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-blue-400">Parcel Tracking</Link></li>
              <li><Link href="/" className="hover:text-blue-400">Express Air Freight</Link></li>
              <li><Link href="/" className="hover:text-blue-400">Customs Tariff Clearance</Link></li>
              <li><Link href="/admin/login" className="hover:text-blue-400">Staff Portal</Link></li>
            </ul>
          </div>

          {/* Col 3: Compliance & Receipts */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Official Clearance</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified PDF Receipts</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Customs Tariff Assessment</span>
              </li>
              <li><span>Standard Express Air Freight</span></li>
              <li><span>Duty Exemption Verification</span></li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Global Headquarters</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>100 World Trade Way, New York, NY</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>support@swiftdeliver-global.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+1 (800) 555-SWIFT</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} SwiftDeliver Global Logistics. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-blue-400">Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
