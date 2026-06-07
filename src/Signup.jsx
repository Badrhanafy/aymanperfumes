import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoSvg from '../public/logos/png/logobrandblack.png';

const API_BASE = 'http://localhost:8000';

/* ── reusable field component ── */
function Field({ id, label, type = 'text', name, value, onChange, autoComplete, error, children }) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          id={id}
          type={type}
          name={name}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder=" "
          className={`peer w-full bg-transparent border-b px-0 py-3 pr-10 outline-none transition-colors text-black placeholder-transparent font-light text-sm
            ${error ? 'border-red-300 focus:border-red-500' : 'border-neutral-200 focus:border-black'}`}
        />
        <label
          htmlFor={id}
          className={`absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] transition-all pointer-events-none
            ${error ? 'text-red-400' : 'text-neutral-500'}
            peer-placeholder-shown:text-sm peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
            peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.15em]
            ${error ? 'peer-focus:text-red-500' : 'peer-focus:text-black'}`}
        >
          {label}
        </label>
        {/* slot for show/hide button or icon */}
        {children}
      </div>
      {/* Per-field error */}
      {error && (
        <p className="text-[10px] text-red-500 font-light tracking-wide flex items-center gap-1.5 animate-[fadeSlideIn_0.25s_ease]">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Eye toggle button ── */
function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="absolute right-0 top-3 text-neutral-400 hover:text-black transition-colors"
    >
      {show ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════
   SIGNUP PAGE
══════════════════════════════════════════════ */
export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [status, setStatus]       = useState('idle'); // idle | loading | success | error
  const [fieldErrors, setFieldErrors] = useState({});  // Laravel field-level errors
  const [globalError, setGlobalError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear the per-field error as the user types
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setFieldErrors({});
    setGlobalError('');

    try {
      /**
       * POST /api/signup
       * Body: { name, email, password }
       *
       * 200 → { message: 'validation passed' }    → redirect to /login
       * 422 → { errors: { name:[…], email:[…], password:[…] } }  → show per-field errors
       * other → generic error
       *
       * credentials: 'include' is kept so any auth cookie the backend
       * decides to return is also stored automatically.
       */
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role:"user",
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      // Laravel validation errors (422)
      if (res.status === 422 && data.errors) {
        const mapped = {};
        for (const [key, messages] of Object.entries(data.errors)) {
          mapped[key] = Array.isArray(messages) ? messages[0] : messages;
        }
        setFieldErrors(mapped);
        setStatus('error');
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Registration failed. Please try again.');
      }

      // ✅ Account created
      setStatus('success');
      setTimeout(() => navigate('/login'), 1800);

    } catch (err) {
      setStatus('error');
      setGlobalError(err.message || 'Something went wrong.');
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Top bar ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 md:px-12 h-[72px] md:h-[88px] border-b border-neutral-100">
        <Link to="/login"
          className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-neutral-400 hover:text-black transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Sign In
        </Link>
        <Link to="/">
          <img src={logoSvg} alt="L'ESSENCE"
            className="h-10 md:h-14 w-auto object-contain mix-blend-multiply opacity-80" />
        </Link>
        <div className="w-28 hidden sm:block" aria-hidden="true" />
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-black" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-medium">
                New Member
              </span>
              <div className="w-8 h-[1px] bg-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-black tracking-tight">
              Create Account
            </h1>
            <p className="mt-3 text-sm font-light text-neutral-500">
              Join L'ESSENCE and explore your signature scent.
            </p>
          </div>

          {/* ── Form card ── */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-neutral-50 border border-neutral-200/60 rounded-3xl p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] space-y-8"
          >
            {/* Full Name */}
            <Field
              id="signup-name"
              label="Full Name"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              error={fieldErrors.name}
            />

            {/* Email */}
            <Field
              id="signup-email"
              label="Email Address"
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />

            {/* Password */}
            <Field
              id="signup-password"
              label="Password"
              type={showPass ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              error={fieldErrors.password}
            >
              <EyeToggle show={showPass} onToggle={() => setShowPass(v => !v)} />
            </Field>

            {/* Password strength hint */}
            {form.password.length > 0 && (
              <PasswordStrength password={form.password} />
            )}

            {/* Global error */}
            {status === 'error' && globalError && (
              <div role="alert"
                className="flex items-start gap-3 bg-red-50 border border-red-200/70 rounded-xl px-4 py-3 text-sm text-red-700 animate-[fadeSlideIn_0.3s_ease]">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span className="font-light">{globalError}</span>
              </div>
            )}

            {/* Success banner */}
            {status === 'success' && (
              <div role="status"
                className="flex items-center gap-3 bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-black animate-[fadeSlideIn_0.3s_ease]">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-light">Account created — redirecting to sign in&hellip;</span>
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
              {isLoading && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] animate-[shimmer_1.2s_linear_infinite]"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    backgroundSize: '200% 100%',
                  }}
                />
              )}

              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating Account&hellip;
                </span>
              ) : status === 'success' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Account Created
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Divider + sign-in link */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-neutral-200" />
              <span className="text-[10px] uppercase tracking-widest text-neutral-400">or</span>
              <div className="flex-1 h-[1px] bg-neutral-200" />
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full border border-neutral-200 py-4 text-[11px] uppercase tracking-[0.3em] text-black hover:border-black transition-colors"
            >
              Already have an account? Sign In
            </Link>
          </form>

          {/* Legal */}
          <p className="mt-8 text-center text-[11px] text-neutral-400 font-light leading-relaxed">
            By creating an account you agree to our{' '}
            <a href="#" className="underline underline-offset-2 hover:text-black transition-colors">Privacy Policy</a>
            {' '}and{' '}
            <a href="#" className="underline underline-offset-2 hover:text-black transition-colors">Terms of Service</a>.
          </p>
        </div>
      </main>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-5px); }
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

/* ── Password strength indicator ── */
function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters',    pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number',           pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors  = ['bg-red-400', 'bg-amber-400', 'bg-emerald-400'];
  const labels  = ['Weak', 'Fair', 'Strong'];

  return (
    <div className="space-y-2 -mt-2 animate-[fadeSlideIn_0.3s_ease]">
      {/* Bar */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${i < score ? colors[score - 1] : 'bg-neutral-200'}`}
          />
        ))}
      </div>
      {/* Checks + label */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(c => (
            <span
              key={c.label}
              className={`text-[9px] uppercase tracking-wide transition-colors ${c.pass ? 'text-neutral-600' : 'text-neutral-300'}`}
            >
              {c.pass ? '✓ ' : '· '}{c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-[9px] uppercase tracking-widest font-medium ${colors[score - 1].replace('bg-', 'text-')}`}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}
