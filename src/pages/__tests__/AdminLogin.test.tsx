import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// Mock supabase client used across the admin pages.
const signInWithPassword = vi.fn();
const getSession = vi.fn();
const onAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));
const signOut = vi.fn();
const invoke = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...a: unknown[]) => signInWithPassword(...(a as [])),
      getSession: (...a: unknown[]) => getSession(...(a as [])),
      onAuthStateChange: (...a: unknown[]) => onAuthStateChange(...(a as [])),
      signOut: (...a: unknown[]) => signOut(...(a as [])),
      updateUser: vi.fn(),
    },
    functions: { invoke: (...a: unknown[]) => invoke(...(a as [])) },
    from: () => ({
      select: () => ({ order: () => Promise.resolve({ data: [] }) }),
    }),
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// Use lazy() to mimic App.tsx behavior so we exercise the Suspense boundary.
const AdminLogin = lazy(() => import("../AdminLogin"));
const Admin = lazy(() => import("../Admin"));

const Fallback = () => <div data-testid="route-fallback">loading</div>;

const renderApp = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<Fallback />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<Fallback />}>
              <Admin />
            </Suspense>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("Admin auth flow (e2e)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form when navigating to /admin/login", async () => {
    renderApp("/admin/login");
    expect(await screen.findByRole("heading", { name: /admin login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("redirects unauthenticated visitors from /admin to /admin/login", async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    renderApp("/admin");

    // The Admin page mounts, sees no session, and pushes to /admin/login,
    // so the login heading should eventually appear.
    expect(await screen.findByRole("heading", { name: /admin login/i }, { timeout: 4000 })).toBeInTheDocument();
    expect(getSession).toHaveBeenCalled();
  });

  it("renders the admin dashboard when an authorized session exists", async () => {
    const session = {
      user: { id: "u1", email: "admin@example.com" },
      access_token: "token",
    };
    getSession.mockResolvedValue({ data: { session } });
    invoke.mockResolvedValue({ data: { isAdmin: true } });

    renderApp("/admin");

    // Admin.tsx renders the "Admin Dashboard" header once auth resolves.
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /admin login/i })).not.toBeInTheDocument();
    }, { timeout: 4000 });
    expect(invoke).toHaveBeenCalledWith(
      "check-admin",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });
});
