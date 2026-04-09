import React from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Package, 
  Wallet, 
  Users, 
  Megaphone,
  LogOut,
  User as UserIcon,
  Bell,
  FileText,
  ExternalLink
} from 'lucide-react';
import { logout } from '../lib/firebase';
import { User } from 'firebase/auth';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onViewSite: () => void;
}

export function Layout({ children, activeTab, setActiveTab, user, onViewSite }: LayoutProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Agenda', icon: CalendarIcon },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'professionals', label: 'Equipe', icon: Users },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'finance', label: 'Financeiro', icon: Wallet },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'reports', label: 'Relatórios', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-aura-cream overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-aura-charcoal/5 flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-serif italic text-aura-charcoal">Studio Modesto</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-aura-charcoal/40 mt-1">Gestão de Beleza</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-aura-charcoal text-white shadow-md" 
                  : "text-aura-charcoal/60 hover:bg-aura-soft-gray hover:text-aura-charcoal"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-aura-gold" : "group-hover:text-aura-gold")} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-aura-charcoal/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-aura-soft-gray overflow-hidden border border-aura-charcoal/10">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-full h-full p-1 text-aura-charcoal/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user.displayName}</p>
              <p className="text-[10px] text-aura-charcoal/40 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onViewSite}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-aura-charcoal/60 hover:bg-aura-soft-gray hover:text-aura-charcoal transition-all duration-200 mb-1"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="text-sm font-medium">Ver Site</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-aura-charcoal/60 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/50 backdrop-blur-sm border-bottom border-aura-charcoal/5 flex items-center justify-between px-10">
          <h2 className="text-xl font-serif text-aura-charcoal capitalize">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-aura-charcoal/40 hover:text-aura-charcoal transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-aura-gold rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-aura-charcoal/10 mx-2"></div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Data de Hoje</p>
              <p className="text-sm font-medium">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
