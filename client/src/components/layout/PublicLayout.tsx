import React from "react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import Footer from "./Footer";
import { Button } from "@/components/ui/button";
import {
  Search,
  Menu,
  X,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logo } from "@/data/image";

import Header from "./Header";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector("header");
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    // Initial measurement
    updateHeaderHeight();

    // Update on window resize
    window.addEventListener("resize", updateHeaderHeight);

    // Cleanup
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, [location]);

  return (
    <div className="bg-white text-[#333A3D] min-h-screen flex flex-col">
      {/* Header */}
      <Header isTransparent={false} />
      {/* Main content */}
      <main
        className="flex-grow"
        style={{
          paddingTop: `${headerHeight}px`,
        }}
      >
        {children}
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
