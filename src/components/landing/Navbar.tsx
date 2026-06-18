import { LogoIcon } from "./LogoIcon";

const links = ["Protocol", "AURUM", "sAURUM", "Reserves", "Docs"];

export function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
      <div className="max-w-[88rem] mx-auto flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-black">
          <LogoIcon className="w-7 h-7" />
          <span className="text-2xl font-medium tracking-tight">Magmos</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-base text-gray-700 hover:text-black font-medium transition-colors duration-200"
            >
              {l}
            </a>
          ))}
        </div>
        <a
          href="#launch"
          className="bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200"
        >
          Launch App
        </a>
      </div>
    </nav>
  );
}
