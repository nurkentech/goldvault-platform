import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Eye, EyeOff, Loader2, CheckCircle, User, Mail, Lock,
  ShieldCheck, ShieldOff, QrCode, Copy, Download, RefreshCw,
  ArrowRight, ArrowLeft, Sparkles, KeyRound
} from "lucide-react";
import { toast } from "sonner";

// ─── Step-by-Step 2FA Setup Wizard ───────────────────────────────────────────

type WizardStep = "intro" | "scan" | "verify" | "recovery" | "complete";

function TwoFactorWizard({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [step, setStep] = useState<WizardStep>("intro");
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [codesCopied, setCodesCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const setupMutation = trpc.adminAuth.setup2FA.useMutation({
    onSuccess: (data) => {
      setSetupData({ secret: data.secret, qrCode: data.qrCode });
      setStep("scan");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate 2FA setup");
    },
  });

  const enableMutation = trpc.adminAuth.enable2FA.useMutation({
    onSuccess: (data) => {
      setRecoveryCodes(data.recoveryCodes || []);
      setStep("recovery");
    },
    onError: (err) => {
      toast.error(err.message || "Invalid code. Please try again.");
      setVerifyCode("");
    },
  });

  const handleCopyCodes = () => {
    const text = recoveryCodes.join("\n");
    navigator.clipboard.writeText(text);
    setCodesCopied(true);
    toast.success("Recovery codes copied to clipboard");
    setTimeout(() => setCodesCopied(false), 3000);
  };

  const handleDownloadCodes = () => {
    const text = `GoldVaults Admin - 2FA Recovery Codes\n${"=".repeat(40)}\n\nGenerated: ${new Date().toISOString()}\n\nEach code can only be used once.\nStore these codes in a safe place.\n\n${recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "goldvaults-admin-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Recovery codes downloaded");
  };

  const handleComplete = () => {
    setShowSuccess(true);
    setTimeout(() => {
      utils.adminAuth.me.invalidate();
      onClose();
    }, 2500);
  };

  // Step indicators
  const steps: { key: WizardStep; label: string; num: number }[] = [
    { key: "scan", label: "Scan QR", num: 1 },
    { key: "verify", label: "Verify", num: 2 },
    { key: "recovery", label: "Backup", num: 3 },
    { key: "complete", label: "Done", num: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  if (showSuccess) {
    return (
      <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-8 text-center space-y-4">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20 w-20 h-20" />
          <div className="relative w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mt-4">2FA Enabled Successfully!</h3>
        <p className="text-sm text-gray-400">Your account is now protected with two-factor authentication.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl overflow-hidden">
      {/* Progress bar */}
      {step !== "intro" && (
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i <= currentStepIndex
                    ? "bg-amber-500 text-black"
                    : "bg-gray-800 text-gray-500"
                }`}>
                  {i < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : s.num}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 sm:w-16 h-0.5 mx-1 transition-all duration-500 ${
                    i < currentStepIndex ? "bg-amber-500" : "bg-gray-800"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500">
            {steps.map((s) => (
              <span key={s.key} className={s.key === step ? "text-amber-400" : ""}>{s.label}</span>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* INTRO STEP */}
        {step === "intro" && (
          <div className="text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Enable Two-Factor Authentication</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                Add an extra layer of security to your admin account. You'll need an authenticator app like Google Authenticator, Authy, or 1Password.
              </p>
            </div>
            <div className="bg-[#080d19] border border-gray-800 rounded-lg p-4 text-left space-y-3">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">What you'll need:</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">1.</span>
                  An authenticator app on your phone
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">2.</span>
                  A safe place to store backup recovery codes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">3.</span>
                  About 2 minutes of your time
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 border border-gray-800 text-gray-400 font-medium rounded-lg text-sm hover:bg-gray-800/50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.isPending}
                className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {setupMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                ) : (
                  <>Get Started <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SCAN QR STEP */}
        {step === "scan" && setupData && (
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Scan QR Code</h3>
              <p className="text-sm text-gray-400 mt-1">
                Open your authenticator app and scan the QR code below
              </p>
            </div>

            <div className="bg-[#080d19] border border-gray-800 rounded-lg p-5 flex flex-col items-center space-y-4">
              <div className="bg-white p-3 rounded-xl">
                <img src={setupData.qrCode} alt="2FA QR Code" className="w-44 h-44" />
              </div>
              <div className="w-full space-y-1.5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider text-center">Can't scan? Enter this key manually:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-amber-400 bg-gray-800/50 px-3 py-2.5 rounded font-mono break-all select-all text-center">
                    {setupData.secret}
                  </code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(setupData.secret); toast.success("Key copied"); }}
                    className="p-2 text-gray-500 hover:text-amber-400 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="h-11 px-4 border border-gray-800 text-gray-400 font-medium rounded-lg text-sm hover:bg-gray-800/50 transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={() => setStep("verify")}
                className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2"
              >
                I've scanned the code <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* VERIFY CODE STEP */}
        {step === "verify" && (
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Verify Setup</h3>
              <p className="text-sm text-gray-400 mt-1">
                Enter the 6-digit code shown in your authenticator app
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                autoFocus
                className="w-full h-14 px-4 bg-[#080d19] border border-gray-800 rounded-lg text-2xl text-white text-center font-mono tracking-[0.5em] placeholder:text-gray-700 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <p className="text-[10px] text-gray-600 text-center">
                The code refreshes every 30 seconds
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("scan")}
                className="h-11 px-4 border border-gray-800 text-gray-400 font-medium rounded-lg text-sm hover:bg-gray-800/50 transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => enableMutation.mutate({ code: verifyCode })}
                disabled={verifyCode.length !== 6 || enableMutation.isPending}
                className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enableMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                ) : (
                  <>Verify & Continue <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* RECOVERY CODES STEP */}
        {step === "recovery" && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
                <KeyRound className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Save Recovery Codes</h3>
              <p className="text-sm text-gray-400 mt-1">
                These codes let you access your account if you lose your authenticator device. Each code can only be used once.
              </p>
            </div>

            <div className="bg-[#080d19] border border-amber-500/20 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-800/40 rounded-md">
                    <span className="text-[10px] text-gray-600 w-4">{i + 1}.</span>
                    <code className="text-sm font-mono text-white tracking-wider">{code}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-red-400 font-medium flex items-start gap-2">
                <span className="text-red-400 mt-0.5">⚠</span>
                Store these codes securely. They will NOT be shown again. Without them, you may lose access to your account.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyCodes}
                className={`flex-1 h-10 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  codesCopied
                    ? "border-green-500/30 text-green-400 bg-green-500/5"
                    : "border-gray-800 text-gray-300 hover:bg-gray-800/50"
                }`}
              >
                {codesCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {codesCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownloadCodes}
                className="flex-1 h-10 border border-gray-800 text-gray-300 font-medium rounded-lg text-sm hover:bg-gray-800/50 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>

            <button
              onClick={handleComplete}
              className="w-full h-11 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg text-sm hover:from-green-400 hover:to-green-500 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> I've saved my codes — Finish Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Recovery Codes Management ───────────────────────────────────────────────

function RecoveryCodesSection() {
  const { data: adminUser } = trpc.adminAuth.me.useQuery();
  const utils = trpc.useUtils();
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [regenPassword, setRegenPassword] = useState("");
  const [newCodes, setNewCodes] = useState<string[] | null>(null);
  const [codesCopied, setCodesCopied] = useState(false);

  const regenMutation = trpc.adminAuth.regenerateRecoveryCodes.useMutation({
    onSuccess: (data) => {
      setNewCodes(data.recoveryCodes);
      setShowRegenerate(false);
      setRegenPassword("");
      utils.adminAuth.me.invalidate();
      toast.success("New recovery codes generated");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to regenerate codes");
    },
  });

  if (!adminUser?.totpEnabled) return null;

  const remaining = adminUser?.recoveryCodesRemaining ?? 0;

  const handleCopyCodes = () => {
    if (!newCodes) return;
    navigator.clipboard.writeText(newCodes.join("\n"));
    setCodesCopied(true);
    toast.success("Recovery codes copied");
    setTimeout(() => setCodesCopied(false), 3000);
  };

  const handleDownloadCodes = () => {
    if (!newCodes) return;
    const text = `GoldVaults Admin - 2FA Recovery Codes (Regenerated)\n${"=".repeat(50)}\n\nGenerated: ${new Date().toISOString()}\n\nEach code can only be used once.\n\n${newCodes.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "goldvaults-admin-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Recovery Codes</h2>
            <p className="text-xs text-gray-500">
              {remaining} of 8 codes remaining
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          remaining <= 2 ? "bg-red-500/10 text-red-400" : remaining <= 4 ? "bg-amber-500/10 text-amber-400" : "bg-green-500/10 text-green-400"
        }`}>
          {remaining} left
        </span>
      </div>

      {remaining <= 2 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
          <p className="text-xs text-red-400">
            You're running low on recovery codes. Regenerate new ones to maintain account access.
          </p>
        </div>
      )}

      {/* Show newly generated codes */}
      {newCodes && (
        <div className="space-y-3">
          <div className="bg-[#080d19] border border-amber-500/20 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2">
              {newCodes.map((code, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-800/40 rounded-md">
                  <span className="text-[10px] text-gray-600 w-4">{i + 1}.</span>
                  <code className="text-sm font-mono text-white tracking-wider">{code}</code>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCodes}
              className={`flex-1 h-9 border rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                codesCopied ? "border-green-500/30 text-green-400" : "border-gray-800 text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              {codesCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {codesCopied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownloadCodes}
              className="flex-1 h-9 border border-gray-800 text-gray-300 font-medium rounded-lg text-xs hover:bg-gray-800/50 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
          <button
            onClick={() => setNewCodes(null)}
            className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {!newCodes && !showRegenerate && (
        <button
          onClick={() => setShowRegenerate(true)}
          className="w-full h-10 bg-gray-800/50 border border-gray-700 text-gray-300 font-medium rounded-lg text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Regenerate Recovery Codes
        </button>
      )}

      {showRegenerate && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Enter your password to generate new recovery codes. This will invalidate all existing codes.</p>
          <div className="flex gap-2">
            <input
              type="password"
              value={regenPassword}
              onChange={(e) => setRegenPassword(e.target.value)}
              placeholder="Enter password"
              className="flex-1 h-10 px-4 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              onClick={() => regenMutation.mutate({ password: regenPassword })}
              disabled={!regenPassword || regenMutation.isPending}
              className="h-10 px-4 bg-amber-500/80 text-black font-medium rounded-lg text-sm hover:bg-amber-500 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {regenMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Generate
            </button>
          </div>
          <button
            onClick={() => { setShowRegenerate(false); setRegenPassword(""); }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 2FA Status & Controls ───────────────────────────────────────────────────

function TwoFactorSection() {
  const { data: adminUser } = trpc.adminAuth.me.useQuery();
  const utils = trpc.useUtils();
  const [showWizard, setShowWizard] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);

  const disableMutation = trpc.adminAuth.disable2FA.useMutation({
    onSuccess: () => {
      toast.success("Two-factor authentication disabled");
      setShowDisableForm(false);
      setDisablePassword("");
      utils.adminAuth.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to disable 2FA");
    },
  });

  const is2FAEnabled = adminUser?.totpEnabled;

  if (showWizard) {
    return <TwoFactorWizard onClose={() => setShowWizard(false)} />;
  }

  return (
    <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${is2FAEnabled ? "bg-green-500/10" : "bg-gray-800/50"}`}>
            {is2FAEnabled ? <ShieldCheck className="w-5 h-5 text-green-400" /> : <ShieldOff className="w-5 h-5 text-gray-500" />}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Two-Factor Authentication</h2>
            <p className="text-xs text-gray-500">
              {is2FAEnabled ? "Enabled — your account is protected" : "Disabled — add an extra layer of security"}
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${is2FAEnabled ? "bg-green-500/10 text-green-400" : "bg-gray-800 text-gray-400"}`}>
          {is2FAEnabled ? "Active" : "Inactive"}
        </span>
      </div>

      {/* 2FA is OFF — show setup button */}
      {!is2FAEnabled && (
        <button
          onClick={() => setShowWizard(true)}
          className="w-full h-11 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium rounded-lg text-sm hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          <QrCode className="w-4 h-4" />
          Set Up Two-Factor Authentication
        </button>
      )}

      {/* 2FA is ON — show disable option */}
      {is2FAEnabled && !showDisableForm && (
        <button
          onClick={() => setShowDisableForm(true)}
          className="w-full h-11 bg-red-500/10 border border-red-500/30 text-red-400 font-medium rounded-lg text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
        >
          <ShieldOff className="w-4 h-4" />
          Disable 2FA
        </button>
      )}

      {is2FAEnabled && showDisableForm && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Enter your password to disable two-factor authentication. This will also delete all recovery codes.</p>
          <div className="flex gap-2">
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Enter password"
              className="flex-1 h-11 px-4 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors"
            />
            <button
              onClick={() => disableMutation.mutate({ password: disablePassword })}
              disabled={!disablePassword || disableMutation.isPending}
              className="h-11 px-5 bg-red-500/80 text-white font-medium rounded-lg text-sm hover:bg-red-500 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {disableMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
            </button>
          </div>
          <button
            onClick={() => { setShowDisableForm(false); setDisablePassword(""); }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Account Page ───────────────────────────────────────────────────────

export default function AdminAccount() {
  const { data: adminUser } = trpc.adminAuth.me.useQuery();
  const utils = trpc.useUtils();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const changeMutation = trpc.adminAuth.changeCredentials.useMutation({
    onSuccess: () => {
      toast.success("Credentials updated successfully");
      setCurrentPassword("");
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");
      utils.adminAuth.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Current password is required to make changes");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (!newUsername && !newEmail && !newPassword) {
      toast.error("Please provide at least one field to update");
      return;
    }

    changeMutation.mutate({
      currentPassword,
      ...(newUsername ? { newUsername } : {}),
      ...(newEmail ? { newEmail } : {}),
      ...(newPassword ? { newPassword } : {}),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-gray-400 mt-1">Update your admin login credentials and security settings</p>
      </div>

      {/* Current Info Card */}
      <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Current Credentials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <User className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Username</p>
              <p className="text-sm text-white font-medium">{adminUser?.username ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <Mail className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Email</p>
              <p className="text-sm text-white font-medium">{adminUser?.email ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Section */}
      <TwoFactorSection />

      {/* Recovery Codes Section */}
      <RecoveryCodesSection />

      {/* Change Credentials Form */}
      <form onSubmit={handleSubmit} className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Update Credentials</h2>

        {/* Current Password (required) */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Current Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="w-full h-11 pl-10 pr-11 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-1">Required to confirm your identity</p>
        </div>

        <hr className="border-gray-800/60" />

        {/* New Username */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">New Username</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full h-11 pl-10 pr-4 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>

        {/* New Email */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">New Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full h-11 pl-10 pr-4 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full h-11 pl-10 pr-11 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        {newPassword && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full h-11 pl-10 pr-10 bg-[#080d19] border rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors ${
                  confirmPassword && confirmPassword === newPassword
                    ? "border-green-500/50"
                    : confirmPassword
                    ? "border-red-500/50"
                    : "border-gray-800 focus:border-amber-500/50"
                }`}
              />
              {confirmPassword && confirmPassword === newPassword && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={changeMutation.isPending}
          className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {changeMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
