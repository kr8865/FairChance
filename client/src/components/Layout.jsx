import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800/80 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-500 text-sm text-white">FF</span>
          <span>Fairway Forward</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/how-it-works" className="text-sm text-ink-300 hover:text-white">How it works</NavLink>
          <NavLink to="/charities" className="text-sm text-ink-300 hover:text-white">Charities</NavLink>
          <NavLink to="/pricing" className="text-sm text-ink-300 hover:text-white">Pricing</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="text-sm font-medium text-ink-200 hover:text-white"
              >
                {user.role === 'admin' ? 'Admin' : 'Dashboard'}
              </Link>
              <button onClick={handleLogout} className="btn-secondary !px-4 !py-2 text-xs">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink-200 hover:text-white">Sign in</Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-xs">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <p className="font-display text-lg font-bold">Fairway Forward</p>
            <p className="mt-2 max-w-sm text-sm text-ink-400">
              Play with purpose. Every round you log fuels monthly prize draws and real charitable impact.
            </p>
          </div>
          <div className="flex gap-12 text-sm text-ink-400">
            <div className="space-y-2">
              <p className="font-medium text-ink-200">Platform</p>
              <Link to="/how-it-works" className="block hover:text-white">How it works</Link>
              <Link to="/pricing" className="block hover:text-white">Pricing</Link>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-ink-200">Impact</p>
              <Link to="/charities" className="block hover:text-white">Charities</Link>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-ink-600">© 2026 Fairway Forward. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
