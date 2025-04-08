import { useState } from "react";
// import Bablr from "../images/bablr_logo.png";

const LINKS = ["ABOUT", "DOCS", "BLOG", "TUTORIALS", "LANGUAGES"];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header class="flex items-center justify-between p-6 relative">
      {/* Logo */}
      <div class="flex items-center space-x-2 flex-1">
        <img src="/bablr_logo.png" alt="Bablr Logo" class="h-16 w-16" />
      </div>

      {/* Hamburger / Close Button */}
      <button
        class="relative w-8 h-8 lg:hidden focus:outline-none z-50"
        aria-label="Toggle menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        {/* <div class="absolute w-8 h-8 flex flex-col justify-center items-center"> */}
        {/* Top bar */}
        <span
          class={`block absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
            isOpen ? "rotate-45" : "-translate-y-2"
          }`}
        />
        {/* Middle bar */}
        <span
          class={`block absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Bottom bar */}
        <span
          class={`block absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
            isOpen ? "-rotate-45" : "translate-y-2"
          }`}
        />
        {/* </div> */}
      </button>

      {/* Mobile Menu Overlay */}
      <nav
        class={` z-10 fixed inset-0 bg-orange-100 flex flex-col items-center justify-center
          transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {LINKS.map((label) => (
          <a
            key={label}
            href="/"
            class="text-gray-700 hover:text-orange-600 text-2xl my-4"
            onClick={() => setIsOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Desktop Menu */}
      <nav class="hidden lg:flex space-x-8">
        {LINKS.map((label) => (
          <a
            key={label}
            href="/"
            class="text-gray-700 hover:text-orange-600"
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;
