import { NavLink } from 'react-router-dom';
import { Home, CalendarHeart, CheckSquare, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: '主页' },
    { to: '/cycle', icon: CalendarHeart, label: '经期' },
    { to: '/todo', icon: CheckSquare, label: '计划' },
    { to: '/album', icon: ImageIcon, label: '相册' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary-100 px-6 py-3 pb-safe z-50 md:relative md:border-t-0 md:rounded-t-3xl md:-mt-6 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
      <div className="max-w-lg mx-auto flex justify-between items-center relative">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "relative flex flex-col items-center justify-center w-16 h-12 transition-colors duration-300",
                isActive ? "text-primary-500" : "text-gray-400 hover:text-primary-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-6 h-6 z-10", isActive && "fill-primary-50")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1 z-10">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bubble"
                    className="absolute inset-0 bg-primary-100 rounded-xl z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
