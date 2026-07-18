"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Satellite,
  Zap,
  Search,
  Menu,
  X,
  Activity,
  Rocket,
  Star,
  Newspaper,
} from "lucide-react";
import { SearchModal } from "@/components/ui/search-modal";

const navItems = [
  { href: "/", label: "Home", icon: Star },
  { href: "/dashboard", label: "Dashboard", icon: Globe },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/space", label: "Space", icon: Satellite },
  { href: "/earth", label: "Earth", icon: Activity },
  { href: "/launches", label: "Launches", icon: Rocket },
  { href: "/timeline", label: "Timeline", icon: Zap },
  { href: "/favorites", label: "Favorites", icon: Star },
];

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "UTC",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* Floating Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center pt-4 md:pt-6 px-4`}
      >
        <div 
          className={`w-full max-w-7xl flex items-center justify-between transition-all duration-500 rounded-2xl ${
            scrolled
              ? "bg-[#121212]/70 backdrop-blur-3xl border border-white/10 px-4 md:px-6 py-3 shadow-2xl"
              : "bg-transparent border-transparent px-2 md:px-4 py-4"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#d97757] opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-500" />
              <Globe className="w-5 h-5 text-[#d97757] relative z-10" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-xl tracking-tight text-white group-hover:text-[#e6dfd9] transition-colors">
              Nebula.
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-full text-sm font-sans transition-all duration-300 ${
                    isActive
                      ? "text-[#fafafa] font-medium"
                      : "text-[#71717a] hover:text-[#d97757]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/5 border border-white/10 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side controls */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setSearchOpen(true)}>
              <Search className="w-4 h-4 text-[#71717a] group-hover:text-[#fafafa] transition-colors" />
              <div className="flex items-center gap-1">
                <kbd className="hidden lg:inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-mono text-[#71717a] bg-white/5 border border-white/10 rounded">
                  ⌘K
                </kbd>
              </div>
            </div>
            
            <div className="w-[1px] h-4 bg-white/10" />

            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span
                className="text-xs font-mono text-[#a1a1aa] tracking-widest"
                aria-label="UTC Time"
              >
                {time}
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-24 z-40 bg-[#121212]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-4 md:hidden overflow-hidden"
          >
            <div className="flex flex-col space-y-1">
              {navItems.map((item, i) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.href}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-sans transition-all ${
                        isActive
                          ? "bg-white/5 text-[#fafafa] border border-white/5"
                          : "text-[#71717a] hover:text-[#d97757] hover:bg-white/[0.02]"
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
