import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoSvg from '../public/logos/png/logobrandblack.png';
import { useAuth } from './AuthContext';

/* ─────────────────────────────────────────────
   API base – change to your real domain in prod
───────────────────────────────────────────── */
const API_BASE = 'http://localhost:8000';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [status, setStatus]       = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg]   = useState('');

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      /**
       * credentials: 'include' is the critical flag.
       * It tells the browser to:
       *   1. Send any existing cookies with the request (cross-origin).
       *   2. Accept and STORE any Set-Cookie headers the server returns,
       *      including HTTPOnly cookies — the browser stores them automatically
       *      and JavaScript cannot read them, which is exactly what we want.
       *
       * Your backend must respond with:
       *   Access-Control-Allow-Origin: http://localhost:5173   (exact origin, NOT *)
       *   Access-Control-Allow-Credentials: true
       *   Set-Cookie: session=...; HttpOnly; SameSite=Lax; Path=/
       */
      const res = await fetch(`${API_BASE}/api/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',          // ← makes browser store the HTTPOnly cookie
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        let msg = 'Invalid credentials. Please try again.';
        try {
          const data = await res.json();
          // Laravel ValidationException → { errors: { email: ['…'] } }
          if (data.errors) {
            const firstKey = Object.keys(data.errors)[0];
            const firstMsg = data.errors[firstKey];
            msg = Array.isArray(firstMsg) ? firstMsg[0] : firstMsg;
          } else {
            msg = data.message || data.detail || data.error || msg;
          }
        } catch { /* ignore JSON parse error */ }
        throw new Error(msg);
      }

      // Cookie is now stored by the browser — no need to touch it from JS
      // Parse the returned user and push it into AuthContext so the navbar
      // updates immediately without requiring a full page reload.
      const data = await res.json().catch(() => ({}));
      const userObj = data.user || (data.data && data.data.user) || data.data || data;
      
      if (userObj) login(userObj);

      setStatus('success');
      
      const isAdmin = userObj && userObj.role === 'admin';
      setTimeout(() => navigate(isAdmin ? '/admin' : '/'), 1200);

    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Top bar ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 md:px-12 h-[72px] md:h-[88px] border-b border-neutral-100">
        <Link to="/" className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-neutral-400 hover:text-black transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Store
        </Link>
        <Link to="/">
          <img src={logoSvg} alt="L'ESSENCE" className="h-10 md:h-14 w-auto object-contain mix-blend-multiply opacity-80" />
        </Link>
        <div className="w-24 hidden sm:block" aria-hidden="true" /> {/* spacer */}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-black" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-medium">
                Member Access
              </span>
              <div className="w-8 h-[1px] bg-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-black tracking-tight">
              Welcome Back
            </h1>
            <p className="mt-3 text-sm font-light text-neutral-500">
              Sign in to access your curated collection.
            </p>
          </div>

          {/* ── Form card ── */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-neutral-50 border border-neutral-200/60 rounded-3xl p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] space-y-8"
          >
            {/* Email */}
            <div className="relative">
              <input
                id="login-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                className="peer w-full bg-transparent border-b border-neutral-200 px-0 py-3 outline-none focus:border-black transition-colors text-black placeholder-transparent font-light text-sm"
              />
              <label
                htmlFor="login-email"
                className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500
                  transition-all
                  peer-placeholder-shown:text-sm peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
                  peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.15em]
                  pointer-events-none"
              >
                Email Address
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                className="peer w-full bg-transparent border-b border-neutral-200 px-0 py-3 pr-10 outline-none focus:border-black transition-colors text-black placeholder-transparent font-light text-sm"
              />
              <label
                htmlFor="login-password"
                className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500
                  transition-all
                  peer-placeholder-shown:text-sm peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
                  peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.15em]
                  pointer-events-none"
              >
                Password
              </label>

              {/* Show / Hide toggle */}
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-3 text-neutral-400 hover:text-black transition-colors"
              >
                {showPass ? (
                  /* Eye-off */
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  /* Eye */
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Forgot password */}
            <div className="text-right -mt-4">
              <a href="#" className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5">
                Forgot password?
              </a>
            </div>

            {/* Error message */}
            {status === 'error' && (
              <div
                role="alert"
                className="flex items-start gap-3 bg-red-50 border border-red-200/70 rounded-xl px-4 py-3 text-sm text-red-700 animate-[fadeSlideIn_0.3s_ease]"
              >
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span className="font-light">{errorMsg}</span>
              </div>
            )}

            {/* Success message */}
            {status === 'success' && (
              <div
                role="status"
                className="flex items-center gap-3 bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-black animate-[fadeSlideIn_0.3s_ease]"
              >
                <svg className="w-4 h-4 flex-shrink-0 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-light">Signed in — redirecting&hellip;</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || status === 'success'}
              className={`relative w-full py-4 text-[11px] uppercase tracking-[0.3em] font-medium overflow-hidden transition-all duration-300
                ${isLoading || status === 'success'
                  ? 'bg-neutral-800 text-white cursor-not-allowed'
                  : 'bg-black text-white hover:bg-neutral-900 active:scale-[0.98]'}`}
            >
              {/* Shimmer loader bar */}
              {isLoading && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-white/30 animate-[shimmer_1.2s_linear_infinite]"
                  style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', backgroundSize: '200% 100%' }}
                />
              )}

              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing In&hellip;
                </span>
              ) : status === 'success' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Signed In
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-8 text-center text-[11px] text-neutral-400 font-light leading-relaxed">
            By signing in you agree to our{' '}
            <a href="#" className="underline underline-offset-2 hover:text-black transition-colors">Privacy Policy</a>
            {' '}and{' '}
            <a href="#" className="underline underline-offset-2 hover:text-black transition-colors">Terms of Service</a>.
          </p>

          {/* HTTPOnly cookie note (dev-only helper) */}
          {import.meta.env.DEV && (
            <p className="mt-6 text-center text-[10px] text-neutral-300 font-mono leading-relaxed">
              🔒 HTTPOnly cookie is set by the server and stored automatically by the browser.
              It is NOT accessible via JavaScript — this is the intended secure behaviour.
            </p>
          )}

          {/* ── Create Account link ── */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 h-[1px] bg-neutral-200" />
              <span className="text-[10px] uppercase tracking-widest text-neutral-400">or</span>
              <div className="flex-1 h-[1px] bg-neutral-200" />
            </div>
            <p className="text-sm font-light text-neutral-500">
              New to L'ESSENCE?{' '}
              <Link
                to="/signup"
                className="text-black font-medium border-b border-black/30 hover:border-black pb-0.5 transition-colors"
              >
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}
