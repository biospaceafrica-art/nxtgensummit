import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
        <Route
          path="/admin/*"
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

    expect(
      await screen.findByRole("heading", { name: /admin login/i }, { timeout: 4000 }),
    ).toBeInTheDocument();
    expect(getSession).toHaveBeenCalled();
  });

  // Parameterised: every /admin/* sub-path must redirect when unauthenticated.
  const subPaths = [
    "/admin/volunteers",
    "/admin/registrations",
    "/admin/analytics",
    "/admin/check-ins",
    "/admin/feedback",
    "/admin/anything-else",
  ];
  it.each(subPaths)(
    "redirects unauthenticated users from %s to /admin/login",
    async (path) => {
      getSession.mockResolvedValue({ data: { session: null } });
      renderApp(path);
      expect(
        await screen.findByRole("heading", { name: /admin login/i }, { timeout: 4000 }),
      ).toBeInTheDocument();
    },
  );

  it("renders the admin dashboard when an authorized session exists", async () => {
    const session = {
      user: { id: "u1", email: "admin@example.com" },
      access_token: "token",
    };
    getSession.mockResolvedValue({ data: { session } });
    invoke.mockResolvedValue({ data: { isAdmin: true } });

    renderApp("/admin");

    await waitFor(
      () => {
        expect(screen.queryByRole("heading", { name: /admin login/i })).not.toBeInTheDocument();
      },
      { timeout: 4000 },
    );
    expect(invoke).toHaveBeenCalledWith(
      "check-admin",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("logging out from /admin signs out and redirects to /admin/login", async () => {
    const session = {
      user: { id: "u1", email: "admin@example.com" },
      access_token: "token",
    };
    // First call: authorized — render dashboard.
    getSession.mockResolvedValueOnce({ data: { session } });
    invoke.mockResolvedValue({ data: { isAdmin: true } });
    signOut.mockResolvedValue({ error: null });

    renderApp("/admin");

    // Wait for the dashboard to render (logout button present).
    const logoutBtn = await screen.findByRole(
      "button",
      { name: /log\s*out|sign\s*out|logout/i },
      { timeout: 4000 },
    );

    fireEvent.click(logoutBtn);

    await waitFor(() => expect(signOut).toHaveBeenCalled());
    // After signOut, Admin's navigate("/admin/login") fires — login heading appears.
    expect(
      await screen.findByRole("heading", { name: /admin login/i }, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it("after logout, revisiting an /admin/* sub-path still redirects to login", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    renderApp("/admin/volunteers");
    expect(
      await screen.findByRole("heading", { name: /admin login/i }, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it("redirects to /admin/login when the session expires while on /admin", async () => {
    const session = {
      user: { id: "u1", email: "admin@example.com" },
      access_token: "token",
    };
    getSession.mockResolvedValueOnce({ data: { session } });
    invoke.mockResolvedValue({ data: { isAdmin: true } });

    // Capture the auth state callback so we can fire SIGNED_OUT later.
    let authCallback: ((event: string, session: unknown) => void) | null = null;
    onAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    renderApp("/admin");

    // Wait until the dashboard has rendered.
    await screen.findByRole(
      "button",
      { name: /log\s*out|sign\s*out|logout/i },
      { timeout: 4000 },
    );

    // Simulate Supabase emitting SIGNED_OUT due to token/session expiry.
    expect(authCallback).not.toBeNull();
    authCallback!("SIGNED_OUT", null);

    expect(
      await screen.findByRole("heading", { name: /admin login/i }, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it("redirects an already-authenticated admin from /admin/login to /admin", async () => {
    const session = {
      user: { id: "u1", email: "admin@example.com" },
      access_token: "token",
    };
    getSession.mockResolvedValue({ data: { session } });
    invoke.mockResolvedValue({ data: { isAdmin: true } });

    renderApp("/admin/login");

    // The login form mounts first, then the redirect effect kicks in once
    // check-admin resolves and the dashboard takes over.
    await waitFor(
      () => {
        expect(screen.queryByRole("heading", { name: /admin login/i })).not.toBeInTheDocument();
      },
      { timeout: 4000 },
    );
    expect(invoke).toHaveBeenCalledWith(
      "check-admin",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });
});
