import { useState, type FormEvent } from 'react';
import { useApp } from '../lib/AppContext';
import { generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Trash2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function Todo() {
  const { state, updateState } = useApp();
  const [inputText, setInputText] = useState('');

  const todos = state?.todos || [];

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newTodo = {
      id: generateId(),
      text: inputText.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    updateState({ todos: [newTodo, ...todos] });
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    updateState({
      todos: todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    });
  };

  const deleteTodo = (id: string) => {
    updateState({
      todos: todos.filter(t => t.id !== id)
    });
  };

  const activeTodos = todos.filter(t => !t.completed).length;

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-lg mx-auto h-full flex flex-col">
      <header className="pt-4 pb-6">
        <h1 className="text-3xl font-bold text-teal-600 mb-1 flex items-center gap-2"><span>📝</span> 每日清单</h1>
        <p className="text-sm text-gray-400">目前还有 {activeTodos} 个小目标待完成哦</p>
      </header>

      <form onSubmit={handleAdd} className="mb-6 relative">
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="添加一个新的计划吧..."
          className="w-full pl-5 pr-14 py-4 bg-white border-2 border-primary-200 rounded-2xl focus:outline-none focus:border-teal-400 cute-shadow text-gray-700 placeholder:text-gray-400 font-sans"
        />
        <button 
          type="submit"
          disabled={!inputText.trim()}
          className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center bg-primary-200 text-white rounded-xl hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:bg-gray-300"
        >
          <Plus strokeWidth={3} className="w-5 h-5" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        <AnimatePresence initial={false}>
          {todos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-10 opacity-60"
            >
              <div className="text-6xl mb-4">🌻</div>
              <p className="text-gray-500 font-handwriting">清单空空如也，今天要当一条咸鱼吗？</p>
            </motion.div>
          ) : (
            todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={cn(
                  "group flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 cute-shadow",
                  todo.completed ? "border-gray-200 bg-gray-50 opacity-60" : "border-primary-200 bg-teal-50/30"
                )}
              >
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={cn(
                    "w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors",
                    todo.completed 
                      ? "bg-primary-200 border-primary-200" 
                      : "border-primary-200 bg-white hover:bg-primary-50"
                  )}
                >
                  <Check className={cn("w-4 h-4 text-white transition-transform duration-300", todo.completed ? "scale-100" : "scale-0")} strokeWidth={4} />
                </button>
                
                <span className={cn(
                  "flex-1 text-[15px] font-medium transition-all duration-300 break-words",
                  todo.completed ? "text-gray-400 line-through" : "text-gray-700"
                )}>
                  {todo.text}
                </span>

                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
