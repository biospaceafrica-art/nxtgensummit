import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Fellowship from "./pages/Fellowship";
import Speakers from "./pages/Speakers";
import Schedule from "./pages/Schedule";
import Scholarship from "./pages/Scholarship";
import PlantASeed from "./pages/PlantASeed";
import Feedback from "./pages/Feedback";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Gallery from "./pages/Gallery";
import Volunteer from "./pages/Volunteer";
import Networking from "./pages/Networking";
import Badge from "./pages/Badge";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/fellowship" element={<Fellowship />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/scholarship" element={<Scholarship />} />
            <Route path="/plant-a-seed" element={<PlantASeed />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/networking" element={<Networking />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
