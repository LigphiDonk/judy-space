import { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Droplet, Frown, Coffee } from 'lucide-react';
import { cn } from '../lib/utils';
import { CycleRecord } from '../types';

export function CycleTracker() {
  const { state, updateState } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const records = state?.cycleRecords || {};

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = monthStart; 
  // Normally you'd want to pad with previous month days to align weeks, 
  // but for simplicity we'll just drift or pad simply.
  const startDayOfWeek = monthStart.getDay(); 
  const adjustedStartDate = new Date(startDate);
  adjustedStartDate.setDate(adjustedStartDate.getDate() - startDayOfWeek);
  
  const endDayOfWeek = monthEnd.getDay();
  const adjustedEndDate = new Date(monthEnd);
  adjustedEndDate.setDate(adjustedEndDate.getDate() + (6 - endDayOfWeek));

  const monthDays = eachDayOfInterval({ start: adjustedStartDate, end: adjustedEndDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const getRecordForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return records[dateStr];
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 relative h-full flex flex-col">
      <header className="pt-4 pb-4">
        <h1 className="text-2xl font-bold text-primary-600 flex items-center gap-2"><span>🌸</span> 经期小助手</h1>
        <p className="text-sm text-gray-400 mt-1">记得多喝热水，早点休息哦～</p>
      </header>

      {/* Cute Info Banner */}
      <div className="bg-[#FFB7B2] rounded-[2rem] p-6 text-white mb-6 cute-shadow relative overflow-hidden shrink-0">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">本月状态</h3>
            <p className="text-sm text-white/90">
              点选下方日历，记录经期的开始和结束，<br/>
              还能把每天的心情和痛痛写下来哦！
            </p>
          </div>
          <div className="text-5xl drop-shadow-lg">🦢</div>
        </div>
        <div className="absolute -right-6 -bottom-6 text-8xl opacity-10 blur-[2px]">🌸</div>
      </div>

      <div className="bg-white rounded-[2rem] p-4 md:p-6 cute-shadow border-2 border-primary-100 flex-1 overflow-y-auto">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-primary-50 rounded-full text-primary-400">
            <ChevronLeft />
          </button>
          <div className="text-lg font-bold text-gray-800 font-sans">
            {format(currentDate, 'yyyy年 MM月')}
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-primary-50 rounded-full text-primary-400">
            <ChevronRight />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="text-xs font-bold text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 gap-y-3">
          {monthDays.map(day => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            const record = getRecordForDay(day);
            const hasFlow = record && record.status !== 'none';
            
            return (
              <div 
                key={day.toString()} 
                onClick={() => handleDayClick(day)}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all relative",
                  !isCurrentMonth && "text-gray-300",
                  isCurrentMonth && !isSelected && !isDayToday && "text-gray-700 hover:bg-primary-50",
                  isDayToday && !isSelected && "bg-primary-100 text-primary-600",
                  isSelected && "bg-primary-400 text-white scale-110 z-10 cute-shadow",
                  hasFlow && !isSelected && "bg-primary-300 text-white font-bold"
                )}>
                  {format(day, 'd')}
                  {/* Subtle indicator for flow */}
                  {hasFlow && (
                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-rose-400 rounded-full border-2 border-white"></div>
                  )}
                  {record?.symptoms && record.symptoms.length > 0 && !hasFlow && (
                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-300 rounded-full border-2 border-white"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor Drawer */}
      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDate(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-20 rounded-2xl md:rounded-none"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-primary-100 pb-safe md:mx-4 md:mb-4 md:rounded-3xl"
            >
              <RecordEditor 
                date={selectedDate} 
                record={getRecordForDay(selectedDate)}
                onSave={(newRecord) => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  updateState({
                    cycleRecords: {
                      ...records,
                      [dateStr]: newRecord
                    }
                  });
                  setSelectedDate(null);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecordEditor({ date, record, onSave }: { date: Date; record?: CycleRecord; onSave: (r: CycleRecord) => void }) {
  const [status, setStatus] = useState<CycleRecord['status']>(record?.status || 'none');
  const [symptoms, setSymptoms] = useState<string[]>(record?.symptoms || []);
  const [notes, setNotes] = useState(record?.notes || '');

  const toggleSymptom = (s: string) => {
    if (symptoms.includes(s)) setSymptoms(symptoms.filter(x => x !== s));
    else setSymptoms([...symptoms, s]);
  };

  const handleSave = () => {
    onSave({
      date: format(date, 'yyyy-MM-dd'),
      status,
      symptoms,
      notes
    });
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h3 className="text-xl font-bold text-gray-800">{format(date, 'MM月dd日')} 日记</h3>
        <p className="text-xs text-gray-400 mt-1">今天小仙女的身体感觉怎么样呀？</p>
      </div>

      <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
        <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
          <Droplet className="w-4 h-4 text-rose-400" /> 姨妈流量
        </label>
        <div className="flex gap-2">
          {[
            { id: 'none', label: '没来', emoji: '☁️', color: 'bg-white text-gray-500 border-gray-100' },
            { id: 'light', label: '量少', emoji: '💧', color: 'bg-rose-50 text-rose-500 border-rose-200' },
            { id: 'medium', label: '中等', emoji: '🍓', color: 'bg-rose-400 text-white border-rose-400' },
            { id: 'heavy', label: '量大', emoji: '🌊', color: 'bg-rose-600 text-white border-rose-600' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setStatus(opt.id as any)}
              className={cn(
                "flex-1 py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center gap-1",
                status === opt.id ? opt.color + ' border-transparent scale-105 shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
              )}
            >
              <span className="text-lg">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-700 block mb-2 flex items-center gap-1">
          <Frown className="w-4 h-4 text-amber-500" /> 情绪与疼痛记录
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '痛经 😣', val: '痛经' },
            { label: '头疼 🤕', val: '头疼' },
            { label: '胸胀 🎈', val: '胸胀' },
            { label: '情绪低落 🌧️', val: '情绪低落' },
            { label: '疲劳 🥱', val: '疲劳' },
            { label: '想贴贴 🤗', val: '想贴贴' },
            { label: '状态超好 ✨', val: '状态超好' },
            { label: '容易暴躁 🌋', val: '容易暴躁' }
          ].map(sym => (
            <button
              key={sym.val}
              onClick={() => toggleSymptom(sym.val)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shadow-sm",
                symptoms.includes(sym.val) ? "bg-amber-100 border-amber-300 text-amber-700 scale-105" : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
              )}
            >
              {sym.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-700 block mb-2 flex items-center gap-1">
          <Coffee className="w-4 h-4 text-emerald-500" /> 悄悄话 / 备忘录
        </label>
        <textarea 
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="今天有什么想对记录下来的呀？比如：多喝热水、肚子好痛要注意保暖..."
          className="w-full p-4 rounded-2xl border-2 border-dashed border-primary-200 bg-white focus:outline-none focus:border-primary-400 text-sm font-sans shadow-sm placeholder:text-gray-300"
        />
      </div>

      <button 
        onClick={handleSave}
        className="w-full py-4 bg-primary-400 text-white rounded-2xl font-bold cute-shadow hover:bg-primary-500 transition-colors text-lg tracking-wide"
      >
        ✨ 记录保存 ✨
      </button>
    </div>
  );
}
