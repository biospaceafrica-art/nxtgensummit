import { Link } from "react-router-dom";
import nextgenLogo from "@/assets/nextgen-logo.png";

const Footer = () => (
  <footer className="bg-secondary border-t border-border">
    <div className="container py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <img src={nextgenLogo} alt="Next Generation Summit logo" className="h-12 w-auto mb-3" />
          <p className="text-sm text-muted-foreground mt-3 max-w-md">
            Next Generation Summit 2026 — Raising the Next Generation of Faith-Driven Business and Career Leaders.
            A Strategy for Global Missions and Evangelism.
          </p>
          <p className="text-xs text-muted-foreground mt-4">The Purple Place, Lokogoma, Abuja • June 20, 2026</p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4 text-foreground">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">Register</Link>
            <Link to="/fellowship" className="text-sm text-muted-foreground hover:text-primary transition-colors">Fellowship Programs</Link>
            <Link to="/speakers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Speakers</Link>
            <Link to="/schedule" className="text-sm text-muted-foreground hover:text-primary transition-colors">Schedule</Link>
            <Link to="/plant-a-seed" className="text-sm text-muted-foreground hover:text-primary transition-colors">Plant a Seed</Link>
            <a href="https://theplatformnigeria.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Scholarship</a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4 text-foreground">Connect</h4>
          <div className="flex flex-col gap-2">
            <a href="https://www.youtube.com/@HamiltonGabriel" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">YouTube</a>
            <a href="https://www.instagram.com/nextgenerationsummit" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Instagram</a>
            <a href="https://www.facebook.com/nextgenerationsummit" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Facebook</a>
            <a href="https://nextgenerationsummit.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Website</a>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">© 2026 Next Generation Summit. All rights reserved.</p>
        <p className="text-xs text-muted-foreground">
          Powered by <span className="text-primary font-semibold">The Tribe Africa</span>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
