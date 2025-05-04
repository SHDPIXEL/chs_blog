import { Link } from "wouter";
import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowUp,
} from "lucide-react";
import { logo } from "@/data/image";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        {/* Compact Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex items-center mb-4 md:mb-0">
            <img
              src={logo}
              alt="CHS Logo"
              className="h-10 mr-3 transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="flex space-x-6 mb-4 md:mb-0">
            <div className="flex items-center text-xs text-[#333A3D]/80">
              <Mail className="h-4 w-4 mr-1 text-[#CC0033]" />
              <a
                href="mailto:chs@rishihood.edu.in"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                chs@rishihood.edu.in
              </a>
            </div>
            <div className="flex items-center text-xs text-[#333A3D]/80">
              <Phone className="h-4 w-4 mr-1 text-[#CC0033]" />
              <a
                href="tel:+911234567890"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                +91 123 456 7890
              </a>
            </div>
          </div>

          <div className="flex space-x-2">
            <a
              href="#"
              className="text-[#333A3D]/80 hover:text-[#CC0033] transition-colors duration-200 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="text-[#333A3D]/80 hover:text-[#CC0033] transition-colors duration-200 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="text-[#333A3D]/80 hover:text-[#CC0033] transition-colors duration-200 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="text-[#333A3D]/80 hover:text-[#CC0033] transition-colors duration-200 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links - Horizontal */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[#333A3D]/70">
            <li>
              <Link
                href="/about"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/research-projects"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Research
              </Link>
            </li>
            <li>
              <Link
                href="/courses"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                courses
              </Link>
            </li>
            <li>
              <Link
                href="/internships"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Internships
              </Link>
            </li>
            <li>
              <Link
                href="/phd"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                PhD
              </Link>
            </li>
            <li>
              <Link
                href="/publications"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Publications
              </Link>
            </li>
            <li>
              <Link
                href="/blogs"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="/lecture-series"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Lectures
              </Link>
            </li>
            <li>
              <Link
                href="/media-gallery"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-[#333A3D]/60 mb-2 md:mb-0">
              © 2025 Centre for Human Sciences, Rishihood University. All
              rights reserved.
            </p>
            <div className="flex space-x-4 text-xs text-[#333A3D]/60">
              <Link
                href="/privacy-policy"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span>|</span>
              <Link
                href="/terms-of-use"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Terms of Use
              </Link>
              <span>|</span>
              <Link
                href="/sitemap"
                className="hover:text-[#CC0033] transition-colors duration-200"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
