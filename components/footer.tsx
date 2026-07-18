import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-[#71717a]" strokeWidth={1.5} />
          <span className="font-serif text-lg tracking-tight text-[#fafafa]">
            Nebula.
          </span>
        </div>
        <p className="text-[#71717a] text-sm text-center">
          Designed for discovery. Data provided by NASA, USGS, NOAA, and Open-Meteo.
        </p>
        <div className="text-[#71717a] text-sm">
          © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
