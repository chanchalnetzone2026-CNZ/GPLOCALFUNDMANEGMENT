import React, { useState } from 'react';
import { BookingRentRecord, OfficeDetails } from '../types';
import { formatDateDDMMYYYY } from '../utils/printUtils';

export interface UpcomingBookingAlertInfo {
  booking: BookingRentRecord;
  diffDays: number; // 0 = today, 1 = tomorrow, 2 = 2 days away, <0 = ongoing
  status: 'TODAY' | 'TOMORROW' | 'IN_2_DAYS' | 'ONGOING';
  statusLabelHindi: string;
  statusLabelEnglish: string;
  badgeClass: string;
}

/**
 * Calculates upcoming bookings within 2 days (2 days before, 1 day before, today, or ongoing)
 */
export function getUpcomingBookingAlerts(
  bookings: BookingRentRecord[],
  referenceDateStr?: string
): UpcomingBookingAlertInfo[] {
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  refDate.setHours(0, 0, 0, 0);
  const todayTimestamp = refDate.getTime();

  const alerts: UpcomingBookingAlertInfo[] = [];

  for (const b of bookings) {
    if (!b.startDate) continue;

    const [sYear, sMonth, sDay] = b.startDate.split('-').map(Number);
    if (!sYear || !sMonth || !sDay) continue;
    const start = new Date(sYear, sMonth - 1, sDay);
    start.setHours(0, 0, 0, 0);

    const [eYear, eMonth, eDay] = (b.endDate || b.startDate).split('-').map(Number);
    const end = new Date(eYear || sYear, (eMonth || sMonth) - 1, eDay || sDay);
    end.setHours(23, 59, 59, 999);

    // If booking end date has passed, ignore
    if (todayTimestamp > end.getTime()) {
      continue;
    }

    const diffMs = start.getTime() - todayTimestamp;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    let status: 'TODAY' | 'TOMORROW' | 'IN_2_DAYS' | 'ONGOING';
    let statusLabelHindi = '';
    let statusLabelEnglish = '';
    let badgeClass = '';

    if (diffDays === 0) {
      status = 'TODAY';
      statusLabelHindi = '🔴 आज बुकिंग दिनांक है (Today)';
      statusLabelEnglish = 'Today is Booking Date';
      badgeClass = 'bg-rose-100 text-rose-900 border-rose-300 ring-1 ring-rose-400';
    } else if (diffDays === 1) {
      status = 'TOMORROW';
      statusLabelHindi = '⚡ कल बुकिंग है (1 दिन शेष / Tomorrow)';
      statusLabelEnglish = 'Tomorrow (1 Day Left)';
      badgeClass = 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400';
    } else if (diffDays === 2) {
      status = 'IN_2_DAYS';
      statusLabelHindi = '🚨 2 दिन पूर्व अलर्ट (2 दिन शेष / 2 Days Left)';
      statusLabelEnglish = 'Advance Alert: 2 Days Left';
      badgeClass = 'bg-indigo-100 text-indigo-900 border-indigo-300 ring-1 ring-indigo-400';
    } else if (todayTimestamp >= start.getTime() && todayTimestamp <= end.getTime()) {
      status = 'ONGOING';
      statusLabelHindi = '🟢 वर्तमान में सक्रिय बुकिंग (Ongoing)';
      statusLabelEnglish = 'Active Ongoing Booking';
      badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400';
    } else {
      // More than 2 days away
      continue;
    }

    alerts.push({
      booking: b,
      diffDays,
      status,
      statusLabelHindi,
      statusLabelEnglish,
      badgeClass,
    });
  }

  // Sort by startDate ascending (soonest first)
  return alerts.sort((a, b) => a.booking.startDate.localeCompare(b.booking.startDate));
}

interface UpcomingBookingAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: UpcomingBookingAlertInfo[];
  onViewBookingPrint?: (booking: BookingRentRecord) => void;
  onNavigateToBookings?: () => void;
  isHindi?: boolean;
}

