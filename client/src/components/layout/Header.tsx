import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, ChevronDown, ChevronRight } from "lucide-react";
// import { useSearch } from "../../contexts/SearchContext";
import { logo } from "@/data/image";

interface HeaderProps {
  isTransparent?: boolean;
}

const Header = ({ isTransparent = false }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const heroHeight = useRef(0);
  const lastScrollY = useRef(0);
  const [location] = useLocation();
  //const { openSearch } = useSearch();

  // State for mobile submenu toggles
  const [aboutSubmenuOpen, setAboutSubmenuOpen] = useState(false);
  const [eventsSubmenuOpen, setEventsSubmenuOpen] = useState(false);
  const [publicationsSubmenuOpen, setPublicationsSubmenuOpen] = useState(false);

  // Check if a menu item is active based on current location
  const isActive = useCallback(
    (path: string) => {
      // Exact match for homepage
      if (path === "/" && location === "/") {
        return true;
      }

      // Special handling for various pages
      if (path === "/about" && location.startsWith("/about")) {
        return true;
      }

      if (
        path === "/research-projects" &&
        (location.startsWith("/research-projects") ||
          location.startsWith("/research-projects"))
      ) {
        return true;
      }

      if (path === "/events" && location.startsWith("/events")) {
        return true;
      }

      if (
        path === "/lecture-series" &&
        location.startsWith("/lecture-series")
      ) {
        return true;
      }

      if (path === "/publications" && location.startsWith("/publications")) {
        return true;
      }

      // For other pages, check if location starts with the path (for nested routes)
      return path !== "/" && location === path;
    },
    [location],
  );

  // Set hero height on initial load
  useEffect(() => {
    const heroSection = document.getElementById("hero-section");
    if (heroSection) {
      heroHeight.current = heroSection.offsetHeight;
    }

    // Update hero height on window resize
    const handleResize = () => {
      const heroSection = document.getElementById("hero-section");
      if (heroSection) {
        heroHeight.current = heroSection.offsetHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll event to control header appearance
  useEffect(() => {
    const handleScroll = () => {
      // Check if at the top of the page
      if (window.scrollY < 10) {
        setAtTop(true);
        setScrolled(false);
        return;
      } else {
        setAtTop(false);
      }

      // Add background and shadow after passing threshold
      if (window.scrollY > 10) {
        setScrolled(true);
        setAtTop(false);
      }

      lastScrollY.current = window.scrollY;
    };

    // Initial check on component mount or location change
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

  // Close mobile menu and reset submenus when a link is clicked
  const handleLinkClick = useCallback(() => {
    setMobileMenuOpen(false);
    setAboutSubmenuOpen(false);
    setEventsSubmenuOpen(false);
    setPublicationsSubmenuOpen(false);
  }, []);

  return (
    <header
      className={`${isTransparent && 1 > 2 ? (atTop ? "absolute" : "fixed") : "fixed"} w-full z-50 transition-all duration-300 ease-in-out translate-y-0
        ${
          isTransparent
            ? atTop
              ? "bg-transparent text-white"
              : scrolled
                ? "bg-white/95 shadow-md backdrop-blur-sm text-[#333A3D]"
                : "bg-white text-[#333A3D]"
            : "bg-white shadow-md text-[#333A3D]"
        }
      `}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <div className="p-1">
              <Link href="/" className="flex items-center group">
                <img
                  src={logo}
                  alt="CHS Logo"
                  className="h-12 mr-3 transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - Now in the same row as logo */}
          <nav className="hidden xl:block">
            <ul className="flex space-x-1 text-sm font-montserrat">
              {/* About Dropdown */}
              <li className="nav-item dropdown relative group">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/about"
                    className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 font-semibold font-montserrat group-hover:text-[#CC0033] 
                  ${isActive("/about") ? "text-[#CC0033]" : ""}
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    About
                    <ChevronDown className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                </div>
                <div
                  className="dropdown-content min-w-full w-max
 absolute hidden group-hover:block bg-white z-10 animate-fadeIn shadow-xl rounded-md border border-gray-100"
                >
                  <Link
                    onClick={handleLinkClick}
                    href="/about/rishihood"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    About Rishihood
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/chs"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    About CHS
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/vision-mission"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Vision & Mission
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/team"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Team
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/advisory-board"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Advisory Board
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/research-advisory"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Research Committee
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/internship-advisory"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Internship Committee
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/directors-note"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Director's Note
                  </Link>
                </div>
              </li>

              {/* Research */}
              <li className="nav-item">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/research-projects"
                    className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold hover:text-[#CC0033] block 
                  ${isActive("/research-projects") ? "text-[#CC0033]" : ""}
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    Research
                  </Link>
                </div>
              </li>

              {/* Courses */}
              <li className="nav-item">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/courses"
                    className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold hover:text-[#CC0033] block 
                  ${isActive("/courses") ? "text-[#CC0033]" : ""}
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    Courses
                  </Link>
                </div>
              </li>

              {/* Internships */}
              <li className="nav-item">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/internships"
                    className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold hover:text-[#CC0033] block 
                  ${isActive("/internships") ? "text-[#CC0033]" : ""}
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    Internships
                  </Link>
                </div>
              </li>

              {/* PhD Dropdown */}
              <li className="nav-item group">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/phd"
                    className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 font-semibold group-hover:text-[#CC0033]
                  ${isActive("/phd") ? "text-[#CC0033]" : ""}
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    PhD
                  </Link>
                </div>
              </li>

              {/* Publications Dropdown */}
              <li className="nav-item dropdown relative group">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/publications"
                    className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 font-semibold group-hover:text-[#CC0033]
                  ${isActive("/publications") ? "text-[#CC0033]" : ""}
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    Publications
                    <ChevronDown className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                </div>
                <div className="dropdown-content min-w-full w-max absolute z-10 hidden group-hover:block bg-white animate-fadeIn shadow-xl rounded-md border border-gray-100">
                  <Link
                    onClick={handleLinkClick}
                    href="/publications/journals"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Publications
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/publications/books"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Reports
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/publications/articles"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Books
                  </Link>
                </div>
              </li>

              {/* Simple Links (No Dropdown) */}
              <li className="nav-item">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/blogs"
                    className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold hover:text-[#CC0033] block
                  text-[#CC0033]
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    Blogs
                  </Link>
                </div>
              </li>

              <li className="nav-item dropdown relative group">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/events"
                    className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 font-semibold group-hover:text-[#CC0033] 
                  ${isActive("/events") ? "text-[#CC0033]" : ""}
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    Events
                    <ChevronDown className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                </div>
                <div className="dropdown-content min-w-full w-max absolute z-10 hidden group-hover:block bg-white animate-fadeIn shadow-xl rounded-md border border-gray-100">
                  <Link
                    onClick={handleLinkClick}
                    href="/events/conferences"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Conferences & Seminars
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/events/centre"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    Events at the Centre
                  </Link>
                  <Link
                    onClick={handleLinkClick}
                    href="/events/media"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#CC0033] transition-colors duration-200 text-[#333A3D]"
                  >
                    In the Media
                  </Link>
                </div>
              </li>

              <li className="nav-item">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/lecture-series"
                    className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold hover:text-[#CC0033] block
                  ${isActive("/lecture-series") ? "text-[#CC0033]" : ""}
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    Lectures
                  </Link>
                </div>
              </li>

              <li className="nav-item">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/media-gallery"
                    className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold hover:text-[#CC0033] block
                  ${isActive("/media-gallery") ? "text-[#CC0033]" : ""}
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    Gallery
                  </Link>
                </div>
              </li>

              <li className="nav-item">
                <div className="p-1">
                  <Link
                    onClick={handleLinkClick}
                    href="/contact"
                    className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold hover:text-[#CC0033] block
                  ${isActive("/contact") ? "text-[#CC0033]" : ""}
                  ${isTransparent && atTop ? "hover:bg-white/10 text-white" : "hover:bg-gray-50 text-[#333A3D]"}`}
                  >
                    Contact
                  </Link>
                </div>
              </li>
            </ul>
          </nav>

          {/* Search & Mobile Menu Buttons */}
          <div className="flex items-center space-x-2">
            <button
              //onClick={openSearch}
              className={`p-2 rounded-full transition-colors duration-200 ${isTransparent && atTop ? "text-white hover:text-white hover:bg-white/10" : "text-[#333A3D] hover:text-[#CC0033] hover:bg-gray-100"}`}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              type="button"
              className={`p-2 xl:hidden rounded-full transition-colors duration-200 ${isTransparent && atTop ? "text-white hover:text-white hover:bg-white/10" : "text-[#333A3D] hover:text-[#CC0033] hover:bg-gray-100"}`}
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 h-screen bg-black bg-opacity-50 z-40 xl:hidden transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={toggleMobileMenu}
      ></div>
      <div
        className={`fixed top-0 right-0 w-64 h-screen bg-white shadow-xl z-50 xl:hidden transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        id="mobile-menu"
      >
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="font-garamond font-bold text-lg text-[#CC0033]">
              Menu
            </div>
            <button className="text-[#333A3D]" onClick={toggleMobileMenu}>
              &times;
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto h-full">
          <ul className="space-y-2">
            <li className="relative">
              <div
                className={`flex items-center justify-between px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md cursor-pointer ${isActive("/about") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
                onClick={() => setAboutSubmenuOpen(!aboutSubmenuOpen)}
              >
                <span>About</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${aboutSubmenuOpen ? "rotate-180" : ""}`}
                />
              </div>
              <ul
                className={`pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${aboutSubmenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/rishihood"
                    className={`block px-3 py-2 text-sm font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md ${isActive("/about/rishihood") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
                  >
                    About Rishihood
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/chs"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    About CHS
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/vision-mission"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Vision & Mission
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/team"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Team
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/advisory-board"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Advisory Board
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/research-advisory"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Research Committee
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/internship-advisory"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Internship Committee
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/about/directors-note"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Director's Note
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                onClick={handleLinkClick}
                href="/research-projects"
                className={`block px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md ${isActive("/research-projects") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
              >
                Research
              </Link>
            </li>
            <li>
              <Link
                onClick={handleLinkClick}
                href="/courses"
                className={`block px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md ${isActive("/courses") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
              >
                Courses
              </Link>
            </li>
            <li>
              <Link
                onClick={handleLinkClick}
                href="/internships"
                className={`block px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md ${isActive("/internships") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
              >
                Internships
              </Link>
            </li>
            <li>
              <Link
                onClick={handleLinkClick}
                href="/phd"
                className={`block px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md ${isActive("/phd") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
              >
                PhD
              </Link>
            </li>
            <li className="relative">
              <div
                className={`flex items-center justify-between px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md cursor-pointer ${isActive("/publications") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
                onClick={() =>
                  setPublicationsSubmenuOpen(!publicationsSubmenuOpen)
                }
              >
                <span>Publications</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${publicationsSubmenuOpen ? "rotate-180" : ""}`}
                />
              </div>
              <ul
                className={`pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${publicationsSubmenuOpen ? "max-h-36 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/publications/journals"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Publications
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/publications/books"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Reports
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/publications/articles"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Books
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                onClick={handleLinkClick}
                href="/blogs"
                className={`block px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md ${isActive("/blogs") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
              >
                Blogs
              </Link>
            </li>
            <li className="relative">
              <div
                className={`flex items-center justify-between px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md cursor-pointer ${isActive("/events") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
                onClick={() => setEventsSubmenuOpen(!eventsSubmenuOpen)}
              >
                <span>Events</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${eventsSubmenuOpen ? "rotate-180" : ""}`}
                />
              </div>
              <ul
                className={`pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${eventsSubmenuOpen ? "max-h-52 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/events/conferences"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Conferences & Seminars
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/events/centre"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    Events at the Centre
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleLinkClick}
                    href="/events/media"
                    className="block px-3 py-2 text-sm font-medium text-[#333A3D] hover:bg-gray-50 hover:text-[#CC0033] rounded-md"
                  >
                    In the Media
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                onClick={handleLinkClick}
                href="/lecture-series"
                className={`block px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md ${isActive("/lecture-series") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
              >
                Lecture Series
              </Link>
            </li>
            <li>
              <Link
                onClick={handleLinkClick}
                href="/media-gallery"
                className={`block px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-[#CC0033] rounded-md ${isActive("/media-gallery") ? "text-[#CC0033]" : "text-[#333A3D]"}`}
              >
                Media & Gallery
              </Link>
            </li>
            <li className="pt-6 mt-6 border-t border-gray-200">
              <Link
                onClick={handleLinkClick}
                href="/contact"
                className={`block px-3 py-2 text-base font-medium text-white rounded-md text-center ${isActive("/contact") ? "bg-[#a60028]" : "bg-[#CC0033] hover:bg-[#CC0033]/90"}`}
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
