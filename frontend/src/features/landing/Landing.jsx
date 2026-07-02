import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/uiSlice';
import Logo from '../../components/Logo';
import { 
  Monitor, Boxes, BarChart3, ShieldCheck, 
  ArrowRight, ChevronRight, Stars, Sun, Moon, CheckCircle2
} from 'lucide-react';

export default function Landing() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  const getDashboardRedirectPath = () => {
    if (!user) return '/login';
    if (user.role === 'SuperAdmin') return '/admin';
    if (user.role === 'Cashier') return '/pos';
    return '/dashboard';
  };

  // Sync theme class on mount and change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden relative font-sans selection:bg-brand-500 selection:text-white flex flex-col justify-between">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div>
        {/* HEADER / NAVIGATION */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 dark:border-slate-900 dark:bg-slate-950/80 backdrop-blur-md transition-all">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo className="h-9 w-9 shadow-lg shadow-brand-500/15" />
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                CloudPOS
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="rounded-xl p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-slate-200 dark:border-slate-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              <nav className="flex items-center gap-4">
                {user ? (
                  <Link 
                    to={getDashboardRedirectPath()}
                    className="group flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-4 py-2.5 shadow-lg shadow-brand-500/20 active:scale-98 transition-all"
                  >
                    Dashboard
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup"
                      className="group flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/80 dark:bg-slate-100 dark:border-transparent dark:text-slate-950 dark:hover:bg-slate-200 text-white font-semibold text-xs px-4 py-2.5 active:scale-98 transition-all"
                    >
                      Register Store
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 transition-colors" />
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-12 text-center space-y-8">
          
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/5 border border-brand-500/15 text-xs font-medium text-brand-500 dark:text-brand-400">
            <Stars className="h-3.5 w-3.5" />
            Cloud-based Point of Sale Platform
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.12]">
            Unleash the Power of{' '}
            <span className="bg-gradient-to-r from-brand-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Cloud-Based Sales
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage multiple retail stores, sync live stock inventory, process secure transactions, 
            and track deep financial analytics—all from a single, clean cloud-synced terminal.
          </p>

          {/* Call to Actions */}
          <div className="flex items-center justify-center pt-2">
            {user ? (
              <Link 
                to={getDashboardRedirectPath()}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm px-8 py-3.5 shadow-xl shadow-brand-500/20 active:scale-98 transition-all"
              >
                Open Your Dashboard
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            ) : (
              <Link 
                to="/signup"
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm px-8 py-3.5 shadow-xl shadow-brand-500/20 active:scale-98 transition-all"
              >
                Get Started Now
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            )}
          </div>

          {/* Minimal Feature Highlights Box (No Images) */}
          <div className="pt-8 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/10 backdrop-blur-xl p-6 sm:p-8 shadow-sm text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30">
                  <CheckCircle2 className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1">Instant Activation</h4>
                    <p className="text-slate-500 dark:text-slate-400">Register your business and launch your first sales terminal in under 60 seconds.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30">
                  <CheckCircle2 className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1">No Hardware Lock-in</h4>
                    <p className="text-slate-500 dark:text-slate-400">Compatible with any standard barcode scanner, receipt printer, and tablet browser.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* CORE FEATURES */}
        <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-900 space-y-10">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Engineered for Modern Commerce</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-xs">
              Tackle store management with tools built for speed and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-800 hover:-translate-y-0.5 p-6 space-y-3.5 transition-all shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-brand-500/5 border border-brand-500/15 text-brand-500 dark:text-brand-400 flex items-center justify-center">
                <Monitor className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-slate-850 dark:text-white">Interactive POS</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Run offline-capable sales terminals, apply discounts, generate customer receipts, and checkout in milliseconds.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-800 hover:-translate-y-0.5 p-6 space-y-3.5 transition-all shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-violet-500/5 border border-violet-500/15 text-violet-500 dark:text-violet-400 flex items-center justify-center">
                <Boxes className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-slate-850 dark:text-white">Smart Inventory</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Track stock levels, set low-stock thresholds, and receive real-time warnings before you run out of essential products.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-800 hover:-translate-y-0.5 p-6 space-y-3.5 transition-all shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-slate-850 dark:text-white">Reports & Logs</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Analyze monthly profit margins, generate CSV logs, track staff performance metrics, and review business operations.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-800 hover:-translate-y-0.5 p-6 space-y-3.5 transition-all shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-pink-500/5 border border-pink-500/15 text-pink-500 dark:text-pink-400 flex items-center justify-center">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-slate-850 dark:text-white">Tenant Isolation</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Enterprise-grade secure boundaries. Your business logs, customer databases, and financial catalogs are completely isolated.
              </p>
            </div>

          </div>

        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-900 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 dark:text-slate-500 text-xs mt-10">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 grayscale opacity-45" />
          <span>&copy; {new Date().getFullYear()} CloudPOS. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Support Portal</a>
        </div>
      </footer>

    </div>
  );
}
