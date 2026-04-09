import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

export function Login() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Se já estiver logado, manda direto pro painel
  React.useEffect(() => {
    if (user) navigate('/admin/dashboard');
  }, [user, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-aura-cream p-4">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 text-xs uppercase tracking-widest text-aura-charcoal/40 hover:text-aura-charcoal transition-colors"
      >
        ← Voltar para o site
      </button>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-5xl font-serif text-aura-charcoal italic">Studio Modesto</h1>
          <p className="text-aura-charcoal/60 font-light tracking-widest uppercase text-xs">Portal do Gestor</p>
        </div>
        
        <div className="glass-card p-10 space-y-6">
          <p className="text-aura-charcoal/80">Bem-vindo ao seu espaço de gestão. Entre para gerenciar seu salão com elegância.</p>
          <button 
            onClick={signInWithGoogle}
            className="aura-button aura-button-primary w-full flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Entrar com Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}