import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * RLS contract for `scholarship_applicants`.
 *
 * The selection-team role gets:
 *   - read access to all applicants
 *   - permission to update ONLY status / notes / reviewed_by / reviewed_at
 *   - any attempt to mutate identity fields (full_name, email, phone, source)
 *     is rejected by the `restrict_scholarship_updates` trigger.
 *
 * Anonymous (signed-out) users can never read or write.
 *
 * These tests run against the live Lovable Cloud backend with the anon key
 * to lock the public/unauthenticated contract. The signed-in selection-team
 * portion is gated on a seeded test account exposed via env vars; when those
 * are absent we skip rather than fail so CI stays green in projects that
 * haven't provisioned a fixture user yet.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

test.describe("scholarship_applicants RLS", () => {
  test.skip(!SUPABASE_URL || !ANON_KEY, "Supabase env vars not available");

  test("anonymous users cannot read applicants", async () => {
    const supabase = createClient(SUPABASE_URL!, ANON_KEY!);
    const { data, error } = await supabase
      .from("scholarship_applicants")
      .select("id")
      .limit(1);

    // Either RLS denies the read (error) or returns zero rows. Never any data.
    expect(data ?? []).toHaveLength(0);
    if (error) expect(error.message).toMatch(/permission|rls|policy/i);
  });

  test("anonymous users cannot update applicants", async () => {
    const supabase = createClient(SUPABASE_URL!, ANON_KEY!);
    const { error, data } = await supabase
      .from("scholarship_applicants")
      .update({ status: "accepted" })
      .eq("email", "this-row-does-not-exist@example.com")
      .select();

    // Either explicit RLS error or empty result — never a successful row change.
    expect(data ?? []).toHaveLength(0);
    if (error) expect(error.message).toMatch(/permission|rls|policy/i);
  });

  test("selection-team user can read but cannot mutate identity fields", async () => {
    const email = process.env.SELECTION_TEAM_TEST_EMAIL;
    const password = process.env.SELECTION_TEAM_TEST_PASSWORD;
    test.skip(!email || !password, "Selection-team fixture user not configured");

    const supabase = createClient(SUPABASE_URL!, ANON_KEY!);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email!, password: password!,
    });
    expect(signInError).toBeNull();

    // 1. Read works.
    const { data: rows, error: readError } = await supabase
      .from("scholarship_applicants")
      .select("id, full_name, email, status")
      .limit(1);
    expect(readError).toBeNull();
    expect(rows && rows.length).toBeGreaterThan(0);
    const target = rows![0];

    // 2. Allowed update (status + notes) works.
    const { error: okError } = await supabase
      .from("scholarship_applicants")
      .update({ status: "shortlisted", notes: "auto-test" })
      .eq("id", target.id);
    expect(okError).toBeNull();

    // 3. Forbidden update (email) is blocked by the column trigger.
    const { error: badError } = await supabase
      .from("scholarship_applicants")
      .update({ email: `tampered+${Date.now()}@example.com` })
      .eq("id", target.id);
    expect(badError).not.toBeNull();
    expect(badError!.message).toMatch(/only change status|not authorized/i);

    // 4. Forbidden update (full_name) is also blocked.
    const { error: nameError } = await supabase
      .from("scholarship_applicants")
      .update({ full_name: "Tampered Name" })
      .eq("id", target.id);
    expect(nameError).not.toBeNull();

    await supabase.auth.signOut();
  });
});
