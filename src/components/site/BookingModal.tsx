import React, { useState } from 'react';
import { X, Calendar, Users, Clock, CheckCircle2 } from 'lucide-react';
import { ColorTheme, FormSubmission, Language } from '../../types/website';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ColorTheme;
  language: Language;
  onBookingComplete: (submission: Omit<FormSubmission, 'id' | 'timestamp'>) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  theme,
  language,
  onBookingComplete,
}) => {
  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState('2026-10-05');
  const [time, setTime] = useState('07:30 PM');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isBn = language === 'bn';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    onBookingComplete({
      name,
      email: 'reservation@roshuikhana.com',
      phone,
      message: `টেবিল বুকিং: ${guests} জন অতিথি | তারিখ: ${date} | সময়: ${time} | নোট: ${specialRequest || 'নেই'}`,
      type: 'booking',
      details: {
        guests: `${guests} Guests`,
        date,
        time,
        specialRequest: specialRequest || 'None',
      },
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {isBn ? 'টেবিল রিজার্ভেশন' : 'Reserve a Dining Table'}
              </h2>
              <p className="text-xs text-neutral-500">
                {isBn ? 'আপনার বিশেষ ডিনারের আসন নিশ্চিত করুন' : 'Confirm your fine dining experience'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">
                {isBn ? 'রিজার্ভেশন কনফার্ম হয়েছে!' : 'Table Reserved Successfully!'}
              </h3>
              <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                {isBn
                  ? `ধন্যবাদ ${name}! আপনার জন্য ${guests} জনের টেবিল নির্দিষ্ট সময়ে সংরক্ষিত থাকবে।`
                  : `Thank you ${name}! A table for ${guests} guests has been placed on hold.`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Guests Count */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{isBn ? 'অতিথির সংখ্যা' : 'Number of Guests'}</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['1', '2', '4', '6', '8+'].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setGuests(count)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        guests === count
                          ? 'text-white shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                      }`}
                      style={guests === count ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined}
                    >
                      {count} {isBn ? 'জন' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    {isBn ? 'তারিখ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    {isBn ? 'সময়' : 'Time Slot'}
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                  >
                    <option value="01:00 PM">01:00 PM (লাঞ্চ)</option>
                    <option value="02:30 PM">02:30 PM (লাঞ্চ)</option>
                    <option value="07:00 PM">07:00 PM (ডিনার)</option>
                    <option value="08:30 PM">08:30 PM (ডিনার)</option>
                    <option value="09:45 PM">09:45 PM (লেট ডিনার)</option>
                  </select>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    {isBn ? 'আপনার নাম' : 'Guest Name'}
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBn ? 'যেমন: মাহমুদ হক' : 'Full Name'}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1700-000000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {isBn ? 'বিশেষ কোনো অনুরোধ বা আয়োজন' : 'Special Notes / Dietary Requests'}
                </label>
                <input
                  type="text"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder={isBn ? 'যেমন: উইন্ডো সিট বা জন্মদিনের সেলিব্রেশন' : 'e.g. Window table, anniversary'}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-transform active:scale-98"
                  style={{ backgroundColor: theme.primary }}
                >
                  {isBn ? 'রিজার্ভেশন চূড়ান্ত করুন' : 'Confirm Table Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
