import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import nextgenLogo from "@/assets/nextgen-logo.png";

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Speakers", href: "/speakers" },
  { label: "Schedule", href: "/schedule" },
  { label: "Fellowship", href: "/fellowship" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Networking", href: "/networking" },
  { label: "Be a Door Opener", href: "/plant-a-seed" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-9 left-0 right-0 z-50 glass">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <img src={nextgenLogo} alt="Next Generation Summit logo" className="h-10 sm:h-12 w-auto" />
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/register">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Register Free
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden glass border-t border-border">
          <div className="container py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
            <Link to="/register" onClick={() => setOpen(false)}>
              <Button className="w-full bg-primary text-primary-foreground">Register Free</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
