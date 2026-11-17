import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MinecraftBackground from './MinecraftBackground';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { cn } from '../../utils/cn';

export default function Layout() {
  const [isExpanded] = useLocalStorage<boolean>('pokesumas-sidebar-expanded', false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-slate-100 font-sans relative overflow-x-hidden">
      <MinecraftBackground />
      <Sidebar />
      <main
        className={cn(
          "flex-1 min-w-0 transition-all duration-300 p-4 md:p-6 lg:p-8 relative z-10",
          isExpanded ? "md:ml-64" : "md:ml-20"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
