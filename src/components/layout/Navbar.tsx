import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Dices, Book, History, Star, Type, Package, Compass } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const navLeft = [
  { name: 'Sorteio', href: '/sorteio', icon: Dices },
  { name: 'Pokédex', href: '/pokedex', icon: Book },
  { name: 'Drops / Loot', href: '/loot', icon: Package },
];

const navRight = [
  { name: 'Guia', href: '/guia', icon: Compass },
  { name: 'Favoritos', href: '/favoritos', icon: Star },
  { name: 'Histórico', href: '/historico', icon: History },
];

const allNav = [...navLeft, ...navRight];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontPref, setFontPref] = useLocalStorage<'pixel' | 'modern'>('cobblemon-font', 'pixel');

  useEffect(() => {
    if (fontPref === 'modern') {
      document.body.classList.remove('font-pixel');
      document.body.classList.add('font-modern');
    } else {
      document.body.classList.remove('font-modern');
      document.body.classList.add('font-pixel');
    }
  }, [fontPref]);

  const toggleFont = () => {
    setFontPref(fontPref === 'pixel' ? 'modern' : 'pixel');
  };

  const NavItem = ({ item }: { item: typeof navLeft[0] }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.href}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) =>
          cn(
            'flex items-center px-4 py-2 text-sm font-bold rounded-full transition-all duration-300',
            isActive
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-md shadow-yellow-500/20'
              : 'text-cobble-200 hover:bg-cobble-800 hover:text-white'
          )
        }
      >
        <Icon className="w-5 h-5 mr-2" />
        {item.name}
      </NavLink>
    );
  };

  return (
    <div className="relative sticky top-0 z-50 bg-cobble-900/90 backdrop-blur-md border-b border-cobble-700 shadow-xl">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 relative">
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-cobble-200 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>

          {/* Desktop Left Nav */}
          <div className="hidden md:flex flex-1 justify-end space-x-1.5 lg:space-x-2 pr-4 lg:pr-6">
            {navLeft.map(item => <NavItem key={item.name} item={item} />)}
          </div>

          {/* Center Title */}
          <div className="flex-shrink-0 flex items-center justify-center relative group cursor-pointer">
            <div className="absolute inset-0 bg-yellow-400 blur-[40px] opacity-40 rounded-full animate-pulse group-hover:opacity-60 transition-opacity duration-500"></div>
            <h1 
              className="text-4xl lg:text-5xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-600 drop-shadow-[0_5px_15px_rgba(234,179,8,0.8)] relative z-10 transition-transform duration-500 group-hover:scale-110" 
              style={{ 
                WebkitTextStroke: '2px #78350f', 
                filter: 'drop-shadow(0px 0px 15px rgba(250,204,21,0.6))' 
              }}
            >
              PokeSumas
            </h1>
          </div>

          {/* Desktop Right Nav */}
          <div className="hidden md:flex flex-1 justify-start space-x-1.5 lg:space-x-2 pl-4 lg:pl-6">
            {navRight.map(item => <NavItem key={item.name} item={item} />)}
          </div>

          {/* Font Toggle */}
          <div className="absolute right-0 flex items-center">
            <button
              onClick={toggleFont}
              title={fontPref === 'pixel' ? 'Mudar para Fonte Moderna' : 'Mudar para Fonte Retrô'}
              className="p-2 bg-cobble-800 hover:bg-cobble-700 text-cobble-200 hover:text-white border border-cobble-600 rounded-lg shadow-sm transition-colors flex items-center gap-2 group"
            >
              <Type className="w-5 h-5" />
              <span className="hidden lg:inline text-xs font-bold uppercase tracking-widest">{fontPref === 'pixel' ? 'Retro' : 'Modern'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 z-50 bg-cobble-800 border-b border-cobble-700 shadow-2xl">
          <nav className="px-4 pt-2 pb-6 flex flex-col space-y-2">
            {allNav.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
