import { Globe, Mail } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-16 px-6 mt-auto bg-[#0a0a0a]/50 w-full">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-4 w-fit">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#d97757] opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-500" />
                <Globe className="w-5 h-5 text-[#d97757] relative z-10" strokeWidth={1.5} />
              </div>
              <span className="font-serif text-2xl tracking-tight text-white group-hover:text-[#e6dfd9] transition-colors">
                Nebula.
              </span>
            </Link>
            <p className="text-[#a1a1aa] text-sm leading-relaxed max-w-sm mb-6">
              An operating system designed for curiosity. Explore data modules spanning from the Earth's core to deep space, brought together in one elegant dashboard.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/LaunchTogether/Nebula" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:bg-white/10 hover:text-white transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:bg-white/10 hover:text-white transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:bg-white/10 hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-medium mb-4">Modules</h4>
            <ul className="space-y-3">
              <li><Link href="/earth" className="text-[#a1a1aa] hover:text-[#d97757] transition-colors text-sm">Earth Events</Link></li>
              <li><Link href="/space" className="text-[#a1a1aa] hover:text-[#d97757] transition-colors text-sm">Spaceflight News</Link></li>
              <li><Link href="/iss" className="text-[#a1a1aa] hover:text-[#d97757] transition-colors text-sm">Live ISS Tracking</Link></li>
              <li><Link href="/spacex" className="text-[#a1a1aa] hover:text-[#d97757] transition-colors text-sm">SpaceX Launches</Link></li>
              <li><Link href="/solar" className="text-[#a1a1aa] hover:text-[#d97757] transition-colors text-sm">Solar Intelligence</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-medium mb-4">Data Sources</h4>
            <ul className="space-y-3">
              <li><a href="https://api.nasa.gov/" target="_blank" rel="noreferrer" className="text-[#a1a1aa] hover:text-white transition-colors text-sm flex items-center gap-2">NASA Open APIs ↗</a></li>
              <li><a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php" target="_blank" rel="noreferrer" className="text-[#a1a1aa] hover:text-white transition-colors text-sm flex items-center gap-2">USGS Earthquakes ↗</a></li>
              <li><a href="https://github.com/r-spacex/SpaceX-API" target="_blank" rel="noreferrer" className="text-[#a1a1aa] hover:text-white transition-colors text-sm flex items-center gap-2">SpaceX API ↗</a></li>
              <li><a href="https://spaceflightnewsapi.net/" target="_blank" rel="noreferrer" className="text-[#a1a1aa] hover:text-white transition-colors text-sm flex items-center gap-2">Spaceflight News ↗</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#71717a] text-sm text-center md:text-left">
            © {new Date().getFullYear()} Nebula. Designed for discovery.
          </p>
          <div className="flex items-center gap-6 text-sm text-[#71717a]">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
