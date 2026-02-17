/**
 * App Name: MDM सहायक
 * App Version: 1.1.5 (History Dual-Ad Revenue Optimized)
 * Last Optimized for: Android APK/AAB (Webview)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Settings, 
  CalendarCheck, 
  PackageSearch, 
  IndianRupee, 
  History as HistoryIcon, 
  FileText, 
  ChevronLeft,
  PlusCircle,
  AlertTriangle,
  Edit2,
  CheckCircle2,
  RotateCcw,
  Filter,
  XCircle,
  UserCheck,
  ClipboardList,
  Hammer,
  Trash2,
  WalletCards,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Printer,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { 
  Page, 
  MasterData, 
  DailyEntry, 
  StockReceipt, 
  BudgetReceipt, 
  SchoolLevel,
  CookHelperStats,
  MonthlyExpenseRecord
} from './types';
import { INITIAL_MASTER_DATA } from './constants';

// --- विज्ञापन प्लेसहोल्डर कंपोनेंट (Ad Sample) ---
const AdBanner = ({ label = "प्रायोजित", type = "inline" }: { label?: string, type?: "inline" | "top" }) => (
  <div className={`w-full bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm no-print overflow-hidden ${type === 'top' ? 'mb-4 border-blue-100' : 'my-4'} min-h-[80px]`}>
    <div className="flex justify-between w-full mb-2">
      <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">{label}</div>
      <div className="text-[8px] font-bold text-blue-400 bg-blue-50 px-1.5 rounded">AD</div>
    </div>
    <div className="flex items-center gap-3 text-slate-400">
      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
        <ExternalLink size={18} className="text-blue-500 opacity-50" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-black text-slate-500 uppercase leading-none mb-1">Google Ad Placeholder</span>
        <span className="text-[9px] text-slate-400 font-medium italic leading-tight">विज्ञापन से ऐप फ्री रहता है</span>
      </div>
    </div>
  </div>
);

// --- सहायक कार्य (Helper Functions) ---
const formatNum = (num: number) => {
  if (isNaN(num) || num === null) return 0;
  return parseFloat(Number(num).toFixed(5));
};

const getTodayStr = () => new Date().toISOString().split('T')[0];

const GOVERNMENT_MENU: Record<number, string> = {
  1: "रोटी — सब्जी",
  2: "चावल एवं दाल अथवा सब्जी",
  3: "रोटी — दाल",
  4: "खिचड़ी (दाल, चावल, सब्जी आदि युक्त)",
  5: "रोटी — दाल",
  6: "रोटी — सब्जी",
  0: "रविवार - अवकाश"
};

const getAutoMenu = (dateStr: string) => {
  const day = new Date(dateStr).getDay();
  return GOVERNMENT_MENU[day] || "";
};

const MONTH_NAMES = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवंबर", "दिसंबर"];

const YEARS_RANGE = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];

const TX_TYPE_MAP: Record<string, string> = {
  'SUPPLIER': '(+) सप्लायर',
  'BORROW_IN': '(+) उधार लिया',
  'LEND_OUT': '(-) उधार दिया',
  'REPAY_OUT': '(-) उधार चुकाया',
  'RETURN_IN': '(+) उधार वापस लिया',
  'INTERNAL_TRANSFER': 'आंतरिक आदान-प्रदान'
};

const ComparisonRow = ({ icon, label, val15, val68, unit, isPrimary }: { icon: string, label: string, val15: any, val68: any, unit: string, isPrimary: boolean }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-[#000000] font-black text-[11px] uppercase tracking-tighter">
      <span>{icon}</span> {label}
    </div>
    <div className="bg-white border-2 border-slate-100 p-2 rounded-lg text-[#000000] font-black text-[12px] flex flex-col gap-0.5 shadow-sm">
      <div className="flex justify-between">
        <span className="text-slate-500 text-[10px]">1-5:</span>
        <span>{val15} {unit}</span>
      </div>
      {!isPrimary && (
        <div className="flex justify-between border-t border-slate-50 mt-0.5 pt-0.5">
          <span className="text-slate-500 text-[10px]">6-8:</span>
          <span>{val68} {unit}</span>
        </div>
      )}
    </div>
  </div>
);

const TotalRow = ({ icon, label, val }: { icon: string, label: string, val: any }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-[#000000] font-black text-[11px] uppercase tracking-tighter">
      <span>{icon}</span> {label}
    </div>
    <div className="bg-slate-50 border-2 border-slate-200 p-2 rounded-lg text-[#000000] font-black text-[14px] text-right shadow-sm">
      ₹{val}
    </div>
  </div>
);

const Dashboard = ({ stats, isPrimary, setPage }: { stats: any, isPrimary: boolean, setPage: (p: Page) => void }) => (
  <div className="p-3 space-y-4 max-w-2xl mx-auto pb-48 animate-in fade-in duration-500">
    <AdBanner label="प्रीमियम पार्टनर" type="top" />

    <div className="bg-white rounded-[2rem] border-2 border-slate-900 shadow-2xl overflow-hidden">
      <div className="bg-slate-100 p-4 border-b-2 border-slate-900 text-center">
        <h2 className="text-sm font-black text-[#000000] uppercase tracking-widest">वर्तमान स्टॉक एवं बजट स्थिति</h2>
      </div>
      <div className="grid grid-cols-2 divide-x-2 divide-slate-900">
        <div className="flex flex-col">
          <h3 className="bg-slate-900 text-white p-2.5 text-center text-[10px] font-black uppercase tracking-widest">MDM योजना (Cat 1)</h3>
          <div className="p-3 space-y-4 flex-1">
            <ComparisonRow icon="🌾" label="गेहूँ स्टॉक (Kg)" val15={stats.wheat15} val68={stats.wheat68} unit="kg" isPrimary={isPrimary} />
            <ComparisonRow icon="🍚" label="चावल स्टॉक (Kg)" val15={stats.rice15} val68={stats.rice68} unit="kg" isPrimary={isPrimary} />
            <ComparisonRow icon="💸" label="कुल कन्वर्जन राशि (₹)" val15={stats.conv15} val68={stats.conv68} unit="₹" isPrimary={isPrimary} />
            <TotalRow icon="👨‍🍳" label="कुक कम हेल्पर राशि (₹)" val={stats.cookHelper} />
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="bg-blue-600 text-white p-2.5 text-center text-[10px] font-black uppercase tracking-widest">बाल गोपाल (Cat 2)</h3>
          <div className="p-3 space-y-4 flex-1">
            <ComparisonRow icon="🥛" label="दूध पाउडर स्टॉक (Kg)" val15={stats.milk15} val68={stats.milk68} unit="kg" isPrimary={isPrimary} />
            <ComparisonRow icon="💰" label="चीनी राशि (₹)" val15={stats.sugar15} val68={stats.sugar68} unit="₹" isPrimary={isPrimary} />
            <TotalRow icon="🔥" label="दूध सिलेंडर राशि (₹)" val={stats.milkCylinder} />
            <TotalRow icon="🤝" label="दूध हेल्पर राशि (₹)" val={stats.milkHelper} />
          </div>
        </div>
      </div>
    </div>

    <AdBanner label="अनुशंसित सेवा" />
    
    <div className="grid grid-cols-2 gap-3">
      <button onClick={() => setPage('DAILY')} className="bg-blue-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-all">
        <CalendarCheck /><span className="text-[11px] font-black uppercase tracking-wider">दैनिक एंट्री</span>
      </button>
      <button onClick={() => setPage('STOCK')} className="bg-emerald-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-all">
        <PackageSearch /><span className="text-[11px] font-black uppercase tracking-wider">स्टॉक प्राप्ति</span>
      </button>
      <button onClick={() => setPage('BUDGET')} className="bg-rose-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-all">
        <IndianRupee /><span className="text-[11px] font-black uppercase tracking-wider">बजट</span>
      </button>
      <button onClick={() => setPage('MONTHLY_EXPENSE')} className="bg-amber-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-all">
        <WalletCards /><span className="text-[11px] font-black uppercase tracking-wider">मासिक खर्च</span>
      </button>
      <button onClick={() => setPage('BACKUP')} className="bg-cyan-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-all">
        <ShieldCheck /><span className="text-[11px] font-black uppercase tracking-wider">बैकअप और रिस्टोर</span>
      </button>
      <button onClick={() => setPage('HISTORY_MENU')} className="bg-slate-700 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-all">
        <HistoryIcon /><span className="text-[11px] font-black uppercase tracking-wider">इतिहास</span>
      </button>
      <button onClick={() => setPage('REPORT')} className="bg-purple-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-all">
        <FileText /><span className="text-[11px] font-black uppercase tracking-wider">मासिक रिपोर्ट</span>
      </button>
      <button onClick={() => setPage('MASTER')} className="bg-slate-400 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-all">
        <Settings /><span className="text-[11px] font-black uppercase tracking-wider">मास्टर सेट-अप</span>
      </button>
    </div>
  </div>
);

// --- इतिहास मेनू कंपोनेंट ---
const HistoryMenuView = ({ setPage }: { setPage: (p: Page) => void }) => {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8 pb-32 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 border-b-4 border-slate-900 pb-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-slate-900 shadow-inner">
          <HistoryIcon size={32} className="text-slate-900" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">मास्टर इतिहास मेनू</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">कृपया उस विभाग का चयन करें जिसका इतिहास आप देखना चाहते हैं</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => setPage('HISTORY')} className="bg-white border-4 border-slate-900 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-[8px_8px_0px_rgba(30,58,138,1)] hover:bg-blue-50 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all relative overflow-hidden">
          <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><CalendarCheck size={36}/></div>
          <div className="text-center">
            <span className="block text-lg font-black text-slate-900 uppercase tracking-tight">दैनिक प्रविष्टि इतिहास</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase italic">Daily Attendance History</span>
          </div>
          <ArrowUpRight className="absolute top-4 right-4 text-slate-300" size={24}/>
        </button>
        <button onClick={() => setPage('STOCK_HISTORY')} className="bg-white border-4 border-slate-900 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-[8px_8px_0px_rgba(6,78,59,1)] hover:bg-emerald-50 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all relative overflow-hidden">
          <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600"><PackageSearch size={36}/></div>
          <div className="text-center">
            <span className="block text-lg font-black text-slate-900 uppercase tracking-tight">स्टॉक प्राप्ति इतिहास</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase italic">Stock Ledger Logs</span>
          </div>
          <ArrowUpRight className="absolute top-4 right-4 text-slate-300" size={24}/>
        </button>
        <button onClick={() => setPage('BUDGET_HISTORY')} className="bg-white border-4 border-slate-900 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-[8px_8px_0px_rgba(159,18,57,1)] hover:bg-rose-50 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all relative overflow-hidden">
          <div className="bg-rose-100 p-4 rounded-2xl text-rose-600"><IndianRupee size={36}/></div>
          <div className="text-center">
            <span className="block text-lg font-black text-slate-900 uppercase tracking-tight">बजट प्राप्ति इतिहास</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase italic">Budget Receipt Logs</span>
          </div>
          <ArrowUpRight className="absolute top-4 right-4 text-slate-300" size={24}/>
        </button>
        <button onClick={() => setPage('EXPENSE_HISTORY')} className="bg-white border-4 border-slate-900 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-[8px_8px_0px_rgba(146,64,14,1)] hover:bg-amber-50 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all relative overflow-hidden">
          <div className="bg-amber-100 p-4 rounded-2xl text-amber-600"><WalletCards size={36}/></div>
          <div className="text-center">
            <span className="block text-lg font-black text-slate-900 uppercase tracking-tight">मासिक खर्च इतिहास</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase italic">Monthly Expense History</span>
          </div>
          <ArrowUpRight className="absolute top-4 right-4 text-slate-300" size={24}/>
        </button>
      </div>
      <button onClick={() => setPage('DASHBOARD')} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest border-2 border-slate-700 shadow-xl active:scale-95 transition-transform mt-8">वापस डैशबोर्ड पर जाएँ</button>
    </div>
  );
};

// --- दैनिक प्रविष्टि (Daily Entry) कंपोनेंट ---
const DailyEntryFormView = ({ 
  masterData, 
  dailyEntries, 
  setDailyEntries, 
  editingId, 
  setEditingId, 
  setPage,
  onBack,
  initialView = 'FORM'
}: { 
  masterData: MasterData, 
  dailyEntries: DailyEntry[], 
  setDailyEntries: any, 
  editingId: string | null, 
  setEditingId: (id: string | null) => void,
  setPage: (p: Page) => void,
  onBack: () => void,
  initialView?: 'FORM' | 'HISTORY'
}) => {
  const isPrimary = masterData.level === SchoolLevel.PRIMARY;
  const [status, setStatus] = useState<'PENDING' | 'MEAL' | 'HOLIDAY'>('PENDING');
  const [date, setDate] = useState(getTodayStr());
  const [att15, setAtt15] = useState<number | string>(0);
  const [att68, setAtt68] = useState<number | string>(0);
  const [menu, setMenu] = useState('');
  const [milkDist, setMilkDist] = useState(false);
  const [showEnrollAlert, setShowEnrollAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const handleFocus = (val: any, setter: any) => { if (Number(val) === 0) setter(""); };
  const handleBlur = (val: any, setter: any) => { if (val === "" || val === undefined) setter(0); };

  useEffect(() => {
    const entryToLoad = editingId ? dailyEntries.find(e => e.id === editingId) : dailyEntries.find(e => e.date === date);
    if (entryToLoad) {
      if (!editingId) setEditingId(entryToLoad.id);
      if (entryToLoad.date !== date) setDate(entryToLoad.date);
      setStatus(entryToLoad.isHoliday ? 'HOLIDAY' : 'MEAL');
      setAtt15(entryToLoad.att_1_5);
      setAtt68(entryToLoad.att_6_8);
      setMenu(entryToLoad.isHoliday ? 'अवकाश' : (entryToLoad.menuItem || ''));
      setMilkDist(entryToLoad.isMilkDistributed || false);
    } else if (!editingId) {
      setStatus('PENDING'); setAtt15(0); setAtt68(0); setMenu(getAutoMenu(date)); setMilkDist(false);
    }
  }, [date, editingId, dailyEntries, setEditingId]);

  const calcDaily = useCallback((a15: number, a68: number, m: string, milkDistributed: boolean) => {
    const isRice = m.includes('चावल') || m.includes('खिचड़ी');
    const getC = (att: number, nGrain: number, nMilk: number, nSugar: number, nConv: number) => {
      const grain = (att * nGrain) / 1000;
      const milk = milkDistributed ? (att * nMilk) / 1000 : 0;
      const sugar = milkDistributed ? (att * nSugar) / 1000 : 0;
      return { wheat: isRice ? 0 : grain, rice: isRice ? grain : 0, milk, sugar, sugarAmt: sugar * (masterData.sugarRate || 40), conv: att * nConv };
    };
    return { cat15: getC(a15, masterData.normGrain15, masterData.normMilk15, masterData.normSugar15, masterData.normConv15), cat68: isPrimary ? getC(0,0,0,0,0) : getC(a68, masterData.normGrain68, masterData.normMilk68, masterData.normSugar68, masterData.normConv68) };
  }, [masterData, isPrimary]);

  const currentCons = useMemo(() => calcDaily(Number(att15), Number(att68), menu, milkDist), [att15, att68, menu, milkDist, calcDaily]);

  const handleSave = () => {
    if (status === 'PENDING') return alert('कृपया "भोजन बना" या "अवकाश" में से एक विकल्प चुनें!');
    if (status === 'MEAL' && (Number(att15) > masterData.enroll_1_5 || (!isPrimary && Number(att68) > masterData.enroll_6_8))) {
      setShowEnrollAlert(true); return;
    }
    const newEntry: DailyEntry = { id: editingId || crypto.randomUUID(), date, isHoliday: status === 'HOLIDAY', att_1_5: status === 'HOLIDAY' ? 0 : Number(att15), att_6_8: status === 'HOLIDAY' ? 0 : Number(att68), menuItem: status === 'MEAL' ? menu : 'अवकाश', isMilkDistributed: status === 'MEAL' ? milkDist : false };
    setDailyEntries((prev: DailyEntry[]) => { const filtered = prev.filter(e => e.id !== newEntry.id && e.date !== newEntry.date); return [...filtered, newEntry]; });
    setShowSuccess(true);
    setTimeout(() => { 
      setShowSuccess(false); 
      if (editingId) { setEditingId(null); setPage('HISTORY'); } 
      else { setStatus('PENDING'); setAtt15(0); setAtt68(0); setMenu(''); setMilkDist(false); setEditingId(null); } 
    }, 3000); 
  };

  const filteredEntries = useMemo(() => dailyEntries.filter(e => { const d = new Date(e.date); return d.getMonth() === filterMonth && d.getFullYear() === filterYear; }).sort((a, b) => b.date.localeCompare(a.date)), [dailyEntries, filterMonth, filterYear]);
  const monthlySummary = useMemo(() => {
    return filteredEntries.reduce((acc, e) => {
      if (e.isHoliday) return acc;
      const c = calcDaily(e.att_1_5, e.att_6_8, e.menuItem || '', e.isMilkDistributed || false);
      acc.cat15.att += e.att_1_5; acc.cat15.wheat += c.cat15.wheat; acc.cat15.rice += c.cat15.rice; acc.cat15.milk += c.cat15.milk; acc.cat15.sugar += c.cat15.sugar; acc.cat15.sugarAmt += c.cat15.sugarAmt; acc.cat15.conv += c.cat15.conv;
      if (!isPrimary) { acc.cat68.att += e.att_6_8; acc.cat68.wheat += c.cat68.wheat; acc.cat68.rice += c.cat68.rice; acc.cat68.milk += c.cat68.milk; acc.cat68.sugar += c.cat68.sugar; acc.cat68.sugarAmt += c.cat68.sugarAmt; acc.cat68.conv += c.cat68.conv; }
      return acc;
    }, { cat15: { att: 0, wheat: 0, rice: 0, milk: 0, sugar: 0, sugarAmt: 0, conv: 0 }, cat68: { att: 0, wheat: 0, rice: 0, milk: 0, sugar: 0, sugarAmt: 0, conv: 0 } });
  }, [filteredEntries, calcDaily, isPrimary]);
  const historyTotals = useMemo(() => filteredEntries.reduce((acc, e) => { if (e.isHoliday) return acc; const c = calcDaily(e.att_1_5, e.att_6_8, e.menuItem || '', e.isMilkDistributed || false); acc.a15 += e.att_1_5; acc.a68 += e.att_6_8; acc.w += c.cat15.wheat + c.cat68.wheat; acc.r += c.cat15.rice + c.cat68.rice; acc.m += c.cat15.milk + c.cat68.milk; return acc; }, { a15:0, a68:0, w:0, r:0, m:0 }), [filteredEntries, calcDaily]);

  const inputStyle = (disabled: boolean) => `w-full p-4 border-2 border-slate-200 rounded-xl font-black text-[#000000] bg-[#FFFFFF] outline-none transition-all shadow-sm ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : 'focus:border-slate-900 active:scale-[0.99]'}`;
  const labelStyle = "text-[14px] font-black text-[#000000] mb-2 block uppercase tracking-tight";

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 bg-slate-100 px-3 py-2 rounded-xl text-[12px] font-black text-slate-900 border-2 border-slate-900 active:scale-95 transition-all"><ChevronLeft size={16} /> वापस</button>
          <h2 className="text-xl font-black text-[#000000] uppercase tracking-wide">{initialView === 'FORM' ? 'दैनिक प्रविष्टि' : 'दैनिक इतिहास'}</h2>
        </div>
        <button onClick={() => setPage(initialView === 'FORM' ? 'HISTORY' : 'DAILY')} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full text-[13px] font-black text-[#000000] border-2 border-slate-900 shadow-md active:scale-95 transition-all">{initialView === 'FORM' ? '📜 इतिहास' : '🖊️ नई एंट्री'}</button>
      </div>

      {initialView === 'FORM' ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <label className={labelStyle}>दिनांक चुनें</label>
            <input className={inputStyle(false)} type="date" value={date} onChange={e => { setDate(e.target.value); setEditingId(null); }} />
            <div className="flex gap-4">
              <button onClick={() => { setStatus('MEAL'); if (menu === 'अवकाश') setMenu(getAutoMenu(date)); }} className={`flex-1 p-5 rounded-2xl font-black transition-all flex flex-col items-center gap-1 border-4 ${status === 'MEAL' ? 'bg-slate-900 text-white border-slate-700 shadow-xl' : 'bg-white text-slate-400 border-slate-100 grayscale opacity-50'}`}><CheckCircle2 /> भोजन बना ✅</button>
              <button onClick={() => { setStatus('HOLIDAY'); setAtt15(0); setAtt68(0); setMenu('अवकाश'); setMilkDist(false); }} className={`flex-1 p-5 rounded-2xl font-black transition-all flex flex-col items-center gap-1 border-4 ${status === 'HOLIDAY' ? 'bg-amber-600 text-white border-amber-700 shadow-xl' : 'bg-white text-slate-400 border-slate-100 grayscale opacity-50'}`}><RotateCcw /> अवकाश 🏖️</button>
            </div>
          </div>
          <div className={`space-y-6 transition-all duration-300 ${status === 'PENDING' ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
            {status === 'MEAL' && (
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-900 shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><label className={labelStyle}>कक्षा 1 से 5 विद्यार्थी उपस्थिति</label><input className={inputStyle(false)} type="number" onFocus={() => handleFocus(att15, setAtt15)} onBlur={() => handleBlur(att15, setAtt15)} value={att15} onChange={e => setAtt15(e.target.value)} /></div>
                  {!isPrimary && (<div className="space-y-2"><label className={labelStyle}>कक्षा 6 से 8 विद्यार्थी उपस्थिति</label><input className={inputStyle(false)} type="number" onFocus={() => handleFocus(att68, setAtt68)} onBlur={() => handleBlur(att68, setAtt68)} value={att68} onChange={e => setAtt68(e.target.value)} /></div>)}
                </div>
                <div className="flex items-center gap-4 p-5 bg-[#FFFFFF] border-2 border-slate-300 rounded-2xl shadow-sm">
                  <div className="relative w-8 h-8"><input type="checkbox" id="milkDist" className="peer absolute w-full h-full opacity-0 cursor-pointer z-10" checked={milkDist} onChange={e => setMilkDist(e.target.checked)} /><div className="w-8 h-8 border-4 border-slate-900 rounded bg-white flex items-center justify-center peer-checked:bg-slate-900 transition-colors">{milkDist && <CheckCircle2 className="text-white w-6 h-6" />}</div></div>
                  <label htmlFor="milkDist" className="font-bold text-[#000000] uppercase text-[15px] cursor-pointer select-none">दूध वितरण (हाँ/नहीं)</label>
                </div>
                <div className="space-y-2"><label className={labelStyle}>भोजन (मेनू)</label><select className={inputStyle(false)} value={menu} onChange={e => setMenu(e.target.value)}><option value="">-- मेनू चुनें --</option>{Object.entries(GOVERNMENT_MENU).filter(([k]) => k !== "0").map(([k, v]) => (<option key={k} value={v}>{v}</option>))}</select></div>
              </div>
            )}
            
            {status === 'MEAL' && (Number(att15) > 0 || Number(att68) > 0) && (
              <div className="bg-[#FFFFFF] text-[#000000] p-6 rounded-[2.5rem] shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300 border-4 border-slate-900">
                <h3 className="text-center font-black uppercase text-[11px] tracking-widest border-b-2 border-slate-100 pb-3 text-[#000000]">आज का अनुमानित खर्च (REAL-TIME)</h3>
                <div className="overflow-x-auto"><table className="w-full text-center border-collapse text-[12px]"><thead className="font-bold uppercase text-slate-600 bg-slate-50 border-b border-slate-200"><tr><th className="p-3 text-left">मद विवरण</th><th className="p-3">1-5</th>{!isPrimary && <th className="p-3">6-8</th>}<th className="p-3 bg-slate-100 text-[#000000]">कुल योग</th></tr></thead><tbody className="font-bold text-[#000000]"><tr className="border-b border-slate-100"><td className="p-3 text-slate-600 text-left">गेहूँ (kg)</td><td className="p-3">{formatNum(currentCons.cat15.wheat)}</td>{!isPrimary && <td className="p-3">{formatNum(currentCons.cat68.wheat)}</td>}<td className="p-3 bg-slate-50">{formatNum(currentCons.cat15.wheat + currentCons.cat68.wheat)}</td></tr><tr className="border-b border-slate-100"><td className="p-3 text-slate-600 text-left">चावल (kg)</td><td className="p-3">{formatNum(currentCons.cat15.rice)}</td>{!isPrimary && <td className="p-3">{formatNum(currentCons.cat68.rice)}</td>}<td className="p-3 bg-slate-50">{formatNum(currentCons.cat15.rice + currentCons.cat68.rice)}</td></tr><tr className="border-b border-slate-100"><td className="p-3 text-slate-600 text-left">दूध पाउडर (kg)</td><td className="p-3">{formatNum(currentCons.cat15.milk)}</td>{!isPrimary && <td className="p-3">{formatNum(currentCons.cat68.milk)}</td>}<td className="p-3 bg-slate-50">{formatNum(currentCons.cat15.milk + currentCons.cat68.milk)}</td></tr><tr className="border-b border-slate-100"><td className="p-3 text-slate-600 text-left">कन्वर्जन राशि (₹)</td><td className="p-3">₹{formatNum(currentCons.cat15.conv)}</td>{!isPrimary && <td className="p-3">₹{formatNum(currentCons.cat68.conv)}</td>}<td className="p-3 bg-slate-50">₹{formatNum(currentCons.cat15.conv + currentCons.cat68.conv)}</td></tr><tr className="border-b border-slate-100"><td className="p-3 text-slate-600 text-left">चीनी मात्रा (kg)</td><td className="p-3">{formatNum(currentCons.cat15.sugar)}</td>{!isPrimary && <td className="p-3">{formatNum(currentCons.cat68.sugar)}</td>}<td className="p-3 bg-slate-50">{formatNum(currentCons.cat15.sugar + currentCons.cat68.sugar)}</td></tr><tr className="bg-slate-100 font-black text-[#000000] border-t-2 border-slate-900"><td className="p-3 text-left">चीनी राशि (₹)</td><td className="p-3">₹{formatNum(currentCons.cat15.sugarAmt)}</td>{!isPrimary && <td className="p-3">₹{formatNum(currentCons.cat68.sugarAmt)}</td>}<td className="p-3">₹{formatNum(currentCons.cat15.sugarAmt + currentCons.cat68.sugarAmt)}</td></tr></tbody></table></div>
              </div>
            )}
            
            <AdBanner label="विशेष प्रायोजित" />

            <button onClick={handleSave} className="w-full p-8 rounded-[2.5rem] bg-slate-900 text-white font-black text-2xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all border-4 border-slate-700">
              {editingId ? 'आज की प्रविष्टि अपडेट करें ✅' : 'आज की प्रविष्टि सुरक्षित करें ✅'}
            </button>
            {editingId && (<button onClick={() => { setEditingId(null); setDate(getTodayStr()); }} className="w-full text-slate-500 font-bold uppercase text-xs mt-4">रद्द करें और आज की तारीख पर जाएँ</button>)}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex gap-2 bg-white p-4 rounded-3xl border-2 border-slate-900 overflow-x-auto shadow-md">
            <Filter className="text-slate-400 shrink-0" size={20}/>
            <select className="flex-1 p-2 font-black border-2 border-slate-100 rounded-xl text-[#000000] bg-white outline-none" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
              {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select className="flex-1 p-2 font-black border-2 border-slate-100 rounded-xl text-[#000000] bg-white outline-none" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
              {YEARS_RANGE.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          
          {/* Ad 1: फिल्टर के ठीक बाद */}
          <AdBanner label="इतिहास विश्लेषण सहायता" />

          <div className="overflow-hidden rounded-[2.5rem] border-2 border-slate-900 bg-white shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead className="bg-slate-900 text-white font-black uppercase sticky top-0">
                  <tr>
                    <th className="p-4 border-r border-slate-800">दिनांक</th>
                    <th className="p-4 border-r border-slate-800">छात्र 1-5</th>
                    {!isPrimary && <th className="p-4 border-r border-slate-800">छात्र 6-8</th>}
                    <th className="p-4">कुल गेहूँ</th><th className="p-4">कुल चावल</th><th className="p-4">कुल दूध</th><th className="p-4">Edit</th>
                  </tr>
                </thead>
                <tbody className="font-black text-[#000000]">
                  {filteredEntries.map(e => { 
                    const c = calcDaily(e.att_1_5, e.att_6_8, e.menuItem || '', e.isMilkDistributed || false); 
                    return (
                      <tr key={e.id} className="border-b border-slate-100">
                        <td className="p-4 border-r border-slate-50">{new Date(e.date).toLocaleDateString('hi-IN', {day:'2-digit', month:'short'})}</td>
                        <td className="p-4 border-r border-slate-50">{e.att_1_5}</td>
                        {!isPrimary && <td className="p-4 border-r border-slate-50">{e.att_6_8}</td>}
                        <td className="p-4">{formatNum(c.cat15.wheat + c.cat68.wheat)}</td>
                        <td className="p-4">{formatNum(c.cat15.rice + c.cat68.rice)}</td>
                        <td className="p-4">{formatNum(c.cat15.milk + c.cat68.milk)}</td>
                        <td className="p-4">
                          <button onClick={() => { setEditingId(e.id); setDate(e.date); setPage('DAILY'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 bg-slate-100 rounded-lg text-slate-900 active:scale-90 transition-transform">
                            <Edit2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ); 
                  })}
                  <tr className="bg-slate-900 text-white font-black text-xs">
                    <td className="p-4 uppercase">कुल योग</td><td className="p-4">{historyTotals.a15}</td>
                    {!isPrimary && <td className="p-4">{historyTotals.a68}</td>}
                    <td className="p-4">{formatNum(historyTotals.w)}</td>
                    <td className="p-4">{formatNum(historyTotals.r)}</td>
                    <td className="p-4">{formatNum(historyTotals.m)}</td><td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ad 2: मुख्य टेबल के बाद और विस्तृत सारांश से पहले */}
          <AdBanner label="मासिक प्रगति रिपोर्ट विज्ञापन" />

          <div className="bg-white rounded-[2.5rem] border-2 border-slate-900 shadow-xl overflow-hidden mt-12">
            <div className="bg-slate-100 p-5 border-b-2 border-slate-900 text-center font-black uppercase text-[12px] tracking-widest text-slate-900">पूरे महीने का विस्तृत विवरण</div>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-[12px]">
                <thead className="bg-slate-900 text-white font-black uppercase">
                  <tr>
                    <th className="p-4 text-left">मद विवरण</th><th className="p-4">कक्षा 1-5</th>
                    {!isPrimary && <th className="p-4">कक्षा 6-8</th>}
                    <th className="p-4 bg-slate-700">कुल योग</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-[#000000]">
                  <tr className="border-b border-slate-200"><td className="p-4 bg-slate-50 text-left font-black">कुल छात्र</td><td className="p-4">{monthlySummary.cat15.att}</td>{!isPrimary && <td className="p-4">{monthlySummary.cat68.att}</td>}<td className="p-4 bg-slate-50 font-black">{monthlySummary.cat15.att + monthlySummary.cat68.att}</td></tr>
                  <tr className="border-b border-slate-200"><td className="p-4 bg-slate-50 text-left font-black">गेहूं खर्च(kg)</td><td className="p-4">{formatNum(monthlySummary.cat15.wheat)}</td>{!isPrimary && <td className="p-4">{formatNum(monthlySummary.cat68.wheat)}</td>}<td className="p-4 bg-slate-50 font-black">{formatNum(monthlySummary.cat15.wheat + monthlySummary.cat68.wheat)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="p-4 bg-slate-50 text-left font-black">चावल खर्च(kg)</td><td className="p-4">{formatNum(monthlySummary.cat15.rice)}</td>{!isPrimary && <td className="p-4">{formatNum(monthlySummary.cat68.rice)}</td>}<td className="p-4 bg-slate-50 font-black">{formatNum(monthlySummary.cat15.rice + monthlySummary.cat68.rice)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="p-4 bg-slate-50 text-left font-black">दूध पाउडर खर्च(kg)</td><td className="p-4">{formatNum(monthlySummary.cat15.milk)}</td>{!isPrimary && <td className="p-4">{formatNum(monthlySummary.cat68.milk)}</td>}<td className="p-4 bg-slate-50 font-black">{formatNum(monthlySummary.cat15.milk + monthlySummary.cat68.milk)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="p-4 bg-slate-50 text-left font-black">चीनी खर्च(kg)</td><td className="p-4">{formatNum(monthlySummary.cat15.sugar)}</td>{!isPrimary && <td className="p-4">{formatNum(monthlySummary.cat68.sugar)}</td>}<td className="p-4 bg-slate-50 font-black">{formatNum(monthlySummary.cat15.sugar + monthlySummary.cat68.sugar)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="p-4 bg-slate-50 text-left font-black">चीनी की राशि खर्च(₹)</td><td className="p-4">₹{formatNum(monthlySummary.cat15.sugarAmt)}</td>{!isPrimary && <td className="p-4">₹{formatNum(monthlySummary.cat68.sugarAmt)}</td>}<td className="p-4 bg-slate-50 font-black">₹{formatNum(monthlySummary.cat15.sugarAmt + monthlySummary.cat68.sugarAmt)}</td></tr>
                  <tr className="bg-slate-900 text-white"><td className="p-4 text-left font-black">कन्वर्जन राशि खर्च (₹)</td><td className="p-4">₹{formatNum(monthlySummary.cat15.conv)}</td>{!isPrimary && <td className="p-4">₹{formatNum(monthlySummary.cat68.conv)}</td>}<td className="p-4 font-black">₹{formatNum(monthlySummary.cat15.conv + monthlySummary.cat68.conv)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {showEnrollAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in zoom-in">
          <div className="bg-white rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border-4 border-rose-600 max-w-xs w-full">
            <AlertTriangle size={64} className="mx-auto text-rose-600 animate-bounce" /><h3 className="text-xl font-black text-rose-900 uppercase leading-tight">⚠️ उपस्थिति नामांकन से अधिक है!</h3>
            <button onClick={() => setPage('MASTER')} className="w-full p-4 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center gap-2 active:scale-95 transition-all"><Hammer size={18} /> नामांकन सुधारें 🛠️</button><button onClick={() => setShowEnrollAlert(false)} className="text-[#000000] font-black text-xs uppercase underline">वापस जाएँ</button>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in zoom-in">
          <div className="bg-white rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border-4 border-emerald-600 max-w-xs w-full">
            <CheckCircle2 size={64} className="mx-auto text-emerald-600" />
            <h3 className="text-xl font-black text-emerald-900 uppercase leading-tight">आज की प्रविष्टि सफलतापूर्वक सुरक्षित की गई! ✅</h3>
            <div className="mt-4 pt-4 border-t border-slate-100"><AdBanner label="प्रायोजित संदेश" /></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- स्टॉक प्राप्ति (Stock Receipt) कंपोनेंट ---
const StockReceiptFormView = ({ 
  masterData, 
  stockReceipts, 
  setStockReceipts,
  setPage,
  initialView = 'FORM'
}: { 
  masterData: MasterData, 
  stockReceipts: StockReceipt[], 
  setStockReceipts: any,
  setPage: (p: Page) => void,
  initialView?: 'FORM' | 'HISTORY'
}) => {
  const isPrimary = masterData.level === SchoolLevel.PRIMARY;
  const [view, setView] = useState<'FORM' | 'HISTORY'>(initialView);
  const [date, setDate] = useState(getTodayStr());
  const [item, setItem] = useState<'WHEAT' | 'RICE' | 'MILK'>('WHEAT');
  const [amount, setAmount] = useState<number | string>(0);
  const [category, setCategory] = useState<'1-5' | '6-8'>('1-5');
  const [transactionType, setTransactionType] = useState<StockReceipt['transactionType']>('SUPPLIER');
  const [sourceSchool, setSourceSchool] = useState('');
  const [transferTarget, setTransferTarget] = useState<'1-5' | '6-8'>('6-8');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean, title: string, filterType: string | null } | null>(null);

  const handleFocus = (val: any, setter: any) => { if (Number(val) === 0) setter(""); };
  const handleBlur = (val: any, setter: any) => { if (val === "" || val === undefined) setter(0); };

  const handleEdit = (receipt: StockReceipt) => {
    setEditingId(receipt.id); setDate(receipt.date); setItem(receipt.item); setAmount(receipt.amount); setCategory(receipt.category); setTransactionType(receipt.transactionType); setSourceSchool(receipt.sourceSchool || ''); setTransferTarget(receipt.transferTarget || '6-8'); setView('FORM');
  };

  const handleSave = () => {
    if (Number(amount) <= 0) return alert('कृपया वैध मात्रा दर्ज करें!');
    const entryData: StockReceipt = { id: editingId || crypto.randomUUID(), date, item, amount: Number(amount), category, transactionType, sourceSchool: transactionType !== 'SUPPLIER' && transactionType !== 'INTERNAL_TRANSFER' ? sourceSchool : undefined, transferTarget: transactionType === 'INTERNAL_TRANSFER' ? transferTarget : undefined };
    setStockReceipts((prev: StockReceipt[]) => { const filtered = prev.filter(r => r.id !== entryData.id); return [...filtered, entryData]; });
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); setEditingId(null); setAmount(0); setSourceSchool(''); if (editingId) setView('HISTORY'); }, 2000);
  };

  const handleBack = () => { if (view === 'HISTORY') setView('FORM'); else setPage('DASHBOARD'); };

  const stockSummary = useMemo(() => {
    const summary = { supplier: { wheat: 0, rice: 0, milk: 0 }, borrowed: { wheat: 0, rice: 0, milk: 0 }, lent: { wheat: 0, rice: 0, milk: 0 } };
    stockReceipts.forEach(r => {
      const field = r.item.toLowerCase() as 'wheat' | 'rice' | 'milk';
      if (r.transactionType === 'SUPPLIER') summary.supplier[field] += r.amount;
      else if (r.transactionType === 'BORROW_IN') summary.borrowed[field] += r.amount;
      else if (r.transactionType === 'REPAY_OUT') summary.borrowed[field] -= r.amount;
      else if (r.transactionType === 'LEND_OUT') summary.lent[field] += r.amount;
      else if (r.transactionType === 'RETURN_IN') summary.lent[field] -= r.amount;
    });
    return summary;
  }, [stockReceipts]);

  const filteredHistory = useMemo(() => stockReceipts.filter(r => { const d = new Date(r.date); return d.getMonth() === filterMonth && d.getFullYear() === filterYear; }).sort((a, b) => b.date.localeCompare(a.date)), [stockReceipts, filterMonth, filterYear]);

  const inputStyle = "w-full p-4 border-2 border-slate-300 rounded-xl font-black text-[#000000] bg-[#FFFFFF] focus:border-slate-900 outline-none transition-all shadow-sm mb-4";
  const labelStyle = "text-[14px] font-black text-[#000000] mb-2 block uppercase tracking-tight";

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="flex items-center gap-1 bg-slate-100 px-3 py-2 rounded-xl text-[12px] font-black text-slate-900 border-2 border-slate-900 active:scale-95 transition-all"><ChevronLeft size={16} /> पीछे जाएं</button>
          <h2 className="text-xl font-black text-[#000000] uppercase tracking-wide">{view === 'FORM' ? 'स्टॉक प्राप्ति' : 'स्टॉक इतिहास'}</h2>
        </div>
        <button onClick={() => setView(view === 'FORM' ? 'HISTORY' : 'FORM')} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full text-[13px] font-black text-[#000000] border-2 border-slate-900 shadow-md active:scale-95 transition-all">{view === 'FORM' ? '📜 स्टॉक इतिहास' : '🖊️ नई एंट्री'}</button>
      </div>
      {view === 'FORM' ? (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-900 shadow-xl space-y-6">
            <div><label className={labelStyle}>आइटम चुनें</label><div className="grid grid-cols-3 gap-3">{(['WHEAT', 'RICE', 'MILK'] as const).map(i => (<button key={i} onClick={() => setItem(i)} className={`p-5 rounded-2xl font-black text-[13px] uppercase transition-all border-4 ${item === i ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>{i === 'WHEAT' ? '🌾 गेहूँ' : i === 'RICE' ? '🍚 चावल' : '🥛 दूध पाउडर'}</button>))}</div></div>
            <div><label className={labelStyle}>दिनांक</label><input className={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className={labelStyle}>लेनदेन का प्रकार</label><select className={inputStyle} value={transactionType} onChange={e => setTransactionType(e.target.value as any)}><option value="SUPPLIER">(+) सप्लायर (सरकारी गोदाम)</option><option value="BORROW_IN">(+) उधार लिया (पड़ोसी स्कूल)</option><option value="LEND_OUT">(-) उधार दिया (पड़ोसी स्कूल)</option><option value="REPAY_OUT">(-) उधार चुकाया (वापस दिया)</option><option value="RETURN_IN">(+) उधार वापस लिया (फिर से प्राप्त)</option><option value="INTERNAL_TRANSFER">आंतरिक आदान-प्रदान (1-5 ↔ 6-8)</option></select></div><div><label className={labelStyle}>मात्रा (Kg)</label><input className={inputStyle} type="number" step="0.00001" onFocus={() => handleFocus(amount, setAmount)} onBlur={() => handleBlur(amount, setAmount)} value={amount} onChange={e => setAmount(e.target.value)} /></div></div>
            {transactionType === 'INTERNAL_TRANSFER' ? (<div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top"><div><label className={labelStyle}>कहाँ से</label><select className={inputStyle} value={category} onChange={e => setCategory(e.target.value as any)}><option value="1-5">कक्षा 1 से 5</option><option value="6-8">कक्षा 6 से 8</option></select></div><div><label className={labelStyle}>कहाँ को</label><select className={inputStyle} value={transferTarget} onChange={e => setTransferTarget(e.target.value as any)}><option value="1-5">कक्षा 1 से 5</option><option value="6-8">कक्षा 6 से 8</option></select></div></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className={labelStyle}>श्रेणी</label><select className={inputStyle} value={category} onChange={e => setCategory(e.target.value as any)}><option value="1-5">कक्षा 1 से 5</option>{!isPrimary && <option value="6-8">कक्षा 6 से 8</option>}</select></div>{transactionType !== 'SUPPLIER' && (<div className="animate-in slide-in-from-right"><label className={labelStyle}>विद्यालय का नाम</label><input className={inputStyle} value={sourceSchool} onChange={e => setSourceSchool(e.target.value)} placeholder="स्कूल का नाम दर्ज करें" /></div>)}</div>)}
            <button onClick={handleSave} className="w-full p-8 rounded-[2rem] bg-slate-900 text-white font-black text-2xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all border-4 border-slate-700">{editingId ? 'स्टॉक सुधारें ✅' : 'स्टॉक प्रविष्टि सुरक्षित करें ✅'}</button>
          </div>
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-900 shadow-xl overflow-hidden"><div className="bg-slate-100 p-4 border-b-2 border-slate-900 text-center font-black uppercase text-[12px] tracking-widest text-slate-900">वर्तमान स्टॉक सारांश (Summary)</div><div className="overflow-x-auto"><table className="w-full text-center border-collapse text-[12px]"><thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200"><tr><th className="p-3 text-left">प्रकार</th><th className="p-3">गेहूँ</th><th className="p-3">चावल</th><th className="p-3">दूध</th><th className="p-3">विवरण</th></tr></thead><tbody className="font-bold text-[#000000]"><tr className="border-b border-slate-100"><td className="p-3 text-left">सप्लायर से प्राप्त</td><td className="p-3">{formatNum(stockSummary.supplier.wheat)}</td><td className="p-3">{formatNum(stockSummary.supplier.rice)}</td><td className="p-3">{formatNum(stockSummary.supplier.milk)}</td><td className="p-3"><button onClick={() => setDetailModal({ isOpen: true, title: 'सप्लायर विवरण', filterType: 'SUPPLIER' })} className="bg-white px-3 py-1.5 rounded-full text-[10px] text-slate-900 border-2 border-slate-900 font-black active:scale-90 transition-transform">View</button></td></tr><tr className="border-b border-slate-100"><td className="p-3 text-left">उधार चुकाना है</td><td className="p-3 text-rose-600">{formatNum(stockSummary.borrowed.wheat)}</td><td className="p-3 text-rose-600">{formatNum(stockSummary.borrowed.rice)}</td><td className="p-3 text-rose-600">{formatNum(stockSummary.borrowed.milk)}</td><td className="p-3"><button onClick={() => setDetailModal({ isOpen: true, title: 'उधार देय (Payable)', filterType: 'BORROW' })} className="bg-white px-3 py-1.5 rounded-full text-[10px] text-slate-900 border-2 border-slate-900 font-black active:scale-90 transition-transform">View</button></td></tr><tr><td className="p-3 text-left">उधार लेना है</td><td className="p-3 text-emerald-600">{formatNum(stockSummary.lent.wheat)}</td><td className="p-3 text-emerald-600">{formatNum(stockSummary.lent.rice)}</td><td className="p-3 text-emerald-600">{formatNum(stockSummary.lent.milk)}</td><td className="p-3"><button onClick={() => setDetailModal({ isOpen: true, title: 'उधार प्राप्य (Receivable)', filterType: 'LENT' })} className="bg-white px-3 py-1.5 rounded-full text-[10px] text-slate-900 border-2 border-slate-900 font-black active:scale-90 transition-transform">View</button></td></tr></tbody></table></div></div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500"><div className="flex gap-2 bg-white p-4 rounded-3xl border-2 border-slate-900 overflow-x-auto shadow-md"><Filter className="text-slate-400 shrink-0" size={20}/><select className="flex-1 p-2 font-black border-2 border-slate-100 rounded-xl text-[#000000] bg-white outline-none" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>{MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}</select><select className="flex-1 p-2 font-black border-2 border-slate-100 rounded-xl text-[#000000] bg-white outline-none" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>{YEARS_RANGE.map(y => <option key={y} value={y}>{y}</option>)}</select></div><div className="overflow-hidden rounded-[2.5rem] border-2 border-slate-900 bg-white shadow-2xl"><div className="overflow-x-auto"><table className="w-full text-center border-collapse text-[11px]"><thead className="bg-slate-900 text-white font-black uppercase sticky top-0"><tr><th className="p-4 border-r border-slate-800">दिनांक</th><th className="p-4 border-r border-slate-800">आइटम</th><th className="p-4 border-r border-slate-800">विवरण</th><th className="p-4 border-r border-slate-800">प्रकार</th><th className="p-4">मात्रा</th><th className="p-4">✎</th></tr></thead><tbody className="font-black text-[#000000] bg-white">{filteredHistory.map(r => { const isPlus = ['SUPPLIER', 'BORROW_IN', 'RETURN_IN'].includes(r.transactionType); const desc = (r.transactionType === 'INTERNAL_TRANSFER' ? `${r.category} → ${r.transferTarget}` : (r.sourceSchool || 'सप्लायर')); return (<tr key={r.id} className="border-b border-slate-100"><td className="p-4 border-r border-slate-50">{new Date(r.date).toLocaleDateString('hi-IN', {day:'2-digit', month:'short'})}</td><td className="p-4 border-r border-slate-50">{r.item === 'WHEAT' ? 'गेहूँ' : r.item === 'RICE' ? 'चावल' : 'दूध'}</td><td className="p-4 border-r border-slate-50 text-[9px] break-words max-w-[80px]">{desc}</td><td className="p-4 border-r border-slate-50 text-[9px] opacity-80 uppercase font-black text-slate-700">{TX_TYPE_MAP[r.transactionType] || r.transactionType}</td><td className={`p-4 font-black ${isPlus ? 'text-emerald-600' : 'text-rose-600'}`}>{isPlus ? '+' : '-'}{formatNum(r.amount)}</td><td className="p-4"><div className="flex flex-col gap-2"><button onClick={() => handleEdit(r)} className="text-slate-900 bg-slate-100 p-2 rounded-lg"><Edit2 size={12}/></button><button onClick={() => { if(window.confirm('क्या आप इस एंट्री को हटाना चाहते हैं?')) setStockReceipts((prev: StockReceipt[]) => prev.filter(x => x.id !== r.id)); }} className="text-rose-600 bg-rose-50 p-2 rounded-lg"><Trash2 size={12}/></button></div></td></tr>); })}</tbody></table></div></div></div>
      )}
      {detailModal?.isOpen && (<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in zoom-in"><div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col border-4 border-slate-900 shadow-2xl"><div className="p-5 bg-slate-100 border-b border-slate-200 flex justify-between items-center"><h3 className="font-black text-slate-900 uppercase tracking-wide">{detailModal.title}</h3><button onClick={() => setDetailModal(null)} className="text-slate-500 active:scale-90 transition-transform"><XCircle /></button></div><div className="flex-1 overflow-y-auto p-4"><table className="w-full text-center text-[10px] border-collapse"><thead className="bg-slate-50 font-bold uppercase border-b"><tr><th className="p-2">दिनांक</th><th className="p-2">स्कूल/स्रोत</th><th className="p-2">आइटम</th><th className="p-2">मात्रा</th><th className="p-2">प्रकार</th></tr></thead><tbody className="text-[#000000] font-bold">{stockReceipts.filter(r => { if (detailModal.filterType === 'SUPPLIER') return r.transactionType === 'SUPPLIER'; if (detailModal.filterType === 'BORROW') return r.transactionType === 'BORROW_IN' || r.transactionType === 'REPAY_OUT'; if (detailModal.filterType === 'LENT') return r.transactionType === 'LEND_OUT' || r.transactionType === 'RETURN_IN'; return false; }).map(r => (<tr key={r.id} className="border-b border-slate-50"><td className="p-2">{r.date}</td><td className="p-2">{r.sourceSchool || 'सप्लायर'}</td><td className="p-2">{r.item}</td><td className={`p-2 font-black ${['BORROW_IN', 'LEND_OUT', 'SUPPLIER', 'RETURN_IN'].includes(r.transactionType) ? 'text-emerald-600' : 'text-rose-600'}`}>{['BORROW_IN', 'LEND_OUT', 'SUPPLIER', 'RETURN_IN'].includes(r.transactionType) ? '+' : '-'}{r.amount}</td><td className="p-2 text-[8px]">{TX_TYPE_MAP[r.transactionType] || r.transactionType}</td></tr>))}</tbody></table></div></div></div>)}
      {showSuccess && (<div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in zoom-in"><div className="bg-white rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border-4 border-emerald-600 max-w-xs w-full"><CheckCircle2 size={64} className="mx-auto text-emerald-600" /><h3 className="text-xl font-black text-emerald-900 uppercase leading-tight">स्टॉक सफलता पूर्वक सेव हो गया! ✅</h3></div></div>)}
    </div>
  );
};

// --- बजट प्राप्ति (Budget Receipt) कंपोनेंट ---
const BudgetReceiptFormView = ({ 
  masterData, 
  budgetReceipts, 
  setBudgetReceipts,
  setPage,
  initialView = 'FORM'
}: { 
  masterData: MasterData, 
  budgetReceipts: BudgetReceipt[], 
  setBudgetReceipts: any,
  setPage: (p: Page) => void,
  initialView?: 'FORM' | 'HISTORY'
}) => {
  const isPrimary = masterData.level === SchoolLevel.PRIMARY;
  const [view, setView] = useState<'FORM' | 'HISTORY'>(initialView);
  const [date, setDate] = useState(getTodayStr());
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [conv15, setConv15] = useState<number | string>(0);
  const [conv68, setConv68] = useState<number | string>(0);
  const [sugar15, setSugar15] = useState<number | string>(0);
  const [sugar68, setSugar68] = useState<number | string>(0);
  const [cookHelper, setCookHelper] = useState<number | string>(0);
  const [milkHelper, setMilkHelper] = useState<number | string>(0);
  const [milkCylinder, setMilkCylinder] = useState<number | string>(0);

  const handleFocus = (val: any, setter: any) => { if (Number(val) === 0) setter(""); };
  const handleBlur = (val: any, setter: any) => { if (val === "" || val === undefined) setter(0); };

  const handleEdit = (receipt: BudgetReceipt) => {
    setEditingId(receipt.id); setDate(receipt.date); 
    const parts = receipt.description.split(' - '); const head = parts[0]; setDescription(parts[1] || '');
    setConv15(0); setConv68(0); setSugar15(0); setSugar68(0); setCookHelper(0); setMilkHelper(0); setMilkCylinder(0);
    if (head === 'कन्वर्जन राशि कक्षा 1 से 5') setConv15(receipt.amount);
    else if (head === 'कन्वर्जन राशि कक्षा 6 से 8') setConv68(receipt.amount);
    else if (head === 'चीनी की राशि कक्षा 1 से 5') setSugar15(receipt.amount);
    else if (head === 'चीनी की राशि कक्षा 6 से 8') setSugar68(receipt.amount);
    else if (head === 'कुक कम हेल्पर राशि (संयुक्त)') setCookHelper(receipt.amount);
    else if (head === 'दूध हेल्पर राशि (संयुक्त)') setMilkHelper(receipt.amount);
    else if (head === 'दूध सिलेंडर राशि (संयुक्त)') setMilkCylinder(receipt.amount);
    setView('FORM');
  };

  const handleSave = () => {
    const items = [ { amount: Number(conv15), head: 'कन्वर्जन राशि कक्षा 1 से 5' }, { amount: Number(conv68), head: 'कन्वर्जन राशि कक्षा 6 से 8' }, { amount: Number(sugar15), head: 'चीनी की राशि कक्षा 1 से 5' }, { amount: Number(sugar68), head: 'चीनी की राशि कक्षा 6 से 8' }, { amount: Number(cookHelper), head: 'कुक कम हेल्पर राशि (संयुक्त)' }, { amount: Number(milkHelper), head: 'दूध हेल्पर राशि (संयुक्त)' }, { amount: Number(milkCylinder), head: 'दूध सिलेंडर राशि (संयुक्त)' } ].filter(item => item.amount > 0);
    if (items.length === 0) return alert('कृपया कम से कम एक मद में राशि दर्ज करें!');
    if (editingId && items.length > 1) return alert('संपादन के दौरान केवल एक मद में राशि दर्ज रखें।');
    setBudgetReceipts((prev: BudgetReceipt[]) => {
      let updated = [...prev]; if (editingId) updated = updated.filter(r => r.id !== editingId);
      const newEntries: BudgetReceipt[] = items.map(item => ({ id: crypto.randomUUID(), date, amount: item.amount, description: `${item.head} - ${description || 'प्राप्ति'}` }));
      return [...updated, ...newEntries];
    });
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); setEditingId(null); setConv15(0); setConv68(0); setSugar15(0); setSugar68(0); setCookHelper(0); setMilkHelper(0); setMilkCylinder(0); setDescription(''); if (editingId) setView('HISTORY'); }, 2000);
  };

  const handleBack = () => { if (view === 'HISTORY') setView('FORM'); else setPage('DASHBOARD'); };
  const filteredHistory = useMemo(() => budgetReceipts.filter(r => { const d = new Date(r.date); return d.getMonth() === filterMonth && d.getFullYear() === filterYear; }).sort((a, b) => b.date.localeCompare(a.date)), [budgetReceipts, filterMonth, filterYear]);
  const inputStyle = "w-full p-4 border-2 border-slate-200 rounded-xl font-black text-[#000000] bg-[#FFFFFF] focus:border-slate-900 outline-none transition-all shadow-sm mb-4";
  const labelStyle = "text-[14px] font-black text-[#000000] mb-2 block uppercase tracking-tight";
  const sectionTitleStyle = "text-md font-black text-[#000000] flex items-center gap-2 border-b-2 border-slate-900 pb-1 mb-6 uppercase tracking-wider mt-4";

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="flex items-center gap-1 bg-slate-100 px-3 py-2 rounded-xl text-[12px] font-black text-slate-900 border-2 border-slate-900 active:scale-95 transition-all"><ChevronLeft size={16} /> पीछे जाएं</button>
          <h2 className="text-xl font-black text-[#000000] uppercase tracking-wide">{view === 'FORM' ? 'बजट प्राप्ति' : 'बजट इतिहास'}</h2>
        </div>
        <button onClick={() => setView(view === 'FORM' ? 'HISTORY' : 'FORM')} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full text-[13px] font-black text-[#000000] border-2 border-slate-900 shadow-md active:scale-95 transition-all">{view === 'FORM' ? '📜 बजट इतिहास' : '🖊️ नई एंट्री'}</button>
      </div>
      {view === 'FORM' ? (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-900 shadow-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className={labelStyle}>प्राप्ति दिनांक</label><input className={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} /></div><div><label className={labelStyle}>विवरण (रिमार्क)</label><input className={inputStyle} value={description} onChange={e => setDescription(e.target.value)} placeholder="बजट का स्रोत..." /></div></div>
            <h3 className={sectionTitleStyle}><ClipboardList size={18} /> A. कक्षा वार बजट प्राप्ति (Class-wise)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl"><div><label className={labelStyle}>कन्वर्जन राशि कक्षा 1 से 5</label><input className={inputStyle} type="number" step="0.01" onFocus={() => handleFocus(conv15, setConv15)} onBlur={() => handleBlur(conv15, setConv15)} value={conv15} onChange={e => setConv15(e.target.value)} /></div>{!isPrimary && (<div><label className={labelStyle}>कन्वर्जन राशि कक्षा 6 से 8</label><input className={inputStyle} type="number" step="0.01" onFocus={() => handleFocus(conv68, setCookHelper)} onBlur={() => handleBlur(conv68, setCookHelper)} value={conv68} onChange={e => setConv68(e.target.value)} /></div>)}<div><label className={labelStyle}>चीनी की राशि कक्षा 1 से 5</label><input className={inputStyle} type="number" step="0.01" onFocus={() => handleFocus(sugar15, setSugar15)} onBlur={() => handleBlur(sugar15, setSugar15)} value={sugar15} onChange={e => setSugar15(e.target.value)} /></div>{!isPrimary && (<div><label className={labelStyle}>चीनी की राशि कक्षा 6 से 8</label><input className={inputStyle} type="number" step="0.01" onFocus={() => handleFocus(sugar68, setSugar68)} onBlur={() => handleBlur(sugar68, setSugar68)} value={sugar68} onChange={e => setSugar68(e.target.value)} /></div>)}</div>
            <h3 className={sectionTitleStyle}><IndianRupee size={18} /> B. संयुक्त बजट प्राप्ति (Combined Class 1 to 8)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl"><div><label className={labelStyle}>कुक कम हेल्पर राशि (संयुक्त)</label><input className={inputStyle} type="number" step="0.01" onFocus={() => handleFocus(cookHelper, setCookHelper)} onBlur={() => handleBlur(cookHelper, setCookHelper)} value={cookHelper} onChange={e => setCookHelper(e.target.value)} /></div><div><label className={labelStyle}>दूध हेल्पर राशि (संयुक्त)</label><input className={inputStyle} type="number" step="0.01" onFocus={() => handleFocus(milkHelper, setMilkHelper)} onBlur={() => handleBlur(milkHelper, setMilkHelper)} value={milkHelper} onChange={e => setMilkHelper(e.target.value)} /></div><div className="md:col-span-2"><label className={labelStyle}>दूध सिलेंडर राशि (संयुक्त)</label><input className={inputStyle} type="number" step="0.01" value={milkCylinder} onFocus={() => handleFocus(milkCylinder, setMilkCylinder)} onBlur={() => handleBlur(milkCylinder, setMilkCylinder)} onChange={e => setMilkCylinder(e.target.value)} /></div></div>
            <button onClick={handleSave} className="w-full p-6 rounded-[2rem] bg-slate-900 text-white font-black text-xl uppercase tracking-widest shadow-xl active:scale-95 transition-all border-4 border-slate-700">{editingId ? 'बजट सुधारें ✅' : 'बजट एंट्री सुरक्षित करें ✅'}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500"><div className="flex gap-2 bg-white p-4 rounded-3xl border-2 border-slate-900 overflow-x-auto shadow-md"><Filter className="text-slate-400 shrink-0" size={20}/><select className="flex-1 p-2 font-black border-2 border-slate-100 rounded-xl text-[#000000] bg-white outline-none" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>{MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}</select><select className="flex-1 p-2 font-black border-2 border-slate-100 rounded-xl text-[#000000] bg-white outline-none" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>{YEARS_RANGE.map(y => <option key={y} value={y}>{y}</option>)}</select></div><div className="overflow-hidden rounded-[2.5rem] border-2 border-slate-900 bg-white shadow-2xl"><div className="overflow-x-auto"><table className="w-full text-center border-collapse text-[11px]"><thead className="bg-slate-900 text-white font-black uppercase sticky top-0"><tr><th className="p-4 border-r border-slate-800">दिनांक</th><th className="p-4 border-r border-slate-800">विवरण</th><th className="p-4 border-r border-slate-800">मद (Head)</th><th className="p-4">राशि (₹)</th><th className="p-4">✎</th></tr></thead><tbody className="font-black text-[#000000] bg-white">{filteredHistory.map(r => (<tr key={r.id} className="border-b border-slate-100"><td className="p-4 border-r border-slate-50">{new Date(r.date).toLocaleDateString('hi-IN', {day:'2-digit', month:'short'})}</td><td className="p-4 border-r border-slate-50 text-[9px] opacity-70 italic">{r.description.split(' - ')[1] || '---'}</td><td className="p-4 border-r border-slate-50 text-[10px] break-words max-w-[100px]">{r.description.split(' - ')[0]}</td><td className="p-4 font-black">₹{formatNum(r.amount)}</td><td className="p-4"><div className="flex flex-col gap-2"><button onClick={() => handleEdit(r)} className="text-slate-900 bg-slate-100 p-2 rounded-lg flex items-center justify-center"><Edit2 size={12}/></button><button onClick={() => { if(window.confirm('क्या आप इस बजट एंट्री को हटाना चाहते हैं?')) setBudgetReceipts((prev: BudgetReceipt[]) => prev.filter(x => x.id !== r.id)); }} className="text-rose-600 bg-rose-50 p-2 rounded-lg flex items-center justify-center"><Trash2 size={12}/></button></div></td></tr>))}</tbody></table></div></div></div>
      )}
      {showSuccess && (<div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in zoom-in"><div className="bg-white rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border-4 border-emerald-600 max-w-xs w-full"><CheckCircle2 size={64} className="mx-auto text-emerald-600" /><h3 className="text-xl font-black text-emerald-900 uppercase leading-tight">बजट सफलता पूर्वक सुरक्षित किया गया! ✅</h3></div></div>)}
    </div>
  );
};

// --- मासिक खर्च (Monthly Expense) कंपोनेंट ---
const MonthlyExpenseView = ({ 
  masterData, dailyEntries, monthlyExpenses, setMonthlyExpenses, setPage, initialView = 'FORM'
}: { 
  masterData: MasterData, dailyEntries: DailyEntry[], monthlyExpenses: MonthlyExpenseRecord[], setMonthlyExpenses: any, setPage: (p: Page) => void, initialView?: 'FORM' | 'HISTORY'
}) => {
  const isPrimary = masterData.level === SchoolLevel.PRIMARY;
  const [view, setView] = useState<'FORM' | 'HISTORY'>(initialView);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [showSuccess, setShowSuccess] = useState(false);
  const [milkHelperAmt, setMilkHelperAmt] = useState<number | string>(0);
  const [cookHelperAmt, setCookHelperAmt] = useState<number | string>(0);
  const [cylinderCount, setCylinderCount] = useState<number | string>(0);
  const [cylinderAmt, setCylinderAmt] = useState<number | string>(0);
  const handleFocus = (val: any, setter: any) => { if (Number(val) === 0) setter(""); };
  const handleBlur = (val: any, setter: any) => { if (val === "" || val === undefined) setter(0); };

  const calculatedData = useMemo(() => {
    return dailyEntries.reduce((acc, e) => {
      const d = new Date(e.date); if (d.getMonth() === month && d.getFullYear() === year && !e.isHoliday) {
        acc.conv15 += e.att_1_5 * masterData.normConv15; if (!isPrimary) acc.conv68 += e.att_6_8 * masterData.normConv68;
        if (e.isMilkDistributed) { const sugarQty = (e.att_1_5 * masterData.normSugar15 + (isPrimary ? 0 : e.att_6_8 * masterData.normSugar68)) / 1000; acc.sugarAmt += sugarQty * (masterData.sugarRate || 40); }
      }
      return acc;
    }, { conv15: 0, conv68: 0, sugarAmt: 0 });
  }, [dailyEntries, month, year, masterData, isPrimary]);

  useEffect(() => {
    const record = monthlyExpenses.find(r => r.month === month && r.year === year);
    if (record) { setMilkHelperAmt(record.milkHelperAmt); setCookHelperAmt(record.cookHelperAmt); setCylinderCount(record.cylinderCount); setCylinderAmt(record.cylinderAmt); }
    else { const totalHelpers = Object.values(masterData.helpers).reduce((a, b) => Number(a) + Number(b), 0); setMilkHelperAmt(masterData.milkHelperSalary || 0); setCookHelperAmt(totalHelpers * (masterData.cookHelperSalary || 0)); setCylinderCount(0); setCylinderAmt(0); }
  }, [month, year, monthlyExpenses, masterData]);

  const handleSave = () => {
    const newRecord: MonthlyExpenseRecord = { id: `${month}-${year}`, month, year, milkHelperAmt: Number(milkHelperAmt), cookHelperAmt: Number(cookHelperAmt), cylinderCount: Number(cylinderCount), cylinderAmt: Number(cylinderAmt) };
    setMonthlyExpenses((prev: MonthlyExpenseRecord[]) => { const filtered = prev.filter(r => r.id !== newRecord.id); return [...filtered, newRecord]; });
    setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000);
  };
  const handleBack = () => { if (view === 'HISTORY') setView('FORM'); else setPage('DASHBOARD'); };
  const inputStyle = "w-full p-4 border-2 border-slate-300 rounded-xl font-black text-[#000000] bg-[#FFFFFF] focus:border-slate-900 outline-none transition-all shadow-sm mb-4";
  const labelStyle = "text-[14px] font-black text-[#000000] mb-2 block uppercase tracking-tight";
  const readOnlyStyle = "w-full p-4 border-2 border-slate-100 rounded-xl font-black text-slate-500 bg-slate-50 mb-4 cursor-not-allowed";

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="flex items-center gap-1 bg-slate-100 px-3 py-2 rounded-xl text-[12px] font-black text-slate-900 border-2 border-slate-900 active:scale-95 transition-all"><ChevronLeft size={16} /> पीछे जाएं</button>
          <h2 className="text-xl font-black text-[#000000] uppercase tracking-wide">{view === 'FORM' ? 'मासिक खर्च' : 'खर्च इतिहास'}</h2>
        </div>
        <button onClick={() => setView(view === 'FORM' ? 'HISTORY' : 'FORM')} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full text-[13px] font-black text-[#000000] border-2 border-slate-900 shadow-md active:scale-95 transition-all">{view === 'FORM' ? '📜 इतिहास' : '🖊️ नया खर्च'}</button>
      </div>
      {view === 'FORM' ? (
        <div className="space-y-8">
          <div className="flex gap-2"><select className="flex-1 p-3 border-2 border-slate-900 rounded-xl font-black text-[#000000] bg-[#FFFFFF]" value={month} onChange={e => setMonth(Number(e.target.value))}>{MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}</select><select className="flex-1 p-3 border-2 border-slate-900 rounded-xl font-black text-[#000000] bg-[#FFFFFF]" value={year} onChange={e => setYear(Number(e.target.value))}>{YEARS_RANGE.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
          <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-900 shadow-xl space-y-6">
            <div><h3 className="text-md font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">ऑटो-कैलकुलेटेड खर्च (Non-Editable)</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-4"><div><label className={labelStyle}>कन्वर्जन राशि खर्च (कक्षा 1 से 5)</label><div className={readOnlyStyle}>₹ {formatNum(calculatedData.conv15)}</div></div>{!isPrimary && (<div><label className={labelStyle}>कन्वर्जन राशि खर्च (कक्षा 6 से 8)</label><div className={readOnlyStyle}>₹ {formatNum(calculatedData.conv68)}</div></div>)}<div className="md:col-span-2"><label className={labelStyle}>चीनी की राशि खर्च</label><div className={readOnlyStyle}>₹ {formatNum(calculatedData.sugarAmt)}</div></div></div></div>
            <div><h3 className="text-md font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">मैनुअल और एडिटेबल खर्च</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-4"><div><label className={labelStyle}>दूध हेल्पर राशि खर्च</label><input className={inputStyle} type="number" step="0.01" value={milkHelperAmt} onFocus={() => handleFocus(milkHelperAmt, setMilkHelperAmt)} onBlur={() => handleBlur(milkHelperAmt, setMilkHelperAmt)} onChange={e => setMilkHelperAmt(e.target.value)} /></div><div><label className={labelStyle}>कुक कम हेल्पर राशि खर्च</label><input className={inputStyle} type="number" step="0.01" value={cookHelperAmt} onFocus={() => handleFocus(cookHelperAmt, setCookHelperAmt)} onBlur={() => handleBlur(cookHelperAmt, setCookHelperAmt)} onChange={e => setCookHelperAmt(e.target.value)} /></div><div><label className={labelStyle}>दूध सिलेंडर की संख्या</label><input className={inputStyle} type="number" value={cylinderCount} onFocus={() => handleFocus(cylinderCount, setCylinderCount)} onBlur={() => handleBlur(cylinderCount, setCylinderCount)} onChange={e => setCylinderCount(e.target.value)} /></div><div><label className={labelStyle}>दूध सिलेंडर की राशि खर्च</label><input className={inputStyle} type="number" step="0.01" value={cylinderAmt} onFocus={() => handleFocus(cylinderAmt, setCylinderAmt)} onBlur={() => handleBlur(cylinderAmt, setCylinderAmt)} onChange={e => setCylinderAmt(e.target.value)} /></div></div></div>
            <button onClick={handleSave} className="w-full p-8 rounded-[2rem] bg-slate-900 text-white font-black text-2xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all border-4 border-slate-700">मासिक खर्च सुरक्षित करें ✅</button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] border-2 border-slate-900 bg-white shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-[11px]">
              <thead className="bg-slate-900 text-white font-black uppercase sticky top-0">
                <tr><th className="p-4 border-r border-slate-800">माह / वर्ष</th><th className="p-4 border-r border-slate-800">दूध हेल्पर</th><th className="p-4 border-r border-slate-800">कुक हेल्पर</th><th className="p-4">सिलेंडर राशि</th><th className="p-4">✎</th></tr>
              </thead>
              <tbody className="font-black text-[#000000]">
                {monthlyExpenses.sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month)).map(exp => (
                  <tr key={exp.id} className="border-b border-slate-100">
                    <td className="p-4 border-r border-slate-50">{MONTH_NAMES[exp.month]} {exp.year}</td><td className="p-4 border-r border-slate-50">₹{exp.milkHelperAmt}</td><td className="p-4 border-r border-slate-50">₹{exp.cookHelperAmt}</td><td className="p-4">₹{exp.cylinderAmt}</td><td className="p-4"><button onClick={() => { setMonth(exp.month); setYear(exp.year); setView('FORM'); }} className="p-2 bg-slate-100 rounded-lg text-slate-900 active:scale-90 transition-transform"><Edit2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showSuccess && (<div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in zoom-in"><div className="bg-white rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border-4 border-emerald-600 max-w-xs w-full"><CheckCircle2 size={64} className="mx-auto text-emerald-600" /><h3 className="text-xl font-black text-emerald-900 uppercase leading-tight">मासिक खर्च सफलतापूर्वक सुरक्षित किया गया! ✅</h3></div></div>)}
    </div>
  );
};

// --- मासिक रिपोर्ट (Monthly Report) कंपोनेंट ---
const MonthlyReportView = ({ masterData, dailyEntries, stockReceipts, budgetReceipts, monthlyExpenses }: { masterData: MasterData, dailyEntries: DailyEntry[], stockReceipts: StockReceipt[], budgetReceipts: BudgetReceipt[], monthlyExpenses: MonthlyExpenseRecord[] }) => {
  const [month, setMonth] = useState(new Date().getMonth()); const [year, setYear] = useState(new Date().getFullYear()); const isPrimary = masterData.level === SchoolLevel.PRIMARY;
  const reportData = useMemo(() => {
    const startDate = new Date(year, month, 1); const endDate = new Date(year, month + 1, 0);
    const isDateInMonth = (dateStr: string) => { const d = new Date(dateStr); return d >= startDate && d <= endDate; };
    const isDateBeforeMonth = (dateStr: string) => { const d = new Date(dateStr); return d < startDate; };
    const calcDailyForEntry = (e: DailyEntry) => {
      const isRice = e.menuItem?.includes('चावल') || e.menuItem?.includes('खिचड़ी'); const isMilk = e.isMilkDistributed || false;
      const calcCat = (att: number, grainN: number, milkN: number, sugarN: number, convN: number) => { const grainQty = (att * grainN) / 1000; return { wheat: isRice ? 0 : grainQty, rice: isRice ? grainQty : 0, milk: isMilk ? (att * milkN) / 1000 : 0, sugar: isMilk ? (att * sugarN) / 1000 : 0, conv: att * convN }; };
      return { cat15: calcCat(e.att_1_5, masterData.normGrain15, masterData.normMilk15, masterData.normSugar15, masterData.normConv15), cat68: isPrimary ? { wheat:0, rice:0, milk:0, sugar:0, conv:0 } : calcCat(e.att_6_8, masterData.normGrain68, masterData.normMilk68, masterData.normSugar68, masterData.normConv68) };
    };
    const beforeStats = dailyEntries.filter(e => !e.isHoliday && isDateBeforeMonth(e.date)).reduce((acc, e) => {
      const c = calcDailyForEntry(e); acc.w15 += c.cat15.wheat; acc.r15 += c.cat15.rice; acc.m15 += c.cat15.milk; acc.s15 += c.cat15.sugar; acc.c15 += c.cat15.conv;
      acc.w68 += c.cat68.wheat; acc.r68 += c.cat68.rice; acc.m68 += c.cat68.milk; acc.s68 += c.cat68.sugar; acc.c68 += c.cat68.conv; return acc;
    }, { w15:0, r15:0, m15:0, s15:0, c15:0, w68:0, r68:0, m68:0, s68:0, c68:0 });
    const beforeStock = stockReceipts.filter(r => isDateBeforeMonth(r.date)).reduce((acc, r) => {
      const field = r.item === 'WHEAT' ? 'w' : r.item === 'RICE' ? 'r' : 'm'; const cat = r.category === '1-5' ? '15' : '68';
      const isPlus = ['SUPPLIER', 'BORROW_IN', 'RETURN_IN'].includes(r.transactionType);
      if (r.transactionType === 'INTERNAL_TRANSFER') { (acc as any)[`${field}${r.category === '1-5' ? '15' : '68'}`] -= r.amount; (acc as any)[`${field}${r.transferTarget === '1-5' ? '15' : '68'}`] += r.amount; }
      else { (acc as any)[`${field}${cat}`] += isPlus ? r.amount : -r.amount; } return acc;
    }, { w15:0, r15:0, m15:0, w68:0, r68:0, m68:0 });
    const beforeBud = budgetReceipts.filter(r => isDateBeforeMonth(r.date)).reduce((acc, r) => {
      const desc = r.description; if (desc.includes('कन्वर्जन राशि कक्षा 1 से 5')) acc.c15 += r.amount; else if (desc.includes('कन्वर्जन राशि कक्षा 6 से 8')) acc.c68 += r.amount;
      else if (desc.includes('चीनी की राशि कक्षा 1 से 5')) acc.s15 += r.amount; else if (desc.includes('चीनी की राशि कक्षा 6 से 8')) acc.s68 += r.amount;
      else if (desc.includes('कुक कम हेल्पर')) acc.cook += r.amount; else if (desc.includes('दूध हेल्पर')) acc.milkH += r.amount; else if (desc.includes('दूध सिलेंडर')) acc.cyl += r.amount; return acc;
    }, { c15:0, c68:0, s15:0, s68:0, cook:0, milkH:0, cyl:0 });
    const beforeExp = monthlyExpenses.filter(e => { const d = new Date(e.year, e.month, 1); return d < startDate; }).reduce((acc, e) => { acc.cook += e.cookHelperAmt; acc.milkH += e.milkHelperAmt; acc.cyl += e.cylinderAmt; return acc; }, { cook:0, milkH:0, cyl:0 });
    const opening = { w15: masterData.openWheat15 + beforeStock.w15 - beforeStats.w15, r15: masterData.openRice15 + beforeStock.r15 - beforeStats.r15, m15: masterData.openMilk15 + beforeStock.m15 - beforeStats.m15, s15: masterData.openSugar15 + beforeBud.s15 - (beforeStats.s15 * (masterData.sugarRate || 40)), c15: masterData.openConv15 + beforeBud.c15 - beforeStats.c15, w68: masterData.openWheat68 + beforeStock.w68 - beforeStats.w68, r68: masterData.openRice68 + beforeStock.r68 - beforeStats.r68, m68: masterData.openMilk68 + beforeStock.m68 - beforeStats.m68, s68: masterData.openSugar68 + beforeBud.s68 - (beforeStats.s68 * (masterData.sugarRate || 40)), c68: masterData.openConv68 + beforeBud.c68 - beforeStats.c68, cook: masterData.openCookHelper + beforeBud.cook - beforeExp.cook, milkH: masterData.openMilkHelper + beforeBud.milkH - beforeExp.milkH, cyl: masterData.openMilkCylinder + beforeBud.cyl - beforeExp.cyl };
    const receipts = stockReceipts.filter(r => isDateInMonth(r.date)).reduce((acc, r) => {
      const field = r.item === 'WHEAT' ? 'w' : r.item === 'RICE' ? 'r' : 'm'; const cat = r.category === '1-5' ? '15' : '68';
      const isPlus = ['SUPPLIER', 'BORROW_IN', 'RETURN_IN'].includes(r.transactionType);
      if (r.transactionType === 'INTERNAL_TRANSFER') { (acc as any)[`${field}${r.category === '1-5' ? '15' : '68'}`] -= r.amount; (acc as any)[`${field}${r.transferTarget === '1-5' ? '15' : '68'}`] += r.amount; }
      else { (acc as any)[`${field}${cat}`] += isPlus ? r.amount : -r.amount; } return acc;
    }, { w15:0, r15:0, m15:0, w68:0, r68:0, m68:0 });
    const budReceiptsCurrent = budgetReceipts.filter(r => isDateInMonth(r.date)).reduce((acc, r) => {
      const desc = r.description; if (desc.includes('कन्वर्जन राशि कक्षा 1 से 5')) acc.c15 += r.amount; else if (desc.includes('कन्वर्जन राशि कक्षा 6 से 8')) acc.c68 += r.amount;
      else if (desc.includes('चीनी की राशि कक्षा 1 से 5')) acc.s15 += r.amount; else if (desc.includes('चीनी की राशि कक्षा 6 से 8')) acc.s68 += r.amount;
      else if (desc.includes('कुक कम हेल्पर')) acc.cook += r.amount; else if (desc.includes('दूध हेल्पर')) acc.milkH += r.amount; else if (desc.includes('दूध सिलेंडर')) acc.cyl += r.amount; return acc;
    }, { c15:0, c68:0, s15:0, s68:0, cook:0, milkH:0, cyl:0 });
    const currentCons = dailyEntries.filter(e => !e.isHoliday && isDateInMonth(e.date)).reduce((acc, e) => { const c = calcDailyForEntry(e); acc.att15 += e.att_1_5; acc.att68 += e.att_6_8; acc.w15 += c.cat15.wheat; acc.r15 += c.cat15.rice; acc.m15 += c.cat15.milk; acc.s15 += c.cat15.sugar; acc.c15 += c.cat15.conv; acc.w68 += c.cat68.wheat; acc.r68 += c.cat68.rice; acc.m68 += c.cat68.milk; acc.s68 += c.cat68.sugar; acc.c68 += c.cat68.conv; acc.meals += 1; return acc; }, { att15:0, att68:0, w15:0, r15:0, m15:0, s15:0, c15:0, w68:0, r68:0, m68:0, s68:0, c68:0, meals: 0 });
    const currentExp = monthlyExpenses.find(e => e.month === month && e.year === year) || { cookHelperAmt: 0, milkHelperAmt: 0, cylinderAmt: 0, cylinderCount: 0 };
    return { opening, receipts, budReceiptsCurrent, currentCons, currentExp };
  }, [month, year, masterData, dailyEntries, stockReceipts, budgetReceipts, monthlyExpenses, isPrimary]);

  const sectionTitle = "text-md font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-4 uppercase tracking-widest bg-slate-50 p-2 rounded-t-xl";
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 border-b-4 border-slate-900 pb-4"><h2 className="text-2xl font-black text-[#000000] uppercase tracking-wide">विद्यालय मासिक रिपोर्ट 📑</h2><div className="flex gap-2"><select className="flex-1 p-3 border-2 border-slate-900 rounded-xl font-black text-[#000000] bg-[#FFFFFF]" value={month} onChange={e => setMonth(Number(e.target.value))}>{MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}</select><select className="flex-1 p-3 border-2 border-slate-900 rounded-xl font-black text-[#000000] bg-[#FFFFFF]" value={year} onChange={e => setYear(Number(e.target.value))}>{YEARS_RANGE.map(y => <option key={y} value={y}>{y}</option>)}</select></div></div>
      <AdBanner label="रिपोर्ट स्पॉन्सरशिप" />
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-900 shadow-xl overflow-hidden p-6 space-y-8">
        <div className="text-center space-y-1 border-b-2 border-slate-100 pb-4"><h1 className="text-xl font-black text-slate-900">{masterData.schoolName || 'विद्यालय का नाम दर्ज नहीं'}</h1><p className="text-sm font-bold text-slate-500 uppercase">UDISE: {masterData.udiseCode || '---'} | {masterData.block}, {masterData.district}</p><p className="text-xs font-black text-blue-600 uppercase tracking-widest">{MONTH_NAMES[month]} {year} - प्रगति प्रतिवेदन</p></div>
        <section><h3 className={sectionTitle}>1. नामांकन एवं उपस्थिति (Attendance Summary)</h3><div className="grid grid-cols-2 gap-4"><div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[10px] font-black text-slate-500 uppercase">कुल भोजन दिवस</p><p className="text-xl font-black text-slate-900">{reportData.currentCons.meals}</p></div><div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[10px] font-black text-slate-500 uppercase">औसत उपस्थिति</p><p className="text-xl font-black text-slate-900">{reportData.currentCons.meals > 0 ? formatNum((reportData.currentCons.att15 + reportData.currentCons.att68) / reportData.currentCons.meals) : 0}</p></div></div><div className="mt-4 overflow-hidden rounded-xl border border-slate-200"><table className="w-full text-center text-[12px] font-bold"><thead className="bg-slate-900 text-white uppercase text-[10px]"><tr><th className="p-3 text-left">कक्षा</th><th className="p-3">नामांकन</th><th className="p-3">कुल उपस्थिति</th></tr></thead><tbody className="text-slate-900"><tr className="border-b"><td className="p-3 text-left">कक्षा 1-5</td><td className="p-3">{masterData.enroll_1_5}</td><td className="p-3">{reportData.currentCons.att15}</td></tr>{!isPrimary && (<tr><td className="p-3 text-left">कक्षा 6-8</td><td className="p-3">{masterData.enroll_6_8}</td><td className="p-3">{reportData.currentCons.att68}</td></tr>)}</tbody></table></div></section>
        <section><h3 className={sectionTitle}>2. खाद्यान्न एवं दूध स्टॉक विवरण (Stock Details)</h3><div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full text-center text-[10px] font-bold border-collapse"><thead className="bg-slate-900 text-white uppercase"><tr><th className="p-2 text-left border-r border-slate-800">मद (Kg)</th><th className="p-2 border-r border-slate-800">प्रारंभिक शेष</th><th className="p-2 border-r border-slate-800">मासिक प्राप्ति</th><th className="p-2 border-r border-slate-800">मासिक उपभोग</th><th className="p-2">अंतिम शेष</th></tr></thead><tbody className="text-slate-900"><tr className="border-b"><td className="p-2 text-left bg-slate-50">गेहूँ (1-5)</td><td className="p-2">{formatNum(reportData.opening.w15)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.receipts.w15)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentCons.w15)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.w15 + reportData.receipts.w15 - reportData.currentCons.w15)}</td></tr><tr className="border-b"><td className="p-2 text-left bg-slate-50">चावल (1-5)</td><td className="p-2">{formatNum(reportData.opening.r15)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.receipts.r15)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentCons.r15)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.r15 + reportData.receipts.r15 - reportData.currentCons.r15)}</td></tr><tr className="border-b"><td className="p-2 text-left bg-slate-50">दूध पाउडर(1-5)</td><td className="p-2">{formatNum(reportData.opening.m15)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.receipts.m15)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentCons.m15)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.m15 + reportData.receipts.m15 - reportData.currentCons.m15)}</td></tr>{!isPrimary && (<><tr className="border-b"><td className="p-2 text-left bg-slate-50">गेहूँ (6-8)</td><td className="p-2">{formatNum(reportData.opening.w68)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.receipts.w68)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentCons.w68)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.w68 + reportData.receipts.w68 - reportData.currentCons.w68)}</td></tr><tr className="border-b"><td className="p-2 text-left bg-slate-50">चावल (6-8)</td><td className="p-2">{formatNum(reportData.opening.r68)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.receipts.r68)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentCons.r68)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.r68 + reportData.receipts.r68 - reportData.currentCons.r68)}</td></tr><tr className="border-b"><td className="p-2 text-left bg-slate-50">दूध पाउडर(6-8)</td><td className="p-2">{formatNum(reportData.opening.m68)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.receipts.m68)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentCons.m68)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.m68 + reportData.receipts.m68 - reportData.currentCons.m68)}</td></tr></>)}</tbody></table></div></section>
        <section><h3 className={sectionTitle}>3. वित्तीय लेखा-जोखा (Financial Details - ₹)</h3><div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full text-center text-[10px] font-bold border-collapse"><thead className="bg-slate-900 text-white uppercase"><tr><th className="p-2 text-left border-r border-slate-800">मद (₹)</th><th className="p-2 border-r border-slate-800">प्रारंभिक शेष</th><th className="p-2 border-r border-slate-800">मासिक प्राप्ति</th><th className="p-2 border-r border-slate-800">मासिक व्यय</th><th className="p-2">अंतिम शेष</th></tr></thead><tbody className="text-slate-900"><tr className="border-b"><td className="p-2 text-left bg-slate-50">कन्वर्जन (1-5)</td><td className="p-2">{formatNum(reportData.opening.c15)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.budReceiptsCurrent.c15)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentCons.c15)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.c15 + reportData.budReceiptsCurrent.c15 - reportData.currentCons.c15)}</td></tr>{!isPrimary && (<tr className="border-b"><td className="p-2 text-left bg-slate-50">कन्वर्जन (6-8)</td><td className="p-2">{formatNum(reportData.opening.c68)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.budReceiptsCurrent.c68)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentCons.c68)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.c68 + reportData.budReceiptsCurrent.c68 - reportData.currentCons.c68)}</td></tr>)}<tr className="border-b"><td className="p-2 text-left bg-slate-50">चीनी व्यय(कुल)</td><td className="p-2">{formatNum(reportData.opening.s15 + reportData.opening.s68)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.budReceiptsCurrent.s15 + reportData.budReceiptsCurrent.s68)}</td><td className="p-2 text-rose-600">-{formatNum((reportData.currentCons.s15 + reportData.currentCons.s68) * (masterData.sugarRate || 40))}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.s15 + reportData.opening.s68 + reportData.budReceiptsCurrent.s15 + reportData.budReceiptsCurrent.s68 - (reportData.currentCons.s15 + reportData.currentCons.s68) * (masterData.sugarRate || 40))}</td></tr><tr className="border-b"><td className="p-2 text-left bg-slate-50">कुक कम हेल्पर</td><td className="p-2">{formatNum(reportData.opening.cook)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.budReceiptsCurrent.cook)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentExp.cookHelperAmt)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.cook + reportData.budReceiptsCurrent.cook - reportData.currentExp.cookHelperAmt)}</td></tr><tr className="border-b"><td className="p-2 text-left bg-slate-50">दूध हेल्पर राशि</td><td className="p-2">{formatNum(reportData.opening.milkH)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.budReceiptsCurrent.milkH)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentExp.milkHelperAmt)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.milkH + reportData.budReceiptsCurrent.milkH - reportData.currentExp.milkHelperAmt)}</td></tr><tr className="border-b"><td className="p-2 text-left bg-slate-50">दूध सिलेंडर</td><td className="p-2">{formatNum(reportData.opening.cyl)}</td><td className="p-2 text-emerald-600">+{formatNum(reportData.budReceiptsCurrent.cyl)}</td><td className="p-2 text-rose-600">-{formatNum(reportData.currentExp.cylinderAmt)}</td><td className="p-2 bg-slate-50 font-black">{formatNum(reportData.opening.cyl + reportData.budReceiptsCurrent.cyl - reportData.currentExp.cylinderAmt)}</td></tr></tbody></table></div></section>
        <button onClick={() => window.print()} className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-transform no-print border-2 border-slate-700"><Printer /> प्रिंट रिपोर्ट 🖨️</button>
      </div>
      <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex items-start gap-3"><AlertTriangle className="text-amber-600 shrink-0" size={20} /><p className="text-[11px] font-bold text-amber-900">नोट: यह रिपोर्ट आपके द्वारा दैनिक प्रविष्टि, स्टॉक प्राप्ति और मासिक खर्च में भरे गए डेटा के आधार पर तैयार की गई है। कृपया सुनिश्चित करें कि आपने सभी प्रविष्टियाँ सही भरी हैं।</p></div>
    </div>
  );
};

// --- मास्टर डेटा फ़ॉर्म (Master Form) कंपोनेंट ---
const MasterFormView = ({ masterData, setMasterData, setPage }: { masterData: MasterData, setMasterData: any, setPage: (p: Page) => void }) => {
  const [formData, setFormData] = useState<MasterData>(masterData); const [showSuccess, setShowSuccess] = useState(false); const isPrimary = formData.level === SchoolLevel.PRIMARY;
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, field: string, subField?: string) => { const val = subField ? (formData as any)[field][subField] : (formData as any)[field]; if (Number(val) === 0) { if (subField) setFormData(prev => ({ ...prev, [field]: { ...prev.helpers, [subField]: "" } })); else setFormData(prev => ({ ...prev, [field]: "" })); } };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, field: string, subField?: string) => { const val = subField ? (formData as any)[field][subField] : (formData as any)[field]; if (val === "" || val === undefined) { if (subField) setFormData(prev => ({ ...prev, [field]: { ...prev.helpers, [subField]: 0 } })); else setFormData(prev => ({ ...prev, [field]: 0 })); } };
  const handleChange = (field: keyof MasterData, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleHelperChange = (field: keyof CookHelperStats, value: any) => setFormData(prev => ({ ...prev, helpers: { ...prev.helpers, [field]: value } }));
  const handleSave = () => { setMasterData({ ...formData, lastUpdated: new Date().toISOString() }); setShowSuccess(true); setTimeout(() => { setShowSuccess(false); setPage('DASHBOARD'); }, 2000); };
  const inputStyle = "w-full p-4 border-2 border-slate-300 rounded-xl font-black text-[#000000] bg-[#FFFFFF] focus:border-slate-900 outline-none transition-all shadow-sm mb-4";
  const labelStyle = "text-[14px] font-black text-[#000000] mb-2 block uppercase tracking-tight";
  const sectionTitle = "text-lg font-black text-slate-900 border-b-4 border-slate-900 pb-2 mb-6 uppercase tracking-widest mt-8 flex items-center gap-2";
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2"><h2 className="text-xl font-black text-[#000000] uppercase tracking-wide">मास्टर सेट-अप ⚙️</h2><button onClick={() => setPage('DASHBOARD')} className="p-2 hover:bg-slate-100 rounded-full"><XCircle /></button></div>
      <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-900 shadow-xl">
        <h3 className={sectionTitle}><UserCheck size={20} /> 1. विद्यालय प्रोफाइल (School Profile)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4"><div className="md:col-span-2"><label className={labelStyle}>विद्यालय का नाम</label><input className={inputStyle} value={formData.schoolName} onChange={e => handleChange('schoolName', e.target.value)} /></div><div><label className={labelStyle}>विद्यालय का स्तर</label><select className={inputStyle} value={formData.level} onChange={e => handleChange('level', e.target.value)}>{Object.values(SchoolLevel).map(l => <option key={l} value={l}>{l}</option>)}</select></div><div><label className={labelStyle}>यू-डाइस कोड</label><input className={inputStyle} value={formData.udiseCode} onChange={e => handleChange('udiseCode', e.target.value)} /></div><div><label className={labelStyle}>प्रभारी का नाम</label><input className={inputStyle} value={formData.inchargeName} onChange={e => handleChange('inchargeName', e.target.value)} /></div><div><label className={labelStyle}>नामांकन कक्षा 1 से 5</label><input className={inputStyle} type="number" value={formData.enroll_1_5} onFocus={(e) => handleFocus(e, 'enroll_1_5')} onBlur={(e) => handleBlur(e, 'enroll_1_5')} onChange={e => handleChange('enroll_1_5', e.target.value)} /></div>{!isPrimary && (<div><label className={labelStyle}>नामांकन कक्षा 6 से 8</label><input className={inputStyle} type="number" value={formData.enroll_6_8} onFocus={(e) => handleFocus(e, 'enroll_6_8')} onBlur={(e) => handleBlur(e, 'enroll_6_8')} onChange={e => handleChange('enroll_6_8', e.target.value)} /></div>)}<div><label className={labelStyle}>ब्लॉक</label><input className={inputStyle} value={formData.block} onChange={e => handleChange('block', e.target.value)} /></div><div><label className={labelStyle}>जिला</label><input className={inputStyle} value={formData.district} onChange={e => handleChange('district', e.target.value)} /></div><div><label className={labelStyle}>वित्तीय वर्ष</label><input className={inputStyle} value={formData.financialYear} onChange={e => handleChange('financialYear', e.target.value)} /></div></div>
        <h3 className={sectionTitle}><PackageSearch size={20} /> 2. प्रारंभिक शेष (Opening Balance - 01 April)</h3>
        <div className="space-y-6"><div className="bg-slate-50 p-4 rounded-2xl border border-slate-200"><h4 className="font-black text-xs uppercase mb-4 text-slate-500">कक्षा 1 से 5 हेतु</h4><div className="grid grid-cols-2 gap-4"><div><label className={labelStyle}>प्रारंभिक गेहूँ (Kg)</label><input className={inputStyle} type="number" step="0.00001" value={formData.openWheat15} onFocus={(e) => handleFocus(e, 'openWheat15')} onBlur={(e) => handleBlur(e, 'openWheat15')} onChange={e => handleChange('openWheat15', e.target.value)} /></div><div><label className={labelStyle}>प्रारंभिक चावल (Kg)</label><input className={inputStyle} type="number" step="0.00001" value={formData.openRice15} onFocus={(e) => handleFocus(e, 'openRice15')} onBlur={(e) => handleBlur(e, 'openRice15')} onChange={e => handleChange('openRice15', e.target.value)} /></div><div><label className={labelStyle}>प्रारंभिक दूध पाउडर (Kg)</label><input className={inputStyle} type="number" step="0.00001" value={formData.openMilk15} onFocus={(e) => handleFocus(e, 'openMilk15')} onBlur={(e) => handleBlur(e, 'openMilk15')} onChange={e => handleChange('openMilk15', e.target.value)} /></div><div><label className={labelStyle}>प्रारंभिक कन्वर्जन राशि (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.openConv15} onFocus={(e) => handleFocus(e, 'openConv15')} onBlur={(e) => handleBlur(e, 'openConv15')} onChange={e => handleChange('openConv15', e.target.value)} /></div><div className="col-span-2"><label className={labelStyle}>प्रारंभिक चीनी की राशि (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.openSugar15} onFocus={(e) => handleFocus(e, 'openSugar15')} onBlur={(e) => handleBlur(e, 'openSugar15')} onChange={e => handleChange('openSugar15', e.target.value)} /></div></div></div>{!isPrimary && (<div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100"><h4 className="font-black text-xs uppercase mb-4 text-blue-600">कक्षा 6 से 8 हेतु</h4><div className="grid grid-cols-2 gap-4"><div><label className={labelStyle}>प्रारंभिक गेहूँ (Kg)</label><input className={inputStyle} type="number" step="0.00001" value={formData.openWheat68} onFocus={(e) => handleFocus(e, 'openWheat68')} onBlur={(e) => handleBlur(e, 'openWheat68')} onChange={e => handleChange('openWheat68', e.target.value)} /></div><div><label className={labelStyle}>प्रारंभिक चावल (Kg)</label><input className={inputStyle} type="number" step="0.00001" value={formData.openRice68} onFocus={(e) => handleFocus(e, 'openRice68')} onBlur={(e) => handleBlur(e, 'openRice68')} onChange={e => handleChange('openRice68', e.target.value)} /></div><div><label className={labelStyle}>प्रारंभिक दूध पाउडर (Kg)</label><input className={inputStyle} type="number" step="0.00001" value={formData.openMilk68} onFocus={(e) => handleFocus(e, 'openMilk68')} onBlur={(e) => handleBlur(e, 'openMilk68')} onChange={e => handleChange('openMilk68', e.target.value)} /></div><div><label className={labelStyle}>प्रारंभिक कन्वर्जन राशि (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.openConv68} onFocus={(e) => handleFocus(e, 'openConv68')} onBlur={(e) => handleBlur(e, 'openConv68')} onChange={e => handleChange('openConv68', e.target.value)} /></div><div className="col-span-2"><label className={labelStyle}>प्रारंभिक चीनी की राशि (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.openSugar68} onFocus={(e) => handleFocus(e, 'openSugar68')} onBlur={(e) => handleBlur(e, 'openSugar68')} onChange={e => handleChange('openSugar68', e.target.value)} /></div></div></div>)}</div>
        <h3 className={sectionTitle}><IndianRupee size={20} /> 3. संयुक्त प्रारंभिक शेष एवं मानदेय सेटअप</h3>
        <div className="grid grid-cols-1 gap-1 bg-slate-50 p-4 rounded-2xl"><div><label className={labelStyle}>प्रारंभिक दूध सिलेंडर राशि (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.openMilkCylinder} onFocus={(e) => handleFocus(e, 'openMilkCylinder')} onBlur={(e) => handleBlur(e, 'openMilkCylinder')} onChange={e => handleChange('openMilkCylinder', e.target.value)} /></div><div><label className={labelStyle}>प्रारंभिक कुक कम हेल्पर राशि (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.openCookHelper} onFocus={(e) => handleFocus(e, 'openCookHelper')} onBlur={(e) => handleBlur(e, 'openCookHelper')} onChange={e => handleChange('openCookHelper', e.target.value)} /></div><div><label className={labelStyle}>प्रारंभिक दूध हेल्पर राशि (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.openMilkHelper} onFocus={(e) => handleFocus(e, 'openMilkHelper')} onBlur={(e) => handleBlur(e, 'openMilkHelper')} onChange={e => handleChange('openMilkHelper', e.target.value)} /></div></div>
        <h3 className={sectionTitle}><RefreshCw size={20} /> 4. दूध हेल्पर सेटअप</h3>
        <div className="grid grid-cols-2 gap-4"><div><label className={labelStyle}>दूध हेल्पर की कुल संख्या</label><input className={inputStyle} type="number" value={formData.milkHelperCount} onFocus={(e) => handleFocus(e, 'milkHelperCount')} onBlur={(e) => handleBlur(e, 'milkHelperCount')} onChange={e => handleChange('milkHelperCount', e.target.value)} /></div><div><label className={labelStyle}>दूध हेल्पर का मासिक मानदेय/खर्च (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.milkHelperSalary} onFocus={(e) => handleFocus(e, 'milkHelperSalary')} onBlur={(e) => handleBlur(e, 'milkHelperSalary')} onChange={e => handleChange('milkHelperSalary', e.target.value)} /></div></div>
        <h3 className={sectionTitle}><Hammer size={20} /> 5. प्रति विद्यार्थी खपत मात्रा (Consumption Norms)</h3>
        <div className="space-y-4"><div className="bg-slate-50 p-4 rounded-2xl border border-slate-200"><h4 className="font-black text-xs uppercase mb-3 text-slate-500">कक्षा 1 से 5 हेतु मात्रा (ग्राम में)</h4><div className="grid grid-cols-2 gap-4"><div><label className={labelStyle}>कन्वर्जन (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.normConv15} onFocus={(e) => handleFocus(e, 'normConv15')} onBlur={(e) => handleBlur(e, 'normConv15')} onChange={e => handleChange('normConv15', e.target.value)} /></div><div><label className={labelStyle}>अनाज (g)</label><input className={inputStyle} type="number" value={formData.normGrain15} onFocus={(e) => handleFocus(e, 'normGrain15')} onBlur={(e) => handleBlur(e, 'normGrain15')} onChange={e => handleChange('normGrain15', e.target.value)} /></div><div><label className={labelStyle}>दूध पाउडर (g)</label><input className={inputStyle} type="number" value={formData.normMilk15} onFocus={(e) => handleFocus(e, 'normMilk15')} onBlur={(e) => handleBlur(e, 'normMilk15')} onChange={e => handleChange('normMilk15', e.target.value)} /></div><div><label className={labelStyle}>चीनी की मात्रा (g)</label><input className={inputStyle} type="number" step="0.01" value={formData.normSugar15} onFocus={(e) => handleFocus(e, 'normSugar15')} onBlur={(e) => handleBlur(e, 'normSugar15')} onChange={e => handleChange('normSugar15', e.target.value)} /></div></div></div>{!isPrimary && (<div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100"><h4 className="font-black text-xs uppercase mb-3 text-blue-600">कक्षा 6 से 8 हेतु मात्रा (ग्राम में)</h4><div className="grid grid-cols-2 gap-4"><div><label className={labelStyle}>कन्वर्जन (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.normConv68} onFocus={(e) => handleFocus(e, 'normConv68')} onBlur={(e) => handleBlur(e, 'normConv68')} onChange={e => handleChange('normConv68', e.target.value)} /></div><div><label className={labelStyle}>अनाज (g)</label><input className={inputStyle} type="number" value={formData.normGrain68} onFocus={(e) => handleFocus(e, 'normGrain68')} onBlur={(e) => handleBlur(e, 'normGrain68')} onChange={e => handleChange('normGrain68', e.target.value)} /></div><div><label className={labelStyle}>दूध पाउडर (g)</label><input className={inputStyle} type="number" value={formData.normMilk68} onFocus={(e) => handleFocus(e, 'normMilk68')} onBlur={(e) => handleBlur(e, 'normMilk68')} onChange={e => handleChange('normMilk68', e.target.value)} /></div><div><label className={labelStyle}>चीनी की मात्रा (g)</label><input className={inputStyle} type="number" step="0.01" value={formData.normSugar68} onFocus={(e) => handleFocus(e, 'normSugar68')} onBlur={(e) => handleBlur(e, 'normSugar68')} onChange={e => handleChange('normSugar68', e.target.value)} /></div></div></div>)}</div>
        <h3 className={sectionTitle}><UserCheck size={20} /> 6. कुक कम हेल्पर संख्या (Helper Table)</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6"><table className="w-full text-center border-collapse text-[12px] font-black"><thead className="bg-slate-900 text-white uppercase"><tr><th className="p-3 text-left">श्रेणी</th><th className="p-3">पुरुष</th><th className="p-3">स्त्री</th></tr></thead><tbody className="bg-white">{(['st', 'sc', 'obc', 'gen'] as const).map(cat => (<tr key={cat} className="border-b"><td className="p-3 text-left uppercase text-slate-500">{cat}</td><td className="p-1"><input className="w-full p-2 text-center bg-white text-black outline-none" type="number" value={formData.helpers[`${cat}_m` as keyof CookHelperStats]} onFocus={(e) => handleFocus(e, 'helpers', `${cat}_m`)} onBlur={(e) => handleBlur(e, 'helpers', `${cat}_m`)} onChange={handleHelperChange.bind(null, `${cat}_m` as any)} /></td><td className="p-1"><input className="w-full p-2 text-center bg-white text-black outline-none" type="number" value={formData.helpers[`${cat}_f` as keyof CookHelperStats]} onFocus={(e) => handleFocus(e, 'helpers', `${cat}_f`)} onBlur={(e) => handleBlur(e, 'helpers', `${cat}_f`)} onChange={handleHelperChange.bind(null, `${cat}_f` as any)} /></td></tr>))} <tr className="bg-slate-100"><td className="p-3 text-left uppercase">कुल संख्या</td><td colSpan={2} className="p-3 text-center text-lg">{Object.values(formData.helpers).reduce((a, b) => Number(a) + Number(b), 0)}</td></tr></tbody></table></div><div><label className={labelStyle}>कुक कम हेल्पर का मासिक मानदेय/खर्च (₹)</label><input className={inputStyle} type="number" step="0.01" value={formData.cookHelperSalary} onFocus={(e) => handleFocus(e, 'cookHelperSalary')} onBlur={(e) => handleBlur(e, 'cookHelperSalary')} onChange={e => handleChange('cookHelperSalary', e.target.value)} /></div>
        <h3 className={sectionTitle}><IndianRupee size={20} /> 7. चीनी की दर (Sugar Rate)</h3>
        <div><label className={labelStyle}>चीनी की वर्तमान दर (₹/kg)</label><input className={inputStyle} type="number" step="0.01" value={formData.sugarRate} onFocus={(e) => handleFocus(e, 'sugarRate')} onBlur={(e) => handleBlur(e, 'sugarRate')} onChange={e => handleChange('sugarRate', e.target.value)} /></div>
        <button onClick={handleSave} className="w-full mt-10 p-8 rounded-[2rem] bg-slate-900 text-white font-black text-2xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all border-4 border-slate-700">मास्टर डेटा अपडेट करें ✅</button>
      </div>
      {showSuccess && (<div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in zoom-in"><div className="bg-white rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border-4 border-emerald-600 max-w-xs w-full"><CheckCircle2 size={64} className="mx-auto text-emerald-600" /><h3 className="text-xl font-black text-emerald-900 uppercase leading-tight">मास्टर डेटा सफलतापूर्वक अपडेट हुआ! ✅</h3></div></div>)}
    </div>
  );
};

// --- बैकअप और रिस्टोर (Backup and Restore) कंपोनेंट ---
const BackupRestoreView = ({ setPage }: { setPage: (p: Page) => void }) => {
  const handleExport = () => { const data = { master: JSON.parse(localStorage.getItem('mdm_master') || '{}'), daily: JSON.parse(localStorage.getItem('mdm_daily') || '[]'), stock: JSON.parse(localStorage.getItem('mdm_stock') || '[]'), budget: JSON.parse(localStorage.getItem('mdm_budget') || '[]'), monthly_expenses: JSON.parse(localStorage.getItem('mdm_monthly_expenses') || '[]'), exportedAt: new Date().toISOString() }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `mdm_backup_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const data = JSON.parse(event.target?.result as string); if (window.confirm('क्या आप डेटा रिस्टोर करना चाहते हैं? इससे वर्तमान डेटा डिलीट हो जाएगा।')) { if (data.master) localStorage.setItem('mdm_master', JSON.stringify(data.master)); if (data.daily) localStorage.setItem('mdm_daily', JSON.stringify(data.daily)); if (data.stock) localStorage.setItem('mdm_stock', JSON.stringify(data.stock)); if (data.budget) localStorage.setItem('mdm_budget', JSON.stringify(data.budget)); if (data.monthly_expenses) localStorage.setItem('mdm_monthly_expenses', JSON.stringify(data.monthly_expenses)); alert('डेटा सफलतापूर्वक रिस्टोर हो गया! कृपया पेज रिफ्रेश करें।'); window.location.reload(); } } catch (err) { alert('गलत फाइल फॉर्मेट!'); } }; reader.readAsText(file); };
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2"><h2 className="text-xl font-black text-[#000000] uppercase tracking-wide">बैकअप और रिस्टोर 🛡️</h2><button onClick={() => setPage('DASHBOARD')} className="p-2 hover:bg-slate-100 rounded-full"><XCircle /></button></div>
      <div className="grid grid-cols-1 gap-6"><div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-xl space-y-4 text-center"><Download size={48} className="mx-auto text-blue-600" /><h3 className="text-lg font-black uppercase">डेटा बैकअप लें</h3><p className="text-sm font-bold text-slate-500">अपना सारा डेटा सुरक्षित रूप से फाइल में सेव करें।</p><button onClick={handleExport} className="w-full p-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest active:scale-95 transition-all">Download Backup 📥</button></div><div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-xl space-y-4 text-center"><Upload size={48} className="mx-auto text-emerald-600" /><h3 className="text-lg font-black uppercase">डेटा रिस्टोर करें</h3><p className="text-sm font-bold text-slate-500">पुरानी बैकअप फाइल से डेटा वापस लाएं।</p><label className="w-full p-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest active:scale-95 transition-all cursor-pointer block text-center">Select Backup File 📤<input type="file" accept=".json" onChange={handleImport} className="hidden" /></label></div></div>
    </div>
  );
};

// --- मुख्य App कंपोनेंट ---
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('DASHBOARD');
  const [pageHistory, setPageHistory] = useState<Page[]>([]);
  const [masterData, setMasterData] = useState<MasterData>(() => { const saved = localStorage.getItem('mdm_master'); return saved ? JSON.parse(saved) : INITIAL_MASTER_DATA; });
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>(() => { const saved = localStorage.getItem('mdm_daily'); return saved ? JSON.parse(saved) : []; });
  const [stockReceipts, setStockReceipts] = useState<StockReceipt[]>(() => { const saved = localStorage.getItem('mdm_stock'); return saved ? JSON.parse(saved) : []; });
  const [budgetReceipts, setBudgetReceipts] = useState<BudgetReceipt[]>(() => { const saved = localStorage.getItem('mdm_budget'); return saved ? JSON.parse(saved) : []; });
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpenseRecord[]>(() => { const saved = localStorage.getItem('mdm_monthly_expenses'); return saved ? JSON.parse(saved) : []; });
  const [editingEntryId, setEditingId] = useState<string | null>(null);

  useEffect(() => localStorage.setItem('mdm_master', JSON.stringify(masterData)), [masterData]);
  useEffect(() => localStorage.setItem('mdm_daily', JSON.stringify(dailyEntries)), [dailyEntries]);
  useEffect(() => localStorage.setItem('mdm_stock', JSON.stringify(stockReceipts)), [stockReceipts]);
  useEffect(() => localStorage.setItem('mdm_budget', JSON.stringify(budgetReceipts)), [budgetReceipts]);
  useEffect(() => localStorage.setItem('mdm_monthly_expenses', JSON.stringify(monthlyExpenses)), [monthlyExpenses]);

  const navigateTo = (to: Page) => { if (to !== currentPage) { setPageHistory(prev => [...prev, currentPage]); setCurrentPage(to); } };
  const goBack = () => { if (pageHistory.length > 0) { const prev = pageHistory[pageHistory.length - 1]; setPageHistory(prevHistory => prevHistory.slice(0, -1)); setCurrentPage(prev); } else { setCurrentPage('DASHBOARD'); } };

  const dashboardStats = useMemo(() => {
    const isPrimary = masterData.level === SchoolLevel.PRIMARY;
    const calcCons = (cat: '1-5' | '6-8') => {
      const is68 = cat === '6-8'; const grainNorm = is68 ? masterData.normGrain68 : masterData.normGrain15; const milkNorm = is68 ? masterData.normMilk68 : masterData.normMilk15; const sugarNorm = is68 ? masterData.normSugar68 : masterData.normSugar15; const convNorm = is68 ? masterData.normConv68 : masterData.normConv15;
      return dailyEntries.reduce((acc, e) => {
        if (e.isHoliday) return acc; const att = is68 ? e.att_6_8 : e.att_1_5; const isRice = e.menuItem?.includes('चावल') || e.menuItem?.includes('खिचड़ी'); const isMilk = e.isMilkDistributed || false; const grainQty = (att * grainNorm) / 1000;
        acc.wheat += isRice ? 0 : grainQty; acc.rice += isRice ? grainQty : 0; acc.milk += isMilk ? (att * milkNorm) / 1000 : 0; acc.sugarMoney += isMilk ? (att * sugarNorm / 1000) * (masterData.sugarRate || 40) : 0; acc.convMoney += att * convNorm; return acc;
      }, { wheat: 0, rice: 0, milk: 0, sugarMoney: 0, convMoney: 0 });
    };
    const cons15 = calcCons('1-5'); const cons68 = isPrimary ? { wheat: 0, rice: 0, milk: 0, sugarMoney: 0, convMoney: 0 } : calcCons('6-8');
    const getStockCurrent = (item: string, cat: '1-5' | '6-8') => { return stockReceipts.filter(r => r.item === item).reduce((sum, r) => { let delta = 0; if (r.transactionType === 'INTERNAL_TRANSFER') { if (r.category === cat) delta -= r.amount; if (r.transferTarget === cat) delta += r.amount; } else if (r.category === cat) { const factor = ['LEND_OUT', 'REPAY_OUT'].includes(r.transactionType) ? -1 : 1; delta = r.amount * factor; } return sum + delta; }, 0); };
    const getBud = (head: string) => budgetReceipts.filter(r => r.description.startsWith(head)).reduce((a, b) => a + b.amount, 0);
    const totalCylinderSpent = monthlyExpenses.reduce((a, b) => a + (b.cylinderAmt || 0), 0); const totalMilkHelperPaid = monthlyExpenses.reduce((a, b) => a + (b.milkHelperAmt || 0), 0); const totalCookHelperPaid = monthlyExpenses.reduce((a, b) => a + (b.cookHelperAmt || 0), 0);
    return {
      wheat15: formatNum(masterData.openWheat15 + getStockCurrent('WHEAT', '1-5') - cons15.wheat), wheat68: isPrimary ? 0 : formatNum(masterData.openWheat68 + getStockCurrent('WHEAT', '6-8') - cons68.wheat),
      rice15: formatNum(masterData.openRice15 + getStockCurrent('RICE', '1-5') - cons15.rice), rice68: isPrimary ? 0 : formatNum(masterData.openRice68 + getStockCurrent('RICE', '6-8') - cons68.rice),
      conv15: formatNum(masterData.openConv15 + getBud('कन्वर्जन राशि कक्षा 1 से 5') - cons15.convMoney), conv68: isPrimary ? 0 : formatNum(masterData.openConv68 + getBud('कन्वर्जन राशि कक्षा 6 से 8') - cons68.convMoney),
      milk15: formatNum(masterData.openMilk15 + getStockCurrent('MILK', '1-5') - cons15.milk), milk68: isPrimary ? 0 : formatNum(masterData.openMilk68 + getStockCurrent('MILK', '6-8') - cons68.milk),
      sugar15: formatNum(masterData.openSugar15 + getBud('चीनी की राशि कक्षा 1 से 5') - cons15.sugarMoney), sugar68: isPrimary ? 0 : formatNum(masterData.openSugar68 + getBud('चीनी की राशि कक्षा 6 से 8') - cons68.sugarMoney),
      cookHelper: formatNum(masterData.openCookHelper + getBud('कुक कम हेल्पर राशि (संयुक्त)') - totalCookHelperPaid), milkCylinder: formatNum(masterData.openMilkCylinder + getBud('दूध सिलेंडर राशि (संयुक्त)') - totalCylinderSpent), milkHelper: formatNum(masterData.openMilkHelper + getBud('दूध हेल्पर राशि (संयुक्त)') - totalMilkHelperPaid)
    };
  }, [masterData, dailyEntries, stockReceipts, budgetReceipts, monthlyExpenses]);

  return (
    <div className="min-h-screen flex flex-col font-['Hind'] bg-slate-50 text-slate-900">
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          {currentPage !== 'DASHBOARD' && (<button onClick={goBack} className="p-1.5 hover:bg-slate-800 rounded-lg active:scale-90 transition-transform flex items-center justify-center bg-slate-800/50"><ChevronLeft size={24} /></button>)}
          <h1 className="text-xl font-bold tracking-tight">{masterData.schoolName || 'MDM राजस्थान सहायक'}</h1>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto">
        {currentPage === 'DASHBOARD' && <Dashboard stats={dashboardStats} isPrimary={masterData.level === SchoolLevel.PRIMARY} setPage={navigateTo} />}
        {currentPage === 'HISTORY_MENU' && <HistoryMenuView setPage={navigateTo} />}
        {currentPage === 'DAILY' && <DailyEntryFormView masterData={masterData} dailyEntries={dailyEntries} setDailyEntries={setDailyEntries} editingId={editingEntryId} setEditingId={setEditingId} setPage={navigateTo} onBack={goBack} initialView="FORM" />}
        {currentPage === 'HISTORY' && <DailyEntryFormView masterData={masterData} dailyEntries={dailyEntries} setDailyEntries={setDailyEntries} editingId={editingEntryId} setEditingId={setEditingId} setPage={navigateTo} onBack={goBack} initialView="HISTORY" />}
        {currentPage === 'STOCK' && <StockReceiptFormView masterData={masterData} stockReceipts={stockReceipts} setStockReceipts={setStockReceipts} setPage={navigateTo} initialView="FORM" />}
        {currentPage === 'STOCK_HISTORY' && <StockReceiptFormView masterData={masterData} stockReceipts={stockReceipts} setStockReceipts={setStockReceipts} setPage={navigateTo} initialView="HISTORY" />}
        {currentPage === 'BUDGET' && <BudgetReceiptFormView masterData={masterData} budgetReceipts={budgetReceipts} setBudgetReceipts={setBudgetReceipts} setPage={navigateTo} initialView="FORM" />}
        {currentPage === 'BUDGET_HISTORY' && <BudgetReceiptFormView masterData={masterData} budgetReceipts={budgetReceipts} setBudgetReceipts={setBudgetReceipts} setPage={navigateTo} initialView="HISTORY" />}
        {currentPage === 'MONTHLY_EXPENSE' && <MonthlyExpenseView masterData={masterData} dailyEntries={dailyEntries} monthlyExpenses={monthlyExpenses} setMonthlyExpenses={setMonthlyExpenses} setPage={navigateTo} initialView="FORM" />}
        {currentPage === 'EXPENSE_HISTORY' && <MonthlyExpenseView masterData={masterData} dailyEntries={dailyEntries} monthlyExpenses={monthlyExpenses} setMonthlyExpenses={setMonthlyExpenses} setPage={navigateTo} initialView="HISTORY" />}
        {currentPage === 'REPORT' && <MonthlyReportView masterData={masterData} dailyEntries={dailyEntries} stockReceipts={stockReceipts} budgetReceipts={budgetReceipts} monthlyExpenses={monthlyExpenses} />}
        {currentPage === 'BACKUP' && <BackupRestoreView setPage={navigateTo} />}
        {currentPage === 'MASTER' && <MasterFormView masterData={masterData} setMasterData={setMasterData} setPage={navigateTo} />}
      </main>
      {currentPage === 'DASHBOARD' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full px-6 max-w-xs no-print hide-on-keyboard">
          <button onClick={() => navigateTo('DAILY')} className="w-full bg-slate-900 text-white py-5 rounded-full font-black shadow-2xl flex items-center justify-center gap-4 border-2 border-slate-700 active:scale-95 transition-transform"><PlusCircle size={32} /><span className="text-xl uppercase tracking-tighter">दैनिक एंट्री</span></button>
        </div>
      )}
    </div>
  );
};

export default App;