import { Globe, Github, Twitter, Mail } from "lucide-react";
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
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:bg-white/10 hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
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
