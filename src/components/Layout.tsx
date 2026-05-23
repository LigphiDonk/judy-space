import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-[100dvh] bg-[#f3f4f6] flex justify-center md:items-center">
      <div className="w-full max-w-lg min-h-[100dvh] bg-primary-50 flex flex-col relative overflow-hidden md:min-h-0 md:h-[860px] md:max-h-[calc(100vh-48px)] md:rounded-[1.75rem] md:shadow-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-primary-50 to-primary-100">
        <main className="flex-1 overflow-y-auto w-full relative z-10 pb-24 scroll-smooth">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
