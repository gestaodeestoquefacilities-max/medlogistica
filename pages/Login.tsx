import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Package, Lock, Mail, ArrowRight, ShieldCheck, Truck, User } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signUp } = useAppStore();
  
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup
  
  const [name, setName] = useState(''); // Only for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        await signUp(email, password, name);
        setMessage('Conta criada com sucesso! Verifique seu email para confirmar ou faça login.');
        // Optional: Auto login if Supabase settings allow it without email confirm
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Invalid login")) {
        setError("Email ou senha incorretos.");
      } else if (err.message.includes("User already registered")) {
        setError("Este email já está cadastrado.");
      } else if (err.message.includes("Password should be at least")) {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError(err.message || 'Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Package className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-2xl text-slate-900 tracking-tight">MedLogística</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
            </h1>
            <p className="text-slate-500">
              {isLogin ? 'Acesse o painel de gestão logística.' : 'Preencha os dados para começar.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required={!isLogin}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">Senha</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" />
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="flex items-center">
                  {isLogin ? 'Entrar no Sistema' : 'Cadastrar Conta'}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Toggle Login/Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center w-full"
            >
              {isLogin ? (
                <>
                  Não tem uma conta? <span className="ml-1 underline">Cadastre-se agora</span>
                </>
              ) : (
                <>
                  Já tem uma conta? <span className="ml-1 underline">Faça Login</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center lg:text-left">
            <p className="text-xs text-slate-400 flex items-center justify-center lg:justify-start gap-2">
              © 2026 MedLogística.
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-mono border border-slate-200">Test version</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Visual & Branding */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
        {/* Abstract Background Patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        {/* Content Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md text-white shadow-2xl">
          <div className="mb-6">
             <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-white" />
             </div>
             <h2 className="text-2xl font-bold mb-2">Controle total de entregas</h2>
             <p className="text-blue-100 leading-relaxed">
               Garanta a integridade e pontualidade na entrega de medicamentos com nosso sistema e acompanhe através de dashboards atualizados em tempo real.
             </p>
          </div>
          
          <div className="space-y-4 pt-6 border-t border-white/10">
             <div className="flex items-center gap-3">
                <div className="p-1 rounded-full bg-green-400/20">
                   <ShieldCheck className="w-4 h-4 text-green-300" />
                </div>
                <span className="text-sm font-medium text-blue-50">Rastreabilidade ponta a ponta</span>
             </div>
          </div>
        </div>

        {/* Overlay Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>
    </div>
  );
};

export default Login;