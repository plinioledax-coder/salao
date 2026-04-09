import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn'; // Supondo que você tenha ou criará um utilitário para o cn
import { 
  LayoutDashboard, Calendar as CalendarIcon, Package, Wallet, 
  Users, Megaphone, LogOut, User as UserIcon, Bell, FileText, ExternalLink 
} from 'lucide-react';

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/calendar', label: 'Agenda', icon: CalendarIcon },
  { path: '/admin/customers', label: 'Clientes', icon: Users },
  { path: '/admin/professionals', label: 'Equipe', icon: Users },
  { path: '/admin/inventory', label: 'Estoque', icon: Package },
  { path: '/admin/finance', label: 'Financeiro', icon: Wallet },
  { path: '/admin/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/admin/reports', label: 'Relatórios', icon: FileText },
];

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-aura-cream overflow-hidden">
      <aside className="w-64 bg-white border-r border-aura-charcoal/5 flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-serif italic text-aura-charcoal">Studio Modesto</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-aura-charcoal/40 mt-1">Gestão de Beleza</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive ? "bg-aura-charcoal text-white shadow-md" : "text-aura-charcoal/60 hover:bg-aura-soft-gray hover:text-aura-charcoal"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-aura-gold" : "group-hover:text-aura-gold")} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-aura-charcoal/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-aura-soft-gray overflow-hidden border border-aura-charcoal/10">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-full h-full p-1 text-aura-charcoal/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.user_metadata?.full_name || 'Usuário'}</p>
              <p className="text-[10px] text-aura-charcoal/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-aura-charcoal/60 hover:bg-aura-soft-gray hover:text-aura-charcoal transition-all duration-200 mb-1">
            <ExternalLink className="w-5 h-5" />
            <span className="text-sm font-medium">Ver Site</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-aura-charcoal/60 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/50 backdrop-blur-sm border-b border-aura-charcoal/5 flex items-center justify-between px-10">
          <h2 className="text-xl font-serif text-aura-charcoal capitalize">
            {menuItems.find(i => location.pathname.includes(i.path))?.label || 'Painel'}
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
          <Outlet /> {/* Aqui as páginas internas serão renderizadas */}
        </div>
      </main>
    </div>
  );
}