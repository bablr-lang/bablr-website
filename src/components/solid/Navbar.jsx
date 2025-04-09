import { createSignal } from "solid-js";

const LINKS = [
  { label: "ABOUT", path: "/about" },
  { label: "DOCS", path: "https://docs.bablr.org/" },
  { label: "BLOG", path: "/blog" },
  { label: "LANGUAGES", path: "/languages" },
  { label: "PHILOSOPHY", path: "/philosophy" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <header class="max-w-6xl m-auto flex items-center justify-between p-6 relative">
      {/* Logo */}
      <div class="flex items-center space-x-2 flex-1">
        <a href="/" class="block">
          <img src="/bablr_logo.png" alt="Bablr Logo" class="h-16 w-16" />
        </a>
      </div>

      {/* Hamburger Button */}
      <button
        class="relative w-8 h-8 lg:hidden focus:outline-none z-50"
        aria-label="Toggle menu"
        onClick={() => {
          setIsOpen(!isOpen());
        }}
      >
        <span
          classList={{
            "block absolute h-0.5 w-6 bg-current transition-all duration-300 ease-in-out": true,
            "rotate-45": isOpen(),
            "-translate-y-2": !isOpen(),
          }}
        />
        <span
          classList={{
            "block absolute h-0.5 w-6 bg-current transition-all duration-300 ease-in-out": true,
            "opacity-0": isOpen(),
            "opacity-100": !isOpen(),
          }}
        />
        <span
          classList={{
            "block absolute h-0.5 w-6 bg-current transition-all duration-300 ease-in-out": true,
            "-rotate-45": isOpen(),
            "translate-y-2": !isOpen(),
          }}
        />
      </button>

      {/* Mobile Menu */}
      <nav
        classList={{
          "fixed inset-0 bg-orange-100 flex flex-col items-center justify-center z-10 transition-transform duration-300 ease-in-out lg:hidden": true,
          "translate-x-0": isOpen(),
          "translate-x-full": !isOpen(),
        }}
      >
        {LINKS.map(({ label, path }) => (
          <a
            href={path}
            class="text-gray-700 hover:text-orange-600 text-2xl my-4"
            onClick={() => setIsOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Desktop Menu */}
      <nav class="hidden lg:flex space-x-8">
        {LINKS.map(({ label, path }) => (
          <a href={path} class="text-gray-700 hover:text-orange-600">
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;
