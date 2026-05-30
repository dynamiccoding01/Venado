import React, { useState } from 'react';
import { Mail, Lock, LogIn, ChevronRight } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = '/'; 
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden bg-slate-900">
      
      {/* Background Image (Generada) con Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-90 transition-transform duration-[20s] ease-linear hover:scale-105"
        style={{ backgroundImage: 'url("/login-bg.png")' }}
      >
        {/* Gradiente sutil para oscurecer y mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/30 via-slate-900/60 to-slate-900/90 mix-blend-multiply"></div>
      </div>

      {/* Tarjeta Glassmorphism Principal */}
      <div className="relative z-10 w-full max-w-5xl mx-auto p-4 flex flex-col md:flex-row shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10">
        
        {/* Lado Izquierdo: Branding Premium */}
        <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Elemento de luz abstracto interno */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-blue/20 to-transparent opacity-50 z-0"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20 mb-8 shadow-inner">
              <span className="text-white font-black text-2xl">C</span>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight mb-4 drop-shadow-md">CampoRuta</h1>
            <p className="text-blue-100 text-lg leading-relaxed font-light mb-8 max-w-sm drop-shadow">
              Gestión inteligente de la cadena de suministro. Eleva el control de tu operación nacional al siguiente nivel.
            </p>
          </div>

          <div className="relative z-10 hidden md:block">
            <div className="flex -space-x-3 mb-4">
              <img className="w-10 h-10 rounded-full border-2 border-slate-800/50" src="https://ui-avatars.com/api/?name=User+1&background=2563eb&color=fff" />
              <img className="w-10 h-10 rounded-full border-2 border-slate-800/50" src="https://ui-avatars.com/api/?name=User+2&background=ef4444&color=fff" />
              <img className="w-10 h-10 rounded-full border-2 border-slate-800/50" src="https://ui-avatars.com/api/?name=User+3&background=1d4ed8&color=fff" />
              <div className="w-10 h-10 rounded-full border-2 border-slate-800/50 bg-white/10 backdrop-blur flex items-center justify-center text-xs font-bold">+1k</div>
            </div>
            <p className="text-xs text-blue-200 font-medium tracking-wide uppercase">Plataforma operativa de Grupo Venado</p>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="w-full md:w-1/2 bg-white p-10 lg:p-14 flex flex-col justify-center shadow-2xl relative">
          
          {/* Cinta decorativa */}
          <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-brand-blue to-brand-red"></div>

          <div className="mb-10">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Acceso Operativo</h3>
            <p className="text-slate-500 mt-2 font-medium">Autenticación segura para red privada.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="group">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-brand-blue">
                Correo Corporativo
              </label>
              <div className="relative flex items-center">
                <Mail size={20} className="absolute left-0 text-slate-300 transition-colors group-focus-within:text-brand-blue" />
                <input 
                  type="email" 
                  required
                  placeholder="nombre@grupovenado.com" 
                  className="w-full bg-transparent pl-8 pr-4 py-2 border-b-2 border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-brand-blue transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-brand-blue">
                  Contraseña
                </label>
                <a href="#" className="text-xs font-bold text-brand-blue hover:text-brand-red transition-colors">
                  Recuperar clave
                </a>
              </div>
              <div className="relative flex items-center">
                <Lock size={20} className="absolute left-0 text-slate-300 transition-colors group-focus-within:text-brand-blue" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full bg-transparent pl-8 pr-4 py-2 border-b-2 border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-brand-blue transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="mt-6 w-full flex justify-between items-center py-4 px-6 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-brand-blue shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_10px_30px_-10px_rgba(37,99,235,0.8)] transition-all duration-300 transform hover:-translate-y-0.5 group"
            >
              <span>Ingresar al Sistema</span>
              <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white group-hover:text-brand-blue transition-colors">
                <ChevronRight size={18} />
              </div>
            </button>
          </form>
          
        </div>
      </div>
      
    </div>
  );
}
