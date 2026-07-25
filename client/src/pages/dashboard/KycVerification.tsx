/**
 * KYC Verification — Upload identity documents to unlock higher limits
 */
import { useState, useRef } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Shield, Upload, FileCheck, AlertCircle, CheckCircle2, Clock,
  XCircle, Camera, CreditCard, FileText, User, Loader2, X,
  ArrowRight, ArrowLeft, Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DOC_TYPES = [
  { value: "passport" as const, label: "Passport", icon: <FileText className="w-5 h-5" />, desc: "International passport (photo page)" },
  { value: "drivers_license" as const, label: "Driver's License", icon: <CreditCard className="w-5 h-5" />, desc: "Government-issued driver's license" },
  { value: "national_id" as const, label: "National ID Card", icon: <User className="w-5 h-5" />, desc: "Government-issued national identity card" },
];

const KYC_LIMITS = [
  { tier: "Unverified", withdrawalLimit: "$500/day", features: ["Basic trading", "Limited deposits"] },
  { tier: "Verified", withdrawalLimit: "$50,000/day", features: ["Full trading access", "Higher limits", "Fiat withdrawals", "Gold minting"] },
];

export default function KycVerification() {
  return (
    <UserDashboardLayout>
      <KycContent />
    </UserDashboardLayout>
  );
}

