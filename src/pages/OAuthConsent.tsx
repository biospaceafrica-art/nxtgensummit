import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import nextgenLogo from "@/assets/nextgen-logo.png";

// Local wrapper for the beta supabase.auth.oauth namespace so TS is happy.
type OAuthResult = {
  data?: { redirect_url?: string; redirect_to?: string; client?: { name?: string; redirect_uri?: string }; scope?: string };
  error?: { message: string };
};
type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<OAuthResult["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id in the request.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data ?? null);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md glass rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="text-center">
          <img src={nextgenLogo} alt="NextGen Summit" className="h-12 mx-auto mb-3" />
          <h1 className="text-xl font-display font-bold">
            Connect {details?.client?.name ?? "an app"} to NextGen Summit
          </h1>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center" role="alert">
            Could not load this authorization request: {error}
          </p>
        )}

        {!error && !details && (
          <p className="text-sm text-muted-foreground text-center">Loading…</p>
        )}

        {details && (
          <>
            <p className="text-sm text-muted-foreground">
              This lets {details.client?.name ?? "the app"} use NextGen Summit tools as you. It does
              not bypass this app's permissions or backend policies.
            </p>
            {details.client?.redirect_uri && (
              <p className="text-xs text-muted-foreground break-all">
                Redirects to: <span className="font-mono">{details.client.redirect_uri}</span>
              </p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => void decide(true)}
                disabled={busy}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {busy ? "Working…" : "Approve"}
              </Button>
              <Button
                onClick={() => void decide(false)}
                disabled={busy}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthConsent;
