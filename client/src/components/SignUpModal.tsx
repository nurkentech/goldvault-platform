/**
 * SignUpModal Component
 * Real OTP flow: calls trpc.otp.send → email delivered via Resend → trpc.otp.verify
 */

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X, Mail, Phone, ArrowRight, CheckCircle2,
  AlertCircle, Shield, Sparkles, ChevronLeft, User, RefreshCw, Loader2,
} from "lucide-react";

type AuthMethod = "email" | "phone";
type Step = "method" | "credentials" | "otp" | "profile" | "success";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signup" | "login";
  successPath?: string;
}

const COUNTRY_CODES = [
  { code: "+1", flag: "🇺🇸", name: "US" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+61", flag: "🇦🇺", name: "AU" },
  { code: "+49", flag: "🇩🇪", name: "DE" },
  { code: "+33", flag: "🇫🇷", name: "FR" },
  { code: "+81", flag: "🇯🇵", name: "JP" },
  { code: "+86", flag: "🇨🇳", name: "CN" },
  { code: "+91", flag: "🇮🇳", name: "IN" },
  { code: "+55", flag: "🇧🇷", name: "BR" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
];

export default function SignUpModal({ isOpen, onClose, initialMode = "signup", successPath = "/dashboard" }: SignUpModalProps) {
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [step, setStep] = useState<Step>("method");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpTimer, setOtpTimer] = useState(60);

  const [, navigate] = useLocation();

  // tRPC mutations
  const sendOtpMutation = trpc.otp.send.useMutation();
  const verifyOtpMutation = trpc.otp.verify.useMutation();
  const updateProfileMutation = trpc.user.updateProfile.useMutation();
  const utils = trpc.useUtils();

  const identifier = authMethod === "email" ? email : `${countryCode}${phone}`;

  async function requireAuthenticatedSession() {
    await utils.auth.me.invalidate();
    const authenticatedUser = await utils.auth.me.fetch();
    if (!authenticatedUser) {
      throw new Error("Your verification succeeded, but the secure session could not be established. Please request a new code and try again.");
    }
  }

  function validateEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function validatePhone(val: string) {
    return /^\d{7,15}$/.test(val.replace(/\s/g, ""));
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  }

  function startOtpCountdown() {
    let t = 60;
    setOtpTimer(t);
    const interval = setInterval(() => {
      t--;
      setOtpTimer(t);
      if (t <= 0) clearInterval(interval);
    }, 1000);
  }

  async function handleSendOtp() {
    const newErrors: Record<string, string> = {};
    if (authMethod === "email" && !validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (authMethod === "phone" && !validatePhone(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      await sendOtpMutation.mutateAsync({
        identifier,
        method: authMethod,
      });
      setStep("otp");
      startOtpCountdown();
      toast.success(
        authMethod === "email"
          ? `Verification code sent to ${email}`
          : `Verification code sent to ${countryCode} ${phone}`,
        { description: "Check your inbox — code expires in 10 minutes" }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send verification code";
      toast.error("Could not send verification code", { description: message });
    }
  }

  async function handleVerifyOtp() {
    const code = otp.join("");
    if (code.length < 6) {
      setErrors({ otp: "Please enter the full 6-digit code" });
      return;
    }
    setErrors({});

    try {
      await verifyOtpMutation.mutateAsync({ identifier, code });
      await requireAuthenticatedSession();
      if (mode === "signup") {
        setStep("profile");
      } else {
        toast.success("Signed in successfully!", { description: "Welcome back to GoldVaults.us" });
        handleClose();
        navigate(successPath);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid verification code";
      setErrors({ otp: message });
    }
  }

  async function handleCompleteProfile() {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!username.trim()) newErrors.username = "Username is required";
    if (username && !/^[a-z0-9_]{3,20}$/.test(username)) {
      newErrors.username = "3\u201320 chars, lowercase letters, numbers, underscores only";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    try {
      await updateProfileMutation.mutateAsync({
        name: `${firstName.trim()} ${lastName.trim()}`,
        username: username.trim(),
      });
      await utils.auth.me.invalidate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to save your profile";
      setErrors({ profile: message });
      toast.error("Could not complete your profile", { description: message });
      return;
    }
    toast.success("Welcome to GoldVaults.us! \uD83C\uDF89", {
      description: "Your account has been created. You've received 500 welcome GoldCoins!",
      duration: 6000,
    });
    handleClose();
    navigate(successPath);
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("method");
      setEmail(""); setPhone(""); setOtp(["","","","","",""]);
      setFirstName(""); setLastName(""); setUsername("");
      setErrors({});
    }, 300);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 24px 80px oklch(0.22 0.04 220 / 0.18), 0 8px 24px oklch(0.22 0.04 220 / 0.12)" }}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <span className="text-xl">🏆</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
                      {step === "success" ? "Welcome!" : mode === "signup" ? "Create Account" : "Sign In"}
                    </h2>
                    <p className="text-xs text-muted-foreground">GoldVaults.us</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode toggle */}
              {step === "method" && (
                <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
                  <button
                    onClick={() => setMode("signup")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setMode("login")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Back button */}
              {step !== "method" && step !== "success" && (
                <button
                  onClick={() => {
                    if (step === "credentials") setStep("method");
                    else if (step === "otp") setStep("credentials");
                    else if (step === "profile") setStep("otp");
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}

              <AnimatePresence mode="wait">
                {/* ── METHOD SELECTION ── */}
                {step === "method" && (
                  <motion.div
                    key="method"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-muted-foreground mb-4">
                      {mode === "signup" ? "Choose how you'd like to create your account:" : "Choose how you'd like to sign in:"}
                    </p>
                    <button
                      onClick={() => { setAuthMethod("email"); setStep("credentials"); }}
                      className="w-full flex items-center gap-4 p-4 border-2 border-border rounded-xl hover:border-amber-400 hover:bg-amber-50/10 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                        <Mail className="w-5 h-5 text-blue-400 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">Email Address</p>
                        <p className="text-xs text-muted-foreground">Receive OTP to your inbox</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-amber-500 transition-colors" />
                    </button>
                    <button
                      onClick={() => { setAuthMethod("phone"); setStep("credentials"); }}
                      className="w-full flex items-center gap-4 p-4 border-2 border-border rounded-xl hover:border-amber-400 hover:bg-amber-50/10 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                        <Phone className="w-5 h-5 text-green-400 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">Phone Number</p>
                        <p className="text-xs text-muted-foreground">Receive a verification code via SMS</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-amber-500 transition-colors" />
                    </button>

                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">or continue with</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: "Google", icon: "🔵" },
                        { name: "Apple", icon: "⚫" },
                      ].map(provider => (
                        <button
                          key={provider.name}
                          onClick={() => toast.info(`${provider.name} sign-in coming soon`)}
                          className="flex items-center justify-center gap-2 p-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all duration-200"
                        >
                          <span>{provider.icon}</span> {provider.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── CREDENTIALS ── */}
                {step === "credentials" && (
                  <motion.div
                    key="credentials"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {authMethod === "email" ? (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                            className={`w-full pl-9 pr-4 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                              errors.email ? "border-red-400 focus:ring-red-400/30" : "border-border focus:ring-amber-400/40 focus:border-amber-400"
                            }`}
                          />
                        </div>
                        {errors.email && <p className="flex items-center gap-1.5 text-xs text-red-500"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Phone Number</label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={e => setCountryCode(e.target.value)}
                            className="px-2 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                          >
                            {COUNTRY_CODES.map(c => (
                              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                            ))}
                          </select>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="tel"
                              placeholder="555 000 0000"
                              value={phone}
                              onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: "" })); }}
                              className={`w-full pl-9 pr-4 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                                errors.phone ? "border-red-400 focus:ring-red-400/30" : "border-border focus:ring-amber-400/40 focus:border-amber-400"
                              }`}
                            />
                          </div>
                        </div>
                        {errors.phone && <p className="flex items-center gap-1.5 text-xs text-red-500"><AlertCircle className="w-3.5 h-3.5" />{errors.phone}</p>}
                      </div>
                    )}

                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                      <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        No password is needed. We will send a one-time security code to verify your identity.
                      </p>
                    </div>

                    <button
                      onClick={handleSendOtp}
                      disabled={sendOtpMutation.isPending}
                      className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))",
                        color: "oklch(0.18 0.04 220)",
                        boxShadow: "0 2px 12px oklch(0.68 0.16 50 / 0.35)",
                      }}
                    >
                      {sendOtpMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</>
                      ) : (
                        <><ArrowRight className="w-4 h-4" /> {mode === "signup" ? "Send Verification Code" : "Send Sign-In Code"}</>
                      )}
                    </button>

                    <p className="text-xs text-center text-muted-foreground">
                      By continuing, you agree to our{" "}
                      <button onClick={() => toast.info("Terms of Service")} className="text-amber-500 hover:underline">Terms of Service</button>
                      {" "}and{" "}
                      <button onClick={() => toast.info("Privacy Policy")} className="text-amber-500 hover:underline">Privacy Policy</button>
                    </p>
                  </motion.div>
                )}

                {/* ── OTP VERIFICATION ── */}
                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                        {authMethod === "email" ? <Mail className="w-7 h-7 text-amber-400" /> : <Phone className="w-7 h-7 text-amber-400" />}
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Code sent to {authMethod === "email" ? email : `${countryCode} ${phone}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {authMethod === "email"
                          ? "Check your inbox (and spam folder) for the 6-digit code"
                          : "Enter the 6-digit verification code from your SMS"}
                      </p>
                    </div>

                    <div className="flex gap-2 justify-center">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl bg-background focus:outline-none transition-all ${
                            digit ? "border-amber-400 text-amber-400" : "border-border focus:border-amber-400"
                          }`}
                        />
                      ))}
                    </div>
                    {errors.otp && (
                      <p className="flex items-center justify-center gap-1.5 text-xs text-red-500">
                        <AlertCircle className="w-3.5 h-3.5" />{errors.otp}
                      </p>
                    )}

                    <div className="text-center text-xs text-muted-foreground">
                      {otpTimer > 0 ? (
                        <span>Resend code in <span className="font-semibold text-foreground">{otpTimer}s</span></span>
                      ) : (
                        <button
                          onClick={handleSendOtp}
                          disabled={sendOtpMutation.isPending}
                          className="flex items-center gap-1.5 text-amber-500 hover:text-amber-400 font-medium mx-auto disabled:opacity-50"
                        >
                          {sendOtpMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          Resend Code
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={otp.join("").length < 6 || verifyOtpMutation.isPending}
                      className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: otp.join("").length === 6 && !verifyOtpMutation.isPending
                          ? "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))"
                          : undefined,
                        backgroundColor: (otp.join("").length < 6 || verifyOtpMutation.isPending) ? "oklch(0.88 0.01 80)" : undefined,
                        color: otp.join("").length === 6 ? "oklch(0.18 0.04 220)" : "oklch(0.52 0.03 220)",
                        boxShadow: otp.join("").length === 6 ? "0 2px 12px oklch(0.68 0.16 50 / 0.35)" : undefined,
                      }}
                    >
                      {verifyOtpMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                      ) : (
                        <><Shield className="w-4 h-4" /> Verify Code</>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* ── PROFILE SETUP ── */}
                {step === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-muted-foreground">Almost there! Set up your profile:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">First Name</label>
                        <input
                          type="text"
                          placeholder="Jane"
                          value={firstName}
                          onChange={e => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: "" })); }}
                          className={`w-full px-3 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                            errors.firstName ? "border-red-400 focus:ring-red-400/30" : "border-border focus:ring-amber-400/40 focus:border-amber-400"
                          }`}
                        />
                        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Last Name</label>
                        <input
                          type="text"
                          placeholder="Smith"
                          value={lastName}
                          onChange={e => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: "" })); }}
                          className={`w-full px-3 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                            errors.lastName ? "border-red-400 focus:ring-red-400/30" : "border-border focus:ring-amber-400/40 focus:border-amber-400"
                          }`}
                        />
                        {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Username</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                        <input
                          type="text"
                          placeholder="janesmith"
                          value={username}
                          onChange={e => { setUsername(e.target.value.toLowerCase()); setErrors(prev => ({ ...prev, username: "" })); }}
                          className={`w-full pl-7 pr-4 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                            errors.username ? "border-red-400 focus:ring-red-400/30" : "border-border focus:ring-amber-400/40 focus:border-amber-400"
                          }`}
                        />
                      </div>
                      {errors.username && <p className="flex items-center gap-1.5 text-xs text-red-500"><AlertCircle className="w-3.5 h-3.5" />{errors.username}</p>}
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <p className="text-xs text-amber-300">
                        Welcome bonus: <strong>🪙 500 GoldCoins</strong> added to your account on sign-up!
                      </p>
                    </div>

                    {errors.profile && (
                      <p className="flex items-center gap-1.5 text-xs text-red-500">
                        <AlertCircle className="w-3.5 h-3.5" />{errors.profile}
                      </p>
                    )}

                    <button
                      onClick={handleCompleteProfile}
                      disabled={updateProfileMutation.isPending}
                      className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))",
                        color: "oklch(0.18 0.04 220)",
                        boxShadow: "0 2px 12px oklch(0.68 0.16 50 / 0.35)",
                      }}
                    >
                      {updateProfileMutation.isPending
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving profile...</>
                        : <><User className="w-4 h-4" /> Complete Profile</>}
                    </button>
                  </motion.div>
                )}

                {/* ── SUCCESS ── */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="text-center space-y-4 py-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {mode === "signup" ? "Account Created!" : "Welcome Back!"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {mode === "signup"
                          ? "Your GoldVaults.us account is ready. 500 GoldCoins have been added to your wallet!"
                          : "You're now signed in to GoldVaults.us."}
                      </p>
                    </div>
                    {mode === "signup" && (
                      <div className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <span className="text-xl">🪙</span>
                        <p className="text-sm font-semibold text-amber-300">500 GoldCoins added to your wallet!</p>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        handleClose();
                        navigate(successPath);
                      }}
                      className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))",
                        color: "oklch(0.18 0.04 220)",
                      }}
                    >
                      View My Profile \u2192
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
