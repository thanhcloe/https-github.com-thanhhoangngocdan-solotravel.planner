import { BrowserRouter, Routes, Route, Outlet, Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Explore from './pages/Explore';
import LiveTrip from './pages/LiveTrip';
import Budget from './pages/Budget';
import Itinerary from './pages/Itinerary';
import Assistant from './pages/Assistant';
import DestinationDetails from './pages/DestinationDetails';
import FoodDiscovery from './pages/FoodDiscovery';
import Journal from './pages/Journal';
import TripRecap from './pages/TripRecap';
import { LanguageProvider } from './contexts/LanguageContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const hideOnPages = [
    '/app/destination-details',
    '/app/food-discovery',
    '/app/journal',
    '/app/trip-recap'
  ];

  if (hideOnPages.includes(path)) {
    return null;
  }

  const navItems = [
    { name: 'Explore', path: '/app/explore', icon: 'explore' },
    { name: 'Plan', path: '/app/itinerary', icon: 'calendar_today' },
    { name: 'Assistant', path: '/app/assistant', icon: 'auto_awesome' },
    { name: 'Live', path: '/app/live', icon: 'navigation' },
    { name: 'Budget', path: '/app/budget', icon: 'account_balance_wallet' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg px-2 pb-6 pt-3 max-w-md mx-auto">
      {navItems.map((item) => {
        const isActive = path.startsWith(item.path);
        return (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-slate-400 dark:text-slate-500 hover:text-primary"
            )}
          >
            <span className={cn("material-symbols-outlined text-[24px]", isActive && "filled")}>
              {item.icon}
            </span>
            <p className="text-[9px] font-bold uppercase tracking-wider">{item.name}</p>
          </Link>
        );
      })}
    </nav>
  );
}

function Layout() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-md mx-auto overflow-x-hidden bg-background-light dark:bg-background-dark shadow-2xl border-x border-slate-200 dark:border-slate-800">
      <Outlet />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/app" element={<Layout />}>
            <Route path="explore" element={<Explore />} />
            <Route path="live" element={<LiveTrip />} />
            <Route path="budget" element={<Budget />} />
            <Route path="itinerary" element={<Itinerary />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="destination-details" element={<DestinationDetails />} />
            <Route path="food-discovery" element={<FoodDiscovery />} />
            <Route path="journal" element={<Journal />} />
            <Route path="trip-recap" element={<TripRecap />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
