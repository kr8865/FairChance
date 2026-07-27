import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  KeyRound,
  Mail,
  User,
  Heart
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { signInWithGooglePopup } from '../lib/firebase';
import { api } from '../lib/api';

/* -------------------------------------------------------------------------- */
/* Aurora Ambient Glassmorphism Background                                     */
/* -------------------------------------------------------------------------- */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Animated Light Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full bg-emerald-400/25 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -50, 0],
          y: [0, 40, 0],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/4 -right-32 h-[38rem] w-[38rem] rounded-full bg-amber-300/20 blur-[140px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-28 left-1/3 h-[30rem] w-[30rem] rounded-full bg-emerald-600/20 blur-[110px]"
      />
      {/* Subtle Mesh Architectural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Unified Auth Page Component                                           */
/* -------------------------------------------------------------------------- */
export default function LoginPage({ defaultSignUp = false }) {
  const [isSignUp, setIsSignUp] = useState(defaultSignUp);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regContribution, setRegContribution] = useState(10);
  
  // Registration OTP States
  const [otpStep, setOtpStep] = useState(false); // false = info form, true = enter OTP
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const navigate = useNavigate();

  /* ------------------------------------------------------------------------ */
  /* Login Handler                                                            */
  /* ------------------------------------------------------------------------ */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      const currentUser = useAuthStore.getState().user;
      navigate(currentUser?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Registration OTP Trigger Handler                                         */
  /* ------------------------------------------------------------------------ */
  const handleSendRegisterOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regEmail || !regPassword || !regFirstName || !regLastName) {
      setError('Please fill in all required fields.');
      return;
    }

    setOtpSending(true);
    try {
      await api.sendRegisterOtp(regEmail);
      setOtpStep(true);
      setSuccessMsg(`A 6-digit verification code has been sent to ${regEmail}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send verification code.');
    } finally {
      setOtpSending(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Complete Registration with OTP                                           */
  /* ------------------------------------------------------------------------ */
  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First verify OTP
      await api.verifyRegisterOtp(regEmail, otpCode);

      // Then proceed to account creation
      await register({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
        contributionPercent: regContribution,
      });

      const currentUser = useAuthStore.getState().user;
      navigate(currentUser?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Firebase Google Auth Handler                                              */
  /* ------------------------------------------------------------------------ */
  const handleGoogleAuth = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const googleData = await signInWithGooglePopup();
      const user = await googleLogin(googleData.user);
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f8faf6] text-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AuroraBackground />

        {/* Central Frosted Glass Container */}
        <div className="relative w-full max-w-5xl rounded-[2.5rem] border border-white/80 bg-white/75 p-3 sm:p-5 shadow-2xl shadow-emerald-950/10 backdrop-blur-2xl overflow-hidden">
          
          <div className="grid lg:grid-cols-12 min-h-[620px] rounded-[2rem] overflow-hidden bg-white/50 border border-white/60">
            
            {/* LEFT / RIGHT FORM CONTAINER (7 cols on lg) */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between relative z-10">
              
              {/* Header Toggle Pills */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex rounded-full bg-slate-100/90 p-1 border border-slate-200/80 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(false); setError(''); setSuccessMsg(''); setOtpStep(false); }}
                      className={`px-5 py-2 text-xs font-bold rounded-full transition-all duration-200 ${
                        !isSignUp 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(true); setError(''); setSuccessMsg(''); setOtpStep(false); }}
                      className={`px-5 py-2 text-xs font-bold rounded-full transition-all duration-200 ${
                        isSignUp 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full">
                    <ShieldCheck size={13} className="text-emerald-600" /> Secure SSL
                  </span>
                </div>

                {/* Form Titles */}
                <div className="mt-8 space-y-1">
                  <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                    {isSignUp ? 'Join Fairway Forward' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {isSignUp 
                      ? 'Log scores, support charities, and enter monthly prize draws.' 
                      : 'Sign in to access your dashboard and active draws.'}
                  </p>
                </div>
              </div>

              {/* Status Banners */}
              <div className="my-4 space-y-2">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-700 font-medium"
                    >
                      <AlertCircle size={16} className="shrink-0 text-red-500" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-800 font-medium"
                    >
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                      <span>{successMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DYNAMIC FORM SWITCHER */}
              {!isSignUp ? (
                /* ---------------------------------------------------------- */
                /* SIGN IN FORM                                               */
                /* ---------------------------------------------------------- */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        className="w-full rounded-2xl border border-slate-200/90 bg-white/90 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                      <Link to="/forgot-password" state={{ email: loginEmail }} className="text-xs font-semibold text-emerald-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full rounded-2xl border border-slate-200/90 bg-white/90 pl-10 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-emerald-600 py-3.5 px-6 font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </form>
              ) : (
                /* ---------------------------------------------------------- */
                /* SIGN UP FORM WITH OTP VERIFICATION                        */
                /* ---------------------------------------------------------- */
                <div>
                  {!otpStep ? (
                    <form onSubmit={handleSendRegisterOtp} className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">First Name</label>
                          <input
                            type="text"
                            className="w-full rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="John"
                            value={regFirstName}
                            onChange={(e) => setRegFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Last Name</label>
                          <input
                            type="text"
                            className="w-full rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="Doe"
                            value={regLastName}
                            onChange={(e) => setRegLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          className="w-full rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="you@example.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Password</label>
                        <input
                          type="password"
                          className="w-full rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="At least 8 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            <Heart size={12} className="text-emerald-600" /> Charity Split
                          </label>
                          <span className="text-xs font-serif font-bold text-emerald-700">{regContribution}%</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={5}
                          value={regContribution}
                          onChange={(e) => setRegContribution(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={otpSending}
                        className="w-full rounded-2xl bg-emerald-600 py-3.5 px-6 font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {otpSending ? <Loader2 size={18} className="animate-spin" /> : 'Send Verification OTP'}
                        {!otpSending && <ArrowRight size={16} />}
                      </button>
                    </form>
                  ) : (
                    /* OTP VERIFICATION STEP */
                    <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
                      <div className="text-center p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                        <Mail size={24} className="mx-auto text-emerald-600 mb-1.5" />
                        <p className="text-xs font-semibold text-slate-700">Enter the 6-digit OTP code sent to:</p>
                        <p className="text-xs font-bold text-emerald-800 mt-0.5">{regEmail}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center uppercase tracking-wider">Verification OTP Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          className="w-full rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-3 text-center text-2xl font-mono tracking-[8px] font-bold text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOtpStep(false)}
                          className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading || otpCode.length !== 6}
                          className="flex-1 rounded-2xl bg-emerald-600 py-3 font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Create Account'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* THIRD-PARTY GOOGLE AUTH BUTTON */}
              <div className="mt-5 space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-slate-200/70" />
                  <span className="absolute bg-white/80 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 backdrop-blur-md">
                    or continue with
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white py-3 px-4 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] disabled:opacity-50"
                >
                  {googleLoading ? (
                    <Loader2 size={16} className="animate-spin text-slate-500" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  Google Account
                </button>
              </div>

              {/* Demo Credentials Box */}
              <div className="mt-4 rounded-2xl bg-slate-100/70 border border-slate-200/80 p-3 text-[11px] text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Demo credentials</p>
                <div className="flex flex-wrap justify-between gap-1 mt-1 font-mono text-slate-500">
                  <span>User: demo@fairwayforward.com / User12345!</span>
                  <span>Admin: admin@fairwayforward.com / Admin123!</span>
                </div>
              </div>

            </div>

            {/* RIGHT SLIDING BRAND SHOWCASE PANEL (5 cols on lg) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 p-8 text-white flex flex-col justify-between relative overflow-hidden hidden lg:flex">
              {/* Subtle Glowing Radial Light */}
              <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-xs text-white">FF</span>
                  <span>Fairway Forward</span>
                </div>

                <div className="mt-16 space-y-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <Sparkles size={13} className="text-amber-400" />
                    Play With Purpose
                  </div>
                  <h3 className="font-serif text-3xl font-bold leading-tight">
                    Every score you log changes lives.
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    Join an exclusive community of golfers directing 10%+ of memberships to causes while competing for monthly prize pools.
                  </p>
                </div>
              </div>

              {/* Accent Feature Pill */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Monthly Guaranteed Split</span>
                  <span className="text-amber-300 font-serif">40% Jackpot</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}