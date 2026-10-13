"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase/browser";

const field = "mt-1.5 h-11 w-full rounded-md bg-white px-3 text-[15px] ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-signal";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get("reason");
  const [step, setStep] = useState<"password" | "mfa">(reason === "mfa" ? "mfa" : "password");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    reason === "denied" ? "This account doesn’t have shop access. Ask a super admin to give you the admin role." : null,
  );

  useEffect(() => {
    if (reason === "denied") void browserClient().auth.signOut();
  }, [reason]);

  async function finish() {
    const sb = browserClient();
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      setStep("mfa");
      return;
    }
    router.replace("/shop");
    router.refresh();
  }

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const { error } = await browserClient().auth.signInWithPassword({
      email: String(f.get("email")).trim(),
      password: String(f.get("password")),
    });
    if (error) {
      setBusy(false);
      setError(error.message === "Invalid login credentials" ? "Email or password is incorrect." : error.message);
      return;
    }
    await finish();
    setBusy(false);
  }

  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code")).replace(/\s/g, "");
    setBusy(true);
    setError(null);
    const sb = browserClient();
    const { data: factors } = await sb.auth.mfa.listFactors();
    const totp = factors?.totp?.find((f: { status: string }) => f.status === "verified");
    if (!totp) {
      setBusy(false);
      setError("No authenticator app is set up on this account. Set it up in the CRM first.");
      return;
    }
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: totp.id, code });
    setBusy(false);
    if (error) {
      setError("That code didn’t work. Check the time on your phone and enter the newest code.");
      return;
    }
    await finish();
  }

  if (step === "mfa") {
    return (
      <form onSubmit={verify} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          6-digit code from your authenticator app
          <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus className={`${field} tracking-[0.4em]`} />
        </label>
        {error ? <p role="alert" className="text-sm text-[#b42318]">{error}</p> : null}
        <button type="submit" disabled={busy} className="h-11 w-full rounded-md bg-ink font-medium text-white disabled:opacity-60">
          {busy ? "Verifying…" : "Verify and continue"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={signIn} className="mt-6 space-y-4">
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" autoComplete="email" required className={field} />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={field} />
      </label>
      {error ? <p role="alert" className="text-sm text-[#b42318]">{error}</p> : null}
      <button type="submit" disabled={busy} className="h-11 w-full rounded-md bg-ink font-medium text-white disabled:opacity-60">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
