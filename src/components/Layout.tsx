import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-[100dvh] md:min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-lg bg-primary-50 flex flex-col relative shadow-2xl overflow-hidden md:h-screen md:rounded-2xl md:my-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-primary-50 to-primary-100">
        <main className="flex-1 overflow-y-auto w-full relative z-10 pb-20 md:pb-0 scroll-smooth">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
