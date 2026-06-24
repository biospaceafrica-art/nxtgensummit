import { lazy, Suspense, ComponentType, ReactElement } from "react";
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

// Public secondary pages (lazy)
const Register = lazy(() => import("./pages/Register"));
const Fellowship = lazy(() => import("./pages/Fellowship"));
const Speakers = lazy(() => import("./pages/Speakers"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Scholarship = lazy(() => import("./pages/Scholarship"));
const PlantASeed = lazy(() => import("./pages/PlantASeed"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Volunteer = lazy(() => import("./pages/Volunteer"));
const Networking = lazy(() => import("./pages/Networking"));
const Badge = lazy(() => import("./pages/Badge"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Admin bundle (heaviest — strictly lazy + prefetchable)
const adminImport = () => import("./pages/Admin");
const adminLoginImport = () => import("./pages/AdminLogin");
const Admin = lazy(adminImport);
const AdminLogin = lazy(adminLoginImport);

// Expose prefetchers so links can warm the chunk on hover/focus
export const prefetchAdmin = () => {
  adminImport();
  adminLoginImport();
};

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

// Wrap a single lazy element in its own Suspense so transitions
// between routes never unmount sibling pages or layout chrome.
const lazyRoute = (Component: ComponentType): ReactElement => (
  <Suspense fallback={<RouteFallback />}>
    <Component />
  </Suspense>
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={lazyRoute(Register)} />
            <Route path="/fellowship" element={lazyRoute(Fellowship)} />
            <Route path="/speakers" element={lazyRoute(Speakers)} />
            <Route path="/schedule" element={lazyRoute(Schedule)} />
            <Route path="/scholarship" element={lazyRoute(Scholarship)} />
            <Route path="/plant-a-seed" element={lazyRoute(PlantASeed)} />
            <Route path="/feedback" element={lazyRoute(Feedback)} />
            <Route path="/gallery" element={lazyRoute(Gallery)} />
            <Route path="/volunteer" element={lazyRoute(Volunteer)} />
            <Route path="/networking" element={lazyRoute(Networking)} />
            <Route path="/badge" element={lazyRoute(Badge)} />
            <Route path="/check-in" element={lazyRoute(CheckIn)} />
            <Route path="/login" element={lazyRoute(Login)} />
            <Route path="/login" element={lazyRoute(Login)} />
            <Route path="/signup" element={lazyRoute(Signup)} />
            <Route path="/forgot-password" element={lazyRoute(ForgotPassword)} />
            <Route path="/reset-password" element={lazyRoute(ResetPassword)} />
            <Route path="/admin/login" element={lazyRoute(AdminLogin)} />
            <Route path="/admin" element={lazyRoute(Admin)} />
            {/* Catch-all for any /admin/* sub-path: Admin handles auth + redirects
                unauthenticated users to /admin/login. */}
            <Route path="/admin/*" element={lazyRoute(Admin)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