function KycContent() {
  const [step, setStep] = useState(1); // 1: doc type, 2: upload docs, 3: selfie, 4: review
  const [docType, setDocType] = useState<"passport" | "drivers_license" | "national_id">("passport");
  const [docFront, setDocFront] = useState<File | null>(null);
  const [docBack, setDocBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const profileQuery = trpc.user.profile.useQuery();
  const kycDocsQuery = trpc.user.kycDocuments.useQuery();
  const submitKyc = trpc.user.submitKyc.useMutation({
    onSuccess: () => {
      toast.success("KYC documents submitted!", { description: "We'll review your documents within 24 hours." });
      profileQuery.refetch();
      kycDocsQuery.refetch();
    },
    onError: (e) => toast.error("Submission failed", { description: e.message }),
  });

  const kycStatus = profileQuery.data?.kycStatus ?? "unverified";
  const kycDocs = kycDocsQuery.data ?? [];

  if (profileQuery.isLoading || kycDocsQuery.isLoading) {
    return (
      <div className="space-y-5 animate-pulse" aria-label="Loading verification status">
        <div className="h-14 rounded-xl bg-white/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-32 rounded-2xl bg-white/5" />
          <div className="h-32 rounded-2xl bg-white/5" />
        </div>
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    );
  }

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch("/api/upload", { method: "POST", body: formData });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error || "Upload failed");
    }
    const data = await resp.json();
    return data.url;
  }

  async function handleSubmit() {
    if (!docFront || !selfie) {
      toast.error("Please upload all required documents");
      return;
    }

    try {
      const [frontUrl, selfieUrl, backUrl, addressUrl] = await Promise.all([
        uploadFile(docFront),
        uploadFile(selfie),
        docBack ? uploadFile(docBack) : Promise.resolve(undefined),
        proofOfAddress ? uploadFile(proofOfAddress) : Promise.resolve(undefined),
      ]);

      submitKyc.mutate({
        documentType: docType,
        documentFrontUrl: frontUrl,
        selfieUrl,
        documentBackUrl: backUrl,
        proofOfAddressUrl: addressUrl,
      });
    } catch {
      toast.error("Failed to upload documents. Please try again.");
    }
  }

  // If already verified or pending
  if (kycStatus === "verified") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Identity Verification</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your identity has been verified</p>
        </div>
        <Card className="p-4 sm:p-8 text-center bg-green-500/5 border-green-500/20">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Verification Complete</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your identity has been verified. You now have access to higher withdrawal limits and all platform features.
          </p>
          <div className="mt-6 p-4 bg-card border border-border rounded-xl max-w-sm mx-auto">
            <p className="text-xs text-muted-foreground mb-1">Daily Withdrawal Limit</p>
            <p className="text-2xl font-bold text-green-400">$50,000</p>
          </div>
        </Card>
      </div>
    );
  }

  if (kycStatus === "pending") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Identity Verification</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your documents are under review</p>
        </div>
        <Card className="p-4 sm:p-8 text-center bg-amber-500/5 border-amber-500/20">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Under Review</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your identity documents are being reviewed by our compliance team. This usually takes up to 24 hours.
          </p>
          {kycDocs.length > 0 && (
            <div className="mt-6 p-4 bg-card border border-border rounded-xl max-w-sm mx-auto text-left">
              <p className="text-xs text-muted-foreground mb-2">Submitted Documents</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-foreground capitalize">{kycDocs[0].documentType.replace("_", " ")}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">Pending</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span className="text-foreground">Selfie verification</span>
                  <Badge variant="secondary" className="text-xs ml-auto">Pending</Badge>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Rejected - allow resubmission
  const isRejected = kycStatus === "rejected";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Identity Verification</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isRejected ? "Your previous submission was rejected. Please resubmit with clearer documents." : "Verify your identity to unlock higher limits and full platform access."}
        </p>
      </div>

      {isRejected && kycDocs.length > 0 && kycDocs[0].rejectionReason && (
        <Card className="p-4 bg-red-500/5 border-red-500/20">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Rejection Reason</p>
              <p className="text-sm text-muted-foreground mt-0.5">{kycDocs[0].rejectionReason}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Limits comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {KYC_LIMITS.map((limit, i) => (
          <Card key={limit.tier} className={`p-4 border ${i === 1 ? "border-green-500/30 bg-green-500/5" : "border-border bg-card"}`}>
            <div className="flex items-center gap-2 mb-3">
              {i === 0 ? <AlertCircle className="w-4 h-4 text-muted-foreground" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
              <h4 className="font-semibold text-foreground text-sm">{limit.tier}</h4>
              {i === 0 && kycStatus === "unverified" && <Badge variant="secondary" className="text-xs ml-auto">Current</Badge>}
              {i === 1 && <Badge className="text-xs ml-auto bg-green-500/20 text-green-400 border-green-500/30">Goal</Badge>}
            </div>
            <p className="text-lg font-bold text-foreground mb-2">{limit.withdrawalLimit}</p>
            <ul className="space-y-1">
              {limit.features.map(f => (
                <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 px-2">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            {s < 4 && <div className={`h-0.5 flex-1 rounded transition-colors ${step > s ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between px-2 text-xs text-muted-foreground">
        <span>Document Type</span>
        <span>Upload</span>
        <span>Selfie</span>
        <span>Review</span>
      </div>

      {/* Step 1: Document Type */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <Card className="p-5 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Select Document Type</h3>
            <div className="space-y-3">
              {DOC_TYPES.map(dt => (
                <button
                  key={dt.value}
                  onClick={() => setDocType(dt.value)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${docType === dt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${docType === dt.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {dt.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{dt.label}</p>
                    <p className="text-xs text-muted-foreground">{dt.desc}</p>
                  </div>
                  {docType === dt.value && <CheckCircle2 className="w-5 h-5 text-primary ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </Card>
          <div className="flex justify-end">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl text-sm transition hover:opacity-90 active:scale-[0.97]">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Upload Documents */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <Card className="p-5 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-1">Upload Document Photos</h3>
            <p className="text-sm text-muted-foreground mb-4">Take clear photos of your {DOC_TYPES.find(d => d.value === docType)?.label}.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front */}
              <FileUploadBox
                label="Front Side *"
                file={docFront}
                inputRef={frontRef}
                onFileChange={setDocFront}
                accept="image/*"
              />
              {/* Back */}
              <FileUploadBox
                label={`Back Side ${docType === "passport" ? "(optional)" : "*"}`}
                file={docBack}
                inputRef={backRef}
                onFileChange={setDocBack}
                accept="image/*"
              />
            </div>

            <div className="mt-4">
              <FileUploadBox
                label="Proof of Address (optional)"
                subtitle="Utility bill or bank statement from the last 3 months"
                file={proofOfAddress}
                inputRef={addressRef}
                onFileChange={setProofOfAddress}
                accept="image/*,.pdf"
              />
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-blue-400 mb-0.5">Tips for approval:</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Ensure all text is clearly readable</li>
                  <li>No glare, shadows, or obstructions</li>
                  <li>Full document visible within frame</li>
                  <li>File size under 10MB per image</li>
                </ul>
              </div>
            </div>
          </Card>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-sm font-medium transition">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => {
                if (!docFront) { toast.error("Please upload the front of your document"); return; }
                setStep(3);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl text-sm transition hover:opacity-90 active:scale-[0.97]"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Selfie */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <Card className="p-5 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-1">Selfie Verification</h3>
            <p className="text-sm text-muted-foreground mb-4">Take a clear selfie holding your document next to your face.</p>

            <div className="max-w-sm mx-auto">
              <FileUploadBox
                label="Selfie with Document *"
                subtitle="Hold your ID next to your face"
                file={selfie}
                inputRef={selfieRef}
                onFileChange={setSelfie}
                accept="image/*"
                large
              />
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-blue-400 mb-0.5">Selfie requirements:</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Face clearly visible, looking at camera</li>
                  <li>Document held next to your face</li>
                  <li>Good lighting, no filters</li>
                  <li>Both your face and document text must be readable</li>
                </ul>
              </div>
            </div>
          </Card>
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-sm font-medium transition">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => {
                if (!selfie) { toast.error("Please upload a selfie"); return; }
                setStep(4);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl text-sm transition hover:opacity-90 active:scale-[0.97]"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <Card className="p-5 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Review & Submit</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Document Type</span>
                </div>
                <span className="text-sm font-medium text-foreground capitalize">{docType.replace("_", " ")}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Front Side</span>
                </div>
                <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {docFront?.name}</span>
              </div>
              {docBack && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Back Side</span>
                  </div>
                  <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {docBack.name}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Selfie</span>
                </div>
                <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {selfie?.name}</span>
              </div>
              {proofOfAddress && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Proof of Address</span>
                  </div>
                  <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {proofOfAddress.name}</span>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                By submitting, you confirm that all documents are genuine and belong to you. Fraudulent submissions will result in permanent account suspension.
              </p>
            </div>
          </Card>
          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-sm font-medium transition">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitKyc.isPending}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl text-sm transition disabled:opacity-60 active:scale-[0.97]"
            >
              {submitKyc.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {submitKyc.isPending ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FileUploadBox({ label, subtitle, file, inputRef, onFileChange, accept, large }: {
  label: string;
  subtitle?: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (f: File | null) => void;
  accept: string;
  large?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-1.5">{label}</p>
      {subtitle && <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-primary/50 bg-muted/30"} ${large ? "py-12" : "py-6"}`}
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <p className="text-sm text-foreground font-medium truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button
              onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-1"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, or PDF up to 10MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            if (f.size > 10 * 1024 * 1024) {
              toast.error("File too large", { description: "Maximum file size is 10MB." });
              return;
            }
            onFileChange(f);
          }
        }}
      />
    </div>
  );
}
