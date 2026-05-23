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
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t border-primary-100 bg-white/95 px-4 pt-2 pb-safe shadow-[0_-10px_30px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="mx-auto grid grid-cols-4 items-center gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "relative flex h-14 min-w-0 flex-col items-center justify-center rounded-2xl transition-colors duration-300",
                isActive ? "text-primary-500" : "text-gray-500 hover:text-primary-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("z-10 h-5 w-5", isActive && "fill-primary-50")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="z-10 mt-1 text-[11px] font-bold leading-none">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bubble"
                    className="absolute inset-1 z-0 rounded-2xl bg-primary-100"
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
