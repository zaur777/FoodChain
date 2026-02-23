
import React, { useState } from 'react';
import { HACCPPlan, Language } from '../types';
import { translations } from '../translations';
import { ICONS } from '../constants';

interface CalendarViewProps {
  plan: HACCPPlan;
  lang: Language;
}

const CalendarView: React.FC<CalendarViewProps> = ({ plan, lang }) => {
  const t = translations[lang];
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    az: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {monthNames[lang][month]} {year}
            </h3>
            <p className="text-sm text-slate-500 font-medium">Process Cycle & Verification Schedule</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="bg-slate-50 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
          {days.map((day, idx) => (
            <div key={idx} className={`bg-white min-h-[120px] p-3 transition-colors hover:bg-slate-50/50 ${!day ? 'bg-slate-50/30' : ''}`}>
              {day && (
                <>
                  <span className="text-sm font-black text-slate-400">{day}</span>
                  <div className="mt-2 space-y-1">
                    {day % 7 === 0 && (
                      <div className="text-[9px] bg-indigo-100 text-indigo-700 p-1.5 rounded-md font-bold border border-indigo-200">
                        Weekly Audit
                      </div>
                    )}
                    {day === 15 && (
                      <div className="text-[9px] bg-emerald-100 text-emerald-700 p-1.5 rounded-md font-bold border border-emerald-200">
                        Equipment Calibration
                      </div>
                    )}
                    {day % 10 === 0 && (
                      <div className="text-[9px] bg-amber-100 text-amber-700 p-1.5 rounded-md font-bold border border-amber-200">
                        Staff Training
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Upcoming Tasks</h4>
          <div className="space-y-4">
            <TaskItem title="Internal Audit" date="Oct 24, 2025" status="Pending" />
            <TaskItem title="Supplier Review" date="Oct 28, 2025" status="Scheduled" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recent Logs</h4>
          <div className="space-y-4">
            <TaskItem title="Temp Check CCP1" date="Today, 09:00" status="Completed" />
            <TaskItem title="Cleaning Log" date="Today, 06:00" status="Completed" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">System Health</h4>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center">
              <span className="text-lg font-black text-indigo-600">92%</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">On Track</p>
              <p className="text-xs text-slate-400">All cycles verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskItem = ({ title, date, status }: { title: string; date: string; status: string }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
    <div>
      <p className="text-xs font-bold text-slate-800">{title}</p>
      <p className="text-[10px] text-slate-400">{date}</p>
    </div>
    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
      status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
    }`}>
      {status}
    </span>
  </div>
);

export default CalendarView;