export const UpcomingBookingAlertModal: React.FC<UpcomingBookingAlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onViewBookingPrint,
  onNavigateToBookings,
  isHindi = true,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  if (!isOpen || alerts.length === 0) {
    return null;
  }

  const activeAlert = alerts[selectedIdx] || alerts[0];
  const booking = activeAlert.booking;
  const fatherName = booking.guardianName || booking.fatherHusbandName || 'लागू नहीं (N/A)';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in print:hidden">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-400 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-700 text-white p-4 sm:p-5 flex items-center justify-between shadow-md relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30 animate-pulse">
              🚨
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-white text-rose-800 text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs">
                  {isHindi ? '2 दिन पूर्व अलर्ट सूचना' : '2-Day Advance Alert'}
                </span>
                <span className="text-[11px] font-bold text-amber-100">
                  {isHindi
                    ? `कुल ${alerts.length} आगामी/सक्रिय बुकिंग`
                    : `${alerts.length} Upcoming / Active Booking(s)`}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight">
                {isHindi ? '📢 आगामी परिसर / भवन बुकिंग अलर्ट' : 'Upcoming Facility / Hall Booking Alert'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold transition-all cursor-pointer border border-white/30"
            title={isHindi ? 'बंद करें' : 'Close'}
          >
            ✕
          </button>
        </div>

        {/* MULTIPLE BOOKINGS TAB SWITCHER (IF > 1) */}
        {alerts.length > 1 && (
          <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-black text-amber-900 shrink-0">
              {isHindi ? 'बुकिंग चयन:' : 'Select Booking:'}
            </span>
            {alerts.map((item, idx) => (
              <button
                key={item.booking.id}
                onClick={() => setSelectedIdx(idx)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  selectedIdx === idx
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100'
                }`}
              >
                #{idx + 1} {item.booking.beneficiaryName} ({formatDateDDMMYYYY(item.booking.startDate)})
              </button>
            ))}
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-grow bg-slate-50/50">
          {/* STATUS ALERT BADGE */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${activeAlert.badgeClass}`}>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">
                {activeAlert.status === 'TODAY' ? '🔴' : activeAlert.status === 'TOMORROW' ? '⚡' : '🚨'}
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">
                  {isHindi ? activeAlert.statusLabelHindi : activeAlert.statusLabelEnglish}
                </p>
                <p className="text-[11px] font-medium opacity-90">
                  {activeAlert.status === 'TODAY'
                    ? isHindi
                      ? 'आज इस परिसर में कार्यक्रम निर्धारित है। व्यवस्था सुनिश्चित करें।'
                      : 'Event is scheduled for today at this facility.'
                    : activeAlert.status === 'TOMORROW'
                    ? isHindi
                      ? 'कल यह परिसर बुक है। पूर्व तैयारी व चाबी/व्यवस्था हेतु अलर्ट।'
                      : 'Facility is booked for tomorrow.'
                    : isHindi
                    ? 'यह बुकिंग 2 दिन बाद निर्धारित है। कृपया समय रहते अग्रिम व्यवस्था रखें।'
                    : 'Booking is scheduled in 2 days.'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2.5 py-1 bg-white/80 rounded-lg text-xs font-black font-mono shadow-2xs border border-current">
                {activeAlert.diffDays === 0
                  ? 'TODAY'
                  : activeAlert.diffDays > 0
                  ? `${activeAlert.diffDays} Days Left`
                  : 'ONGOING'}
              </span>
            </div>
          </div>

          {/* MAIN DETAILS CARD - PROMINENTLY SHOWING BENEFICIARY, FATHER'S NAME & DATES */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
            {/* ROW 1: BENEFICIARY NAME & FATHER'S NAME (BIG & BOLD) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-b border-slate-100 pb-4">
              <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100">
                <span className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-0.5">
                  👤 {isHindi ? 'हितग्राही का नाम (Beneficiary Name)' : 'Beneficiary Name'}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 block">
                  {booking.beneficiaryName}
                </span>
                {booking.samagraId && (
                  <span className="text-[11px] text-indigo-700 font-mono font-semibold block mt-0.5">
                    समग्र ID: {booking.samagraId}
                  </span>
                )}
              </div>

              <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-100">
                <span className="block text-[11px] font-bold text-rose-900 uppercase tracking-wider mb-0.5">
                  👨‍👦 {isHindi ? 'पिता / पति का नाम (Father\'s / Husband\'s Name)' : 'Father\'s / Husband\'s Name'}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 block">
                  {fatherName}
                </span>
                {booking.mobile && (
                  <span className="text-[11px] text-rose-700 font-mono font-semibold block mt-0.5">
                    📱 मो.: {booking.mobile}
                  </span>
                )}
              </div>
            </div>

            {/* ROW 2: BOOKING DATE & TIME */}
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1">
              <span className="block text-[11px] font-black text-emerald-950 uppercase tracking-wider">
                📅 {isHindi ? 'बुकिंग दिनांक एवं अवधि (Booking Date & Duration)' : 'Booking Date & Duration'}
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-base sm:text-lg font-black text-emerald-950 font-sans">
                  {formatDateDDMMYYYY(booking.startDate)}
                  {booking.endDate && booking.endDate !== booking.startDate && (
                    <span> ➔ {formatDateDDMMYYYY(booking.endDate)}</span>
                  )}
                </div>
                {(booking.startTime || booking.endTime) && (
                  <div className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold font-mono shadow-xs">
                    ⏰ {booking.startTime || '09:00'} से {booking.endTime || '21:00'}
                  </div>
                )}
              </div>
            </div>

            {/* ROW 3: FACILITY, PURPOSE & CHARGES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">
                  🏛️ {isHindi ? 'परिसंपत्ति / भवन' : 'Facility'}
                </span>
                <span className="font-black text-slate-900 mt-0.5 block leading-snug">
                  {booking.facilityName}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">
                  🎯 {isHindi ? 'आयोजन प्रयोजन' : 'Purpose'}
                </span>
                <span className="font-black text-slate-900 mt-0.5 block leading-snug">
                  {booking.purpose}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">
                  💵 {isHindi ? 'किराया शुल्क राशि' : 'Rent Charge'}
                </span>
                <span className="font-black text-emerald-800 text-sm font-mono mt-0.5 block">
                  ₹{booking.chargeAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 font-bold block">
                  वाउचर: {booking.voucherNo}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {onViewBookingPrint && (
              <button
                type="button"
                onClick={() => {
                  onViewBookingPrint(booking);
                }}
                className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🖨️</span>
                <span>{isHindi ? 'बुकिंग रसीद देखें / प्रिंट' : 'View / Print Receipt'}</span>
              </button>
            )}

            {onNavigateToBookings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToBookings();
                }}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>📋</span>
                <span>{isHindi ? 'समस्त बुकिंग पंजीयन' : 'View All Bookings'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {isHindi ? '✓ ठीक है (समझ गया)' : 'Acknowledge & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
