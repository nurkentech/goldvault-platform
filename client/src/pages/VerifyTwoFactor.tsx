import { type FormEvent, useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

function getSafeReturnPath(): string {
  const requestedPath = new URLSearchParams(window.location.search).get(
    "returnPath",
  );
  if (
    requestedPath?.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    requestedPath !== "/verify-2fa"
  ) {
    return requestedPath;
  }
  return "/dashboard";
}

export default function VerifyTwoFactor() {
  const [code, setCode] = useState("");
  const returnPath = useMemo(getSafeReturnPath, []);
  const utils = trpc.useUtils();
  const status = trpc.twoFactor.loginStatus.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const me = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (status.data?.required === false && me.data) {
      window.location.replace(returnPath);
    }
  }, [me.data, returnPath, status.data?.required]);

  const verify = trpc.twoFactor.completeLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      const authenticatedUser = await utils.auth.me.fetch();
      if (!authenticatedUser) {
        toast.error(
          "Verification succeeded, but the secure session could not be confirmed. Please sign in again.",
        );
        return;
      }
      window.location.replace(returnPath);
    },
    onError: error => toast.error(error.message),
  });
  const sms = trpc.twoFactor.sendLoginSms.useMutation({
    onSuccess: () => toast.success("SMS verification code sent"),
    onError: error => toast.error(error.message),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length < 6 || verify.isPending) return;
    verify.mutate({ code: normalizedCode });
  };

  const sessionExpired =
    status.data?.required === false && !me.isLoading && !me.data;

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-card p-7 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold">Two-factor verification</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your authenticator, SMS, or backup code to finish signing in.
        </p>

        {(status.isLoading || (status.data?.required === false && me.isLoading)) && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking your secure session…
          </div>
        )}

        {status.error && (
          <div className="mt-6">
            <p className="text-sm text-red-400">{status.error.message}</p>
            <button
              type="button"
              onClick={() => status.refetch()}
              className="mt-3 rounded-xl border border-white/10 px-4 py-2 text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {sessionExpired && (
          <div className="mt-6">
            <p className="text-sm text-red-400">
              This verification session has expired. Please sign in again to
              request a new code.
            </p>
            <button
              type="button"
              onClick={() => window.location.replace("/?auth=login")}
              className="mt-3 w-full rounded-xl bg-amber-500 p-3 font-semibold text-black"
            >
              Return to sign in
            </button>
          </div>
        )}

        {status.data?.required && (
          <form onSubmit={submit}>
            <input
              autoFocus
              aria-label="Two-factor verification code"
              autoComplete="one-time-code"
              value={code}
              onChange={event => setCode(event.target.value)}
              className="mt-6 w-full rounded-xl border border-white/10 bg-background p-3 text-center font-mono tracking-widest"
              placeholder="000000 or backup code"
            />
            <button
              type="submit"
              disabled={code.trim().length < 6 || verify.isPending}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 p-3 font-semibold text-black disabled:opacity-50"
            >
              {verify.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {verify.isPending ? "Verifying…" : "Verify and open dashboard"}
            </button>
            <button
              type="button"
              disabled={sms.isPending}
              onClick={() => sms.mutate()}
              className="mt-3 text-sm text-blue-400 disabled:opacity-50"
            >
              {sms.isPending ? "Sending SMS…" : "Send SMS fallback"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
