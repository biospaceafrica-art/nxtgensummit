import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import CountdownBanner from "@/components/layout/CountdownBanner";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Register = lazy(() => import("./pages/Register"));
const Fellowship = lazy(() => import("./pages/Fellowship"));
const Speakers = lazy(() => import("./pages/Speakers"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Scholarship = lazy(() => import("./pages/Scholarship"));
const PlantASeed = lazy(() => import("./pages/PlantASeed"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Volunteer = lazy(() => import("./pages/Volunteer"));
const Networking = lazy(() => import("./pages/Networking"));
const Badge = lazy(() => import("./pages/Badge"));
const CheckIn = lazy(() => import("./pages/CheckIn"));

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CountdownBanner />
        <Navbar />
        <main>
          <Suspense fallback={<RouteFallback />}>
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
            <Route path="/badge" element={<Badge />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </main>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
