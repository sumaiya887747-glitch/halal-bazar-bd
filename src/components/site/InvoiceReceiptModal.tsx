import React, { useState } from 'react';
import { ColorTheme } from '../../types/website';
import { AdminOrder, StoreSettings } from '../../types/admin';
import {
  X,
  MapPin,
  Phone,
  Calendar,
  Printer,
  CheckCircle,
  FileText,
  CreditCard,
  Truck,
  Receipt,
  Download,
} from 'lucide-react';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
  settings: StoreSettings;
  language: 'bn' | 'en';
  theme?: ColorTheme;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  settings,
  language,
  theme,
}) => {
  const [printFormat, setPrintFormat] = useState<'a4' | 'receipt'>('a4');

  if (!isOpen) return null;
  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-5">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
          <p className="text-neutral-500 font-bold">অর্ডার লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const isBn = language === 'bn';
  const storePhone = settings.phone || '+880 1711-889900';
  const storeEmail = settings.email || 'info@halalbazarbd.com';
  const storeAddress = settings.address || 'ঢাকা, বাংলাদেশ';
  const invoiceNumber = order.invoiceNumber || `INV-${String(order.serialNo || 1).padStart(4, '0')}`;

  const paymentMethodLabel = (() => {
    switch (order.paymentMethod) {
      case 'bkash':
        return isBn ? 'বিকাশ (bKash)' : 'bKash';
      case 'nagad':
        return isBn ? 'নগদ (Nagad)' : 'Nagad';
      case 'cod':
      default:
        return isBn ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : 'Cash on Delivery';
    }
  })();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Scoped CSS for Professional Printing */}
      <style>{`
        @media print {
          @page {
            size: ${printFormat === 'receipt' ? '80mm auto' : 'A4 portrait'};
            margin: ${printFormat === 'receipt' ? '4mm' : '10mm 12mm'};
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-wrapper,
          #printable-invoice-wrapper * {
            visibility: visible !important;
          }
          #printable-invoice-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: ${printFormat === 'receipt' ? '80mm' : '100%'} !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-border {
            border: 1px solid #d1d5db !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Main Modal Container */}
      <div
        id="printable-invoice-wrapper"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-neutral-200 transform transition-all animate-in fade-in zoom-in-95 duration-200 print:max-w-none print:shadow-none print:border-none print:rounded-none"
      >
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight flex items-center gap-2">
                <span>{isBn ? 'অর্ডার ইনভয়েস ও রসিদ' : 'Order Invoice & Receipt'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  {invoiceNumber}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                {isBn ? 'সরাসরি প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন' : 'Print directly or save as PDF'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Switcher (A4 vs POS) */}
            <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  printFormat === 'a4'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="A4 স্ট্যান্ডার্ড প্রিন্ট ফরম্যাট"
              >
                A4 মেমো
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('receipt')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  printFormat === 'receipt'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="পিওএস স্লিপ / থার্মাল রসিদ"
              >
                POS স্লিপ
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md hover:shadow-emerald-600/30 transition-all cursor-pointer"
              title={isBn ? 'ইনভয়েস প্রিন্ট করুন' : 'Print Invoice'}
            >
              <Printer className="w-4 h-4" />
              <span>{isBn ? 'প্রিন্ট ইনভয়েস' : 'Print Invoice'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Body */}
        <div
          id="printable-invoice"
          className={`p-6 sm:p-8 space-y-6 text-neutral-800 bg-white print:p-4 print:space-y-4 ${
            printFormat === 'receipt' ? 'max-w-[420px] mx-auto text-xs' : ''
          }`}
        >
          {/* Header: Store Identity & Invoice Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-neutral-800 print:border-b-2 print:border-neutral-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-neutral-200 bg-white flex items-center justify-center shrink-0">
                {settings.logoImage ? (
                  <img
                    src={settings.logoImage}
                    alt={settings.storeName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-amber-400 font-extrabold text-xl"
                    style={{ backgroundColor: theme ? theme.primary : '#064e3b' }}
                  >
                    {settings.logoLetter || 'প'}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight leading-tight">
                  {settings.storeName || 'Halal Bazar BD'}
                </h2>
                <p className="text-xs text-neutral-500 font-medium max-w-sm">
                  {settings.storeTagline || 'শতভাগ খাঁটি প্রিমিয়াম খাদ্যপণ্য ও এক্সক্লুসিভ কালেকশন'}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  <span>{storeAddress}</span> • <span>হটলাইন: {storePhone}</span>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-neutral-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto border sm:border-0 border-neutral-100">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-neutral-900 text-white font-mono text-xs font-black tracking-wider uppercase">
                {isBn ? 'ক্যাশ মেমো / ইনভয়েস' : 'CASH MEMO / INVOICE'}
              </span>
              <p className="text-xs font-mono font-bold text-neutral-800">
                {isBn ? 'ইনভয়েস নং: ' : 'Invoice #: '}
                <span className="text-emerald-700">{invoiceNumber}</span>
              </p>
              <p className="text-[11px] text-neutral-600 flex items-center sm:justify-end gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                <span>{order.createdAt}</span>
              </p>
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>{isBn ? 'অর্ডার গৃহীত হয়েছে' : 'Order Confirmed'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Order Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 text-xs print:bg-white print:border-neutral-300 print-break-inside-avoid">
            <div className="space-y-1">
              <span className="font-bold text-neutral-400 uppercase tracking-wider block text-[10px]">
                {isBn ? 'গ্রাহকের বিবরণ (Customer Info):' : 'Customer Info:'}
              </span>
              <p className="font-bold text-neutral-900 text-sm">{order.customerName}</p>
              <p className="font-mono text-neutral-700 flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{order.customerPhone}</span>
              </p>
              <p className="font-medium text-neutral-700 flex items-start gap-1.5 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{order.customerAddress}</span>
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-neutral-200 sm:pl-4 print:border-l print:border-neutral-300">
              <span className="font-bold text-neutral-400 uppercase tracking-wider block text-[10px]">
                {isBn ? 'অর্ডার ও পেমেন্ট বিবরণ:' : 'Order & Payment Details:'}
              </span>
              <p className="text-neutral-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>{isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment:'}</span>
                <strong className="text-neutral-900 font-bold">{paymentMethodLabel}</strong>
              </p>
              {order.trxId && (
                <p className="text-[11px] font-mono text-neutral-600">
                  <span>TrxID: </span>
                  <span className="font-bold text-neutral-900">{order.trxId}</span>
                </p>
              )}
              <p className="text-neutral-800 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>{isBn ? 'ডেলিভারি এলাকা:' : 'Delivery Area:'}</span>
                <span className="font-semibold text-neutral-900">
                  {order.deliveryArea === 'dhaka'
                    ? isBn
                      ? 'ঢাকার ভিতরে'
                      : 'Inside Dhaka'
                    : isBn
                    ? 'ঢাকার বাইরে'
                    : 'Outside Dhaka'}
                </span>
              </p>
              {order.orderNotes && (
                <p className="text-[11px] text-neutral-600 italic pt-1 border-t border-neutral-200">
                  <span className="font-bold not-italic">{isBn ? 'বিশেষ নোট: ' : 'Note: '}</span>
                  {order.orderNotes}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="space-y-2 print-break-inside-avoid">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              {isBn ? 'অর্ডারের পণ্যসমূহ (Purchased Items):' : 'Purchased Items:'}
            </h4>
            <div className="border border-neutral-300 rounded-2xl overflow-hidden print:rounded-none">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-100 text-neutral-800 font-bold border-b border-neutral-300">
                  <tr>
                    <th className="p-3 w-10 text-center text-neutral-500">#</th>
                    <th className="p-3">{isBn ? 'পণ্যের নাম ও বিবরণ' : 'Item Description'}</th>
                    <th className="p-3 text-center w-16">{isBn ? 'পরিমাণ' : 'Qty'}</th>
                    <th className="p-3 text-right w-24">{isBn ? 'একক মূল্য' : 'Unit Price'}</th>
                    <th className="p-3 text-right w-24">{isBn ? 'মোট টাকা' : 'Line Total'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-800 font-medium bg-white">
                  {order.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="p-3 text-center text-neutral-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-semibold text-neutral-900">
                        <span>{it.productName}</span>
                        {it.weightAmount && (
                          <span className="block text-[11px] text-neutral-500 font-normal">
                            প্যাকেট সাইজ: {it.weightAmount}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-neutral-900">
                        {it.quantity}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-700">
                        ৳{it.price.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-neutral-950">
                        ৳{(it.price * it.quantity).toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Totals & Summary Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2 print-break-inside-avoid">
            {/* Payment & Terms Note */}
            <div className="w-full sm:w-1/2 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-[11px] text-neutral-600 space-y-1.5 print:bg-white print:border-neutral-300">
              <span className="font-bold text-neutral-900 block">
                {isBn ? 'পেমেন্ট ও ডেলিভারি নির্দেশিকা:' : 'Payment & Delivery Notes:'}
              </span>
              <p>
                {order.paymentMethod === 'cod'
                  ? isBn
                    ? '• পণ্য হাতে পেয়ে ডেলিভারিম্যানকে মোট টাকা পরিশোধ করুন।'
                    : '• Please pay the full amount to the delivery rider upon delivery.'
                  : isBn
                  ? '• মোবাইল ব্যাংকিং পেমেন্ট যাচাইকরণের পর ডেলিভারি নিশ্চিত হবে।'
                  : '• Delivery will proceed upon payment verification.'}
              </p>
              <p>
                {isBn
                  ? '• ডেলিভারিম্যানের সামনে পণ্য চেক করে গ্রহণ করুন।'
                  : '• Please verify the products in front of the delivery personnel.'}
              </p>
            </div>

            {/* Calculations Box */}
            <div className="w-full sm:w-1/2 bg-neutral-50 rounded-2xl p-4 border border-neutral-300 space-y-2 text-xs print:bg-white">
              <div className="flex justify-between text-neutral-600">
                <span>{isBn ? 'সাবটোটাল (Subtotal):' : 'Subtotal:'}</span>
                <span className="font-semibold text-neutral-900 font-mono">
                  ৳{order.subtotal.toLocaleString('bn-BD')}
                </span>
              </div>

              {order.discountAmount !== undefined && order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{isBn ? 'কুপন মূল্যছাড় (Discount):' : 'Discount:'}</span>
                  <span className="font-mono">
                    -৳{order.discountAmount.toLocaleString('bn-BD')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>{isBn ? 'ডেলিভারি চার্জ (Delivery Fee):' : 'Delivery Fee:'}</span>
                <span className="font-semibold text-neutral-900 font-mono">
                  ৳{order.deliveryFee.toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="pt-2.5 border-t-2 border-neutral-800 flex justify-between items-center text-sm font-black text-neutral-900">
                <span>{isBn ? 'সর্বমোট প্রদেয় মূল্য (Total):' : 'Grand Total:'}</span>
                <span className="text-emerald-800 text-lg font-extrabold font-mono">
                  ৳{order.total.toLocaleString('bn-BD')}
                </span>
              </div>

              {order.advancePaid !== undefined && order.advancePaid > 0 && (
                <div className="flex justify-between text-xs text-neutral-600 pt-1 border-t border-neutral-200">
                  <span>{isBn ? 'অগ্রিম পরিশোধ:' : 'Advance Paid:'}</span>
                  <span className="font-semibold font-mono text-emerald-700">
                    ৳{order.advancePaid.toLocaleString('bn-BD')}
                  </span>
                </div>
              )}

              <div className="bg-emerald-50 text-emerald-900 rounded-xl p-2 text-center text-xs font-bold border border-emerald-200 print:bg-white print:border-neutral-300">
                {order.paymentMethod === 'cod' ? (
                  <span>
                    {isBn
                      ? `ডেলিভারির সময় প্রদেয়: ৳${(order.dueAmount ?? order.total).toLocaleString('bn-BD')}`
                      : `Payable at Delivery: ৳${(order.dueAmount ?? order.total).toLocaleString('bn-BD')}`}
                  </span>
                ) : (
                  <span>
                    {isBn ? 'পেমেন্ট স্ট্যাটাস: প্রসেসিং' : 'Payment Status: Processing'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Signatures for Official Receipt in Print */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs print-break-inside-avoid">
            <div>
              <div className="w-36 mx-auto border-t border-dashed border-neutral-400 pt-1" />
              <p className="text-neutral-500 font-medium">
                {isBn ? 'গ্রাহকের স্বাক্ষর' : 'Customer Signature'}
              </p>
            </div>
            <div>
              <div className="w-36 mx-auto border-t border-dashed border-neutral-400 pt-1" />
              <p className="text-neutral-500 font-medium">
                {isBn ? 'অনুমোদিত স্বাক্ষর' : 'Authorized Signature'}
              </p>
            </div>
          </div>

          {/* Footer & Store Contact */}
          <div className="text-center pt-3 border-t border-dashed border-neutral-300 space-y-1 print-break-inside-avoid">
            <p className="text-xs font-bold text-neutral-900">
              {isBn
                ? `${settings.storeName || 'খাঁটি মসলাঘর'} থেকে কেনাকাটা করার জন্য আপনাকে ধন্যবাদ!`
                : `Thank you for shopping with ${settings.storeName || 'Halal Bazar BD'}!`}
            </p>
            <p className="text-[11px] text-neutral-500">
              যেকোনো সহায়তায় বা তথ্যের জন্য কল করুন:{' '}
              <strong className="text-neutral-900 font-mono">{storePhone}</strong>
              {settings.email ? ` | ইমেইল: ${settings.email}` : ''}
            </p>
          </div>
        </div>

        {/* Modal Bottom Action Bar (Hidden in Print) */}
        <div className="no-print bg-neutral-50 px-4 sm:px-6 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>
              {isBn
                ? 'ব্রাউজার প্রিন্ট ডায়ালগ থেকে সরাসরি প্রিন্ট বা "Save as PDF" করুন'
                : 'Print directly or choose "Save as PDF" in the browser dialog'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isBn ? 'প্রিন্ট ইনভয়েস (Print)' : 'Print Invoice'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-neutral-200 hover:bg-neutral-300 active:scale-95 text-neutral-700 font-bold text-xs transition-colors cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
