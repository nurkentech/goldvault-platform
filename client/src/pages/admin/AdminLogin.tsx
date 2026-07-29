import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Shield, Loader2, Eye, EyeOff, KeyRound, LifeBuoy } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [pre2faToken, setPre2faToken] = useState("");
  const [totpCode, setTotpCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Recovery code state
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");

  const finishLogin = async () => {
    await utils.adminAuth.me.invalidate();
    const admin = await utils.adminAuth.me.fetch();
    if (!admin) {
      toast.error("The secure admin session could not be loaded. Please try again.");
      return;
    }
    toast.success("Login successful");
    navigate("/admin");
  };

  const loginMutation = trpc.adminAuth.login.useMutation({
    onSuccess: async (data) => {
      if (data.requires2FA && data.pre2faToken) {
        setRequires2FA(true);
        setPre2faToken(data.pre2faToken);
        toast.info("Enter your 2FA code to continue");
      } else {
        await finishLogin();
      }
    },
    onError: (err) => {
      toast.error(err.message || "Invalid credentials");
    },
  });

  const verify2FAMutation = trpc.adminAuth.verify2FALogin.useMutation({
    onSuccess: async () => {
      await finishLogin();
    },
    onError: (err) => {
      toast.error(err.message || "Invalid 2FA code");
      setTotpCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const verifyRecoveryMutation = trpc.adminAuth.verifyRecoveryCode.useMutation({
    onSuccess: async (data) => {
      if (data.remainingCodes !== undefined && data.remainingCodes <= 2) {
        toast.warning(`Only ${data.remainingCodes} recovery code(s) remaining. Please regenerate codes.`);
      }
      await finishLogin();
    },
    onError: (err) => {
      toast.error(err.message || "Invalid recovery code");
      setRecoveryCode("");
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...totpCode];
    newCode[index] = value.slice(-1);
    setTotpCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !totpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setTotpCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    const code = totpCode.join("");
    if (code.length === 6 && requires2FA && pre2faToken && !useRecoveryCode) {
      verify2FAMutation.mutate({ pre2faToken, code });
    }
  }, [totpCode]);

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = totpCode.join("");
    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    verify2FAMutation.mutate({ pre2faToken, code });
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim()) {
      toast.error("Please enter a recovery code");
      return;
    }
    verifyRecoveryMutation.mutate({ pre2faToken, recoveryCode: recoveryCode.trim() });
  };

  return (
    <div className="min-h-screen bg-[#080d19] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-4">
            {requires2FA ? (
              useRecoveryCode ? <LifeBuoy className="w-8 h-8 text-black" /> : <KeyRound className="w-8 h-8 text-black" />
            ) : (
              <Shield className="w-8 h-8 text-black" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {requires2FA
              ? useRecoveryCode
                ? "Recovery Code"
                : "Two-Factor Authentication"
              : "Admin Panel"}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {requires2FA
              ? useRecoveryCode
                ? "Enter one of your backup recovery codes"
                : "Enter the code from your authenticator app"
              : "GoldVaults Administration"}
          </p>
        </div>

        {!requires2FA ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="bg-[#0d1321] border border-gray-800/60 rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoComplete="username"
                className="w-full h-11 px-4 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full h-11 px-4 pr-11 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        ) : useRecoveryCode ? (
          /* Recovery Code Form */
          <form onSubmit={handleRecoverySubmit} className="bg-[#0d1321] border border-gray-800/60 rounded-2xl p-8 space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Recovery Code</label>
              <input
                type="text"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                autoFocus
                className="w-full h-12 px-4 bg-[#080d19] border border-gray-800 rounded-lg text-base text-white text-center font-mono tracking-wider placeholder:text-gray-700 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <p className="text-[10px] text-gray-600 mt-2">Each recovery code can only be used once</p>
            </div>

            <button
              type="submit"
              disabled={verifyRecoveryMutation.isPending || !recoveryCode.trim()}
              className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifyRecoveryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Use Recovery Code"
              )}
            </button>

            <button
              type="button"
              onClick={() => { setUseRecoveryCode(false); setRecoveryCode(""); }}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Use authenticator app instead
            </button>
          </form>
        ) : (
          /* 2FA TOTP Verification Form */
          <form onSubmit={handle2FASubmit} className="bg-[#0d1321] border border-gray-800/60 rounded-2xl p-8 space-y-6">
            <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
              {totpCode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  autoFocus={i === 0}
                  className="w-12 h-14 text-center text-xl font-bold bg-[#080d19] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={verify2FAMutation.isPending || totpCode.join("").length !== 6}
              className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verify2FAMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setUseRecoveryCode(true)}
                className="w-full text-center text-xs text-amber-400/80 hover:text-amber-400 transition-colors"
              >
                Lost your device? Use a recovery code
              </button>
              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setPre2faToken("");
                  setTotpCode(["", "", "", "", "", ""]);
                  setUseRecoveryCode(false);
                }}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gray-600 mt-6">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
