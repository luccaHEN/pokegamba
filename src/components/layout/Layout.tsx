import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MinecraftBackground from './MinecraftBackground';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen text-slate-100 font-sans relative">
      <MinecraftBackground />
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
