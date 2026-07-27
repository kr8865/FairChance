import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import AuthLayout from '../components/AuthLayout';
import { api } from '../lib/api';
import FloatingBlobs  from '../components/FloatingBobs';

const STEPS = ['email', 'otp', 'password', 'done'];

export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const stepIndex = STEPS.indexOf(step);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const result = await api.forgotPassword({ email });
      setInfo(result.message);
      setStep('otp');
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const result = await api.forgotPassword({ email });
      setInfo(result.message);
      setOtp('');
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const result = await api.verifyOtp({ email, otp });
      setResetToken(result.resetToken);
      setStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword({ email, resetToken, newPassword });
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden bg-[#f7f8f3] text-slate-900">
        <FloatingBlobs />

        <AuthLayout
          mode="centered"
          headline="Reset your password"
          subline="We'll send a verification code to your email."
        >
          <div className="relative z-10 space-y-6">
            <div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
              <h2 className="mt-4 text-3xl font-serif font-bold text-slate-900 tracking-tight">
                {step === 'done' ? 'Password updated' : 'Forgot password'}
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                {step === 'email' && 'Enter your account email and we will send a 6-digit code.'}
                {step === 'otp' && `Enter the verification code sent to ${email}.`}
                {step === 'password' && 'Choose a new password for your account.'}
                {step === 'done' && 'You can now sign in with your new password.'}
              </p>
            </div>

            {step !== 'done' && (
              <div className="flex items-center gap-2">
                {['Email', 'Verify', 'Reset'].map((label, index) => (
                  <div key={label} className="flex flex-1 items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        index <= stepIndex - 1
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="hidden text-xs font-medium text-slate-500 sm:inline">{label}</span>
                    {index < 2 && <div className="h-px flex-1 bg-slate-200" />}
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50/90 p-3.5 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {info && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-sm text-emerald-700"
                >
                  <Mail size={18} className="shrink-0 text-emerald-500" />
                  <span>{info}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 px-6 font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send verification code'}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Verification code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-center text-lg tracking-[0.4em] text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 px-6 font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify code'}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resendCooldown > 0}
                  className="w-full text-center text-xs font-semibold text-emerald-600 hover:underline disabled:text-slate-400 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
                </button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 pr-11 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 pr-11 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 px-6 font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset password'}
                </button>
              </form>
            )}

            {step === 'done' && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={28} />
                </div>
                <p className="text-sm text-slate-600">
                  Your password has been reset successfully. All active sessions were signed out for
                  security.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 px-6 font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600"
                >
                  <ShieldCheck size={18} />
                  Continue to sign in
                </button>
              </div>
            )}

            {step === 'email' && (
              <p className="rounded-2xl border border-slate-200/80 bg-slate-100/70 p-3.5 text-xs text-slate-600">
                Signed in with Google? Use your Google account recovery instead. This flow is for
                email and password accounts.
              </p>
            )}
          </div>
        </AuthLayout>
      </div>
    </Layout>
  );
}
