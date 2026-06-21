import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LogoIcon } from "./LogoIcon";
import { OpenWalletButton } from "../wallet/OpenWalletButton";

const links: { label: string; to: string }[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Protocol", to: "/protocol" },
  { label: "AURUM", to: "/aurum" },
  { label: "sAURUM", to: "/saurum" },
  { label: "Reserves", to: "/reserves" },
  { label: "Profile", to: "/profile" },
  { label: "Docs", to: "/docs" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
      <nav
        aria-label="Primary"
        className="max-w-[88rem] mx-auto flex items-center justify-between"
      >
        <Link to="/" className="flex items-center gap-2 text-black">
          <LogoIcon className="w-7 h-7" />
          <span className="text-2xl font-medium tracking-tight">Magmos</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-base text-gray-700 hover:text-black font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <OpenWalletButton className="hidden md:inline-flex bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors" />
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-black"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden mt-3 max-w-[88rem] mx-auto rounded-2xl bg-white shadow-lg border border-black/5 p-4 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-xl text-black hover:bg-black/5 font-medium"
            >
              {l.label}
            </Link>
          ))}
          <OpenWalletButton
            onClick={() => setMobileOpen(false)}
            className="mt-2 bg-black text-white font-medium px-6 py-3 rounded-full hover:bg-gray-800 transition-colors text-center"
          />
        </div>
      )}
    </header>
  );
}
