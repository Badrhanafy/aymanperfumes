import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // null  = not yet checked
  // false = checked, not logged in
  // {...} = checked, logged in user object
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true); // true while the initial /api/user check runs

  /* ── On mount: try to rehydrate session from HTTPOnly cookie ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user`, {
          credentials: 'include',   // send the auth_token cookie
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(false); // 401 / 403 → not logged in
        }
      } catch {
        setUser(false);  // network error → treat as logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Called by Login.jsx after a successful /api/signin ── */
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  /* ── Logout ── */
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch { /* swallow – we always clear client state */ }
    setUser(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
