import { useMemo, useState, type FormEvent } from 'react';
import { addDays, format, isBefore, isSameDay, isToday, parseISO, startOfDay, subDays } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Circle, ListFilter, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { generateId } from '../lib/utils';
import { cn } from '../lib/utils';
import { Todo as TodoType } from '../types';

type FilterMode = 'open' | 'all' | 'done';

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function getDateKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function getTodoDate(todo: TodoType) {
  return todo.dueDate || getDateKey(new Date(todo.createdAt));
}

function formatDayTitle(date: Date) {
  if (isToday(date)) return '今天';
  return `${format(date, 'M月d日')} ${weekDays[date.getDay()]}`;
}

function formatShortDate(date: Date) {
  return format(date, 'M/d');
}

function isTodoOverdue(todo: TodoType) {
  if (todo.completed) return false;
  return isBefore(startOfDay(parseISO(getTodoDate(todo))), startOfDay(new Date()));
}

export function Todo() {
  const { state, updateState } = useApp();
  const [inputText, setInputText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterMode, setFilterMode] = useState<FilterMode>('open');

  const todos = state?.todos || [];
  const selectedDateKey = getDateKey(selectedDate);
  const selectedIsToday = isToday(selectedDate);

  const visibleTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        const matchesSelectedDate = getTodoDate(todo) === selectedDateKey;
        return matchesSelectedDate || (selectedIsToday && isTodoOverdue(todo));
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (isTodoOverdue(a) !== isTodoOverdue(b)) return isTodoOverdue(a) ? -1 : 1;
        return a.createdAt - b.createdAt;
      });
  }, [todos, selectedDateKey, selectedIsToday]);

  const filteredTodos = visibleTodos.filter((todo) => {
    if (filterMode === 'open') return !todo.completed;
    if (filterMode === 'done') return todo.completed;
    return true;
  });

  const openCount = visibleTodos.filter((todo) => !todo.completed).length;
  const doneCount = visibleTodos.filter((todo) => todo.completed).length;
  const overdueCount = visibleTodos.filter(isTodoOverdue).length;
  const progress = visibleTodos.length === 0 ? 0 : Math.round((doneCount / visibleTodos.length) * 100);

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const newTodo: TodoType = {
      id: generateId(),
      text,
      completed: false,
      createdAt: Date.now(),
      dueDate: selectedDateKey,
    };

    setInputText('');
    void updateState({ todos: [newTodo, ...todos] });
    setFilterMode('open');
  };

  const toggleTodo = (id: string) => {
    void updateState({
      todos: todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    });
  };

  const deleteTodo = (id: string) => {
    void updateState({
      todos: todos.filter((todo) => todo.id !== id),
    });
  };

  const rescheduleTodo = (id: string, date: Date) => {
    void updateState({
      todos: todos.map((todo) =>
        todo.id === id ? { ...todo, dueDate: getDateKey(date) } : todo
      ),
    });
  };

  const clearCompletedForDay = () => {
    const visibleDoneIds = new Set(visibleTodos.filter((todo) => todo.completed).map((todo) => todo.id));
    void updateState({
      todos: todos.filter((todo) => !visibleDoneIds.has(todo.id)),
    });
  };

  const dateStrip = [-2, -1, 0, 1, 2].map((offset) => addDays(selectedDate, offset));

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col px-4 pb-4 pt-safe md:p-6">
      <header className="px-1 pb-4 pt-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal-600">
              <CalendarDays className="h-4 w-4" />
              Daily Planner
            </p>
            <h1 className="text-3xl font-black leading-tight text-gray-800">每日计划</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              {formatDayTitle(selectedDate)} · {openCount > 0 ? `还有 ${openCount} 件事` : '今天很清爽'}
            </p>
          </div>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="rounded-2xl border border-primary-100 bg-white px-3 py-2 text-sm font-bold text-primary-500 shadow-sm active:scale-95"
          >
            今天
          </button>
        </div>

        <div className="rounded-[1.5rem] border border-primary-100 bg-white/80 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400">完成进度</p>
              <p className="text-2xl font-black text-gray-800">{progress}%</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-2xl bg-teal-50 px-3 py-2">
                <p className="text-lg font-black text-teal-600">{openCount}</p>
                <p className="text-[10px] font-bold text-teal-700">待完成</p>
              </div>
              <div className="rounded-2xl bg-primary-50 px-3 py-2">
                <p className="text-lg font-black text-primary-500">{doneCount}</p>
                <p className="text-[10px] font-bold text-primary-600">已完成</p>
              </div>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="h-full rounded-full bg-teal-400"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
            />
          </div>
          {overdueCount > 0 && (
            <p className="mt-3 text-xs font-bold text-rose-500">有 {overdueCount} 个过期任务已自动放进今天。</p>
          )}
        </div>
      </header>

      <section className="mb-4">
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-600 shadow-sm active:scale-95"
            aria-label="前一天"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="grid min-w-0 flex-1 grid-cols-5 gap-1">
            {dateStrip.map((date) => {
              const active = isSameDay(date, selectedDate);
              return (
                <button
                  key={getDateKey(date)}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    'min-w-0 rounded-2xl px-1 py-2 text-center transition active:scale-95',
                    active ? 'bg-teal-500 text-white shadow-sm' : 'bg-white/80 text-gray-500'
                  )}
                >
                  <p className="text-[10px] font-bold">{isToday(date) ? '今天' : weekDays[date.getDay()]}</p>
                  <p className="mt-0.5 text-sm font-black">{formatShortDate(date)}</p>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-600 shadow-sm active:scale-95"
            aria-label="后一天"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="rounded-[1.5rem] border-2 border-primary-100 bg-white p-2 shadow-sm">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder={`添加 ${formatDayTitle(selectedDate)} 的计划...`}
              className="min-w-0 flex-1 rounded-2xl px-3 py-3 text-[15px] font-semibold text-gray-700 outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white transition active:scale-95 disabled:bg-gray-200"
              aria-label="添加计划"
            >
              <Plus className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        </form>
      </section>

      <section className="mb-3 flex items-center justify-between gap-2">
        <div className="grid flex-1 grid-cols-3 rounded-2xl bg-white p-1 shadow-sm">
          {[
            { id: 'open', label: '待办' },
            { id: 'all', label: '全部' },
            { id: 'done', label: '完成' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterMode(item.id as FilterMode)}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-bold transition',
                filterMode === item.id ? 'bg-primary-100 text-primary-500' : 'text-gray-500'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        {doneCount > 0 && (
          <button
            onClick={clearCompletedForDay}
            className="rounded-2xl bg-white px-3 py-3 text-xs font-bold text-gray-500 shadow-sm active:scale-95"
          >
            清理
          </button>
        )}
      </section>

      <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {filteredTodos.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-[1.5rem] border border-dashed border-primary-100 bg-white/60 px-6 py-12 text-center"
            >
              <ListFilter className="mx-auto mb-3 h-10 w-10 text-primary-300" />
              <p className="font-handwriting text-lg text-gray-500">
                {filterMode === 'done' ? '还没有完成记录' : '这一天还没有计划'}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-400">添加一件最重要的小事就好。</p>
            </motion.div>
          ) : (
            filteredTodos.map((todo) => {
              const overdue = isTodoOverdue(todo);
              const todoDate = getTodoDate(todo);
              return (
                <motion.div
                  layout
                  key={todo.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -16, scale: 0.96, transition: { duration: 0.18 } }}
                  transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                  className={cn(
                    'rounded-[1.35rem] border p-3 shadow-sm transition',
                    todo.completed ? 'border-gray-100 bg-white/70' : 'border-primary-100 bg-white',
                    overdue && 'border-rose-100 bg-rose-50/70'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 transition active:scale-90',
                        todo.completed ? 'border-teal-400 bg-teal-400' : 'border-primary-200 bg-white'
                      )}
                      aria-label={todo.completed ? '标记为未完成' : '标记为完成'}
                    >
                      {todo.completed ? <Check className="h-4 w-4 text-white" strokeWidth={4} /> : <Circle className="h-3 w-3 text-primary-200" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'break-words text-[15px] font-bold leading-relaxed text-gray-800',
                          todo.completed && 'text-gray-400 line-through'
                        )}
                      >
                        {todo.text}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-[11px] font-bold',
                            overdue ? 'bg-rose-100 text-rose-600' : 'bg-primary-50 text-primary-500'
                          )}
                        >
                          {overdue ? `过期 · ${todoDate}` : todoDate}
                        </span>
                        {!todo.completed && todoDate !== getDateKey(addDays(selectedDate, 1)) && (
                          <button
                            onClick={() => rescheduleTodo(todo.id, addDays(selectedDate, 1))}
                            className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-600 active:scale-95"
                          >
                            顺延一天
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-gray-300 transition hover:bg-red-50 hover:text-red-400 active:scale-95"
                      aria-label="删除计划"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
