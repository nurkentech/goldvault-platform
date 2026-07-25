/**
 * QrScanner Component
 * Camera-based QR code scanner using html5-qrcode
 * Used in BitcoinSend to capture external wallet addresses
 */

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QrScannerProps {
  onScan: (address: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onScan, onClose }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-scanner-container";
  const [status, setStatus] = useState<"starting" | "scanning" | "error" | "success">("starting");
  const [errorMsg, setErrorMsg] = useState("");
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [scannedValue, setScannedValue] = useState("");
  const startedRef = useRef(false);

  async function startScanner(cameraId?: string) {
    if (startedRef.current) {
      try {
        await scannerRef.current?.stop();
      } catch (_) {}
      startedRef.current = false;
    }

    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setStatus("error");
        setErrorMsg("No camera found on this device.");
        return;
      }
      setCameras(devices);
      const targetCamera = cameraId ?? devices[activeCameraIndex]?.id ?? devices[0].id;

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }

      await scannerRef.current.start(
        targetCamera,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Strip bitcoin: URI prefix if present
          const address = decodedText.replace(/^bitcoin:/i, "").split("?")[0].trim();
          setScannedValue(address);
          setStatus("success");
          startedRef.current = false;
          scannerRef.current?.stop().catch(() => {});
          setTimeout(() => {
            onScan(address);
          }, 900);
        },
        () => {} // ignore per-frame errors
      );
      startedRef.current = true;
      setStatus("scanning");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(
        err?.message?.includes("Permission")
          ? "Camera permission denied. Please allow camera access and try again."
          : err?.message ?? "Could not start camera."
      );
    }
  }

  useEffect(() => {
    startScanner();
    return () => {
      if (startedRef.current) {
        scannerRef.current?.stop().catch(() => {});
        startedRef.current = false;
      }
      try { scannerRef.current?.clear(); } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function switchCamera() {
    const next = (activeCameraIndex + 1) % cameras.length;
    setActiveCameraIndex(next);
    setStatus("starting");
    await startScanner(cameras[next]?.id);
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Scanner card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-sm bg-background rounded-2xl shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
        >
          {/* Top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Scan BTC Address</h3>
                  <p className="text-xs text-muted-foreground">Point camera at a QR code</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scanner viewport */}
            <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "1/1" }}>
              {/* html5-qrcode mounts here */}
              <div id={containerId} className="w-full h-full" />

              {/* Overlay corners */}
              {status === "scanning" && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner brackets */}
                  {[
                    "top-4 left-4 border-t-2 border-l-2 rounded-tl-lg",
                    "top-4 right-4 border-t-2 border-r-2 rounded-tr-lg",
                    "bottom-4 left-4 border-b-2 border-l-2 rounded-bl-lg",
                    "bottom-4 right-4 border-b-2 border-r-2 rounded-br-lg",
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-8 h-8 border-amber-400 ${cls}`} />
                  ))}
                  {/* Scan line animation */}
                  <motion.div
                    className="absolute left-8 right-8 h-0.5 bg-amber-400/70"
                    animate={{ top: ["20%", "80%", "20%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              )}

              {/* Starting state */}
              {status === "starting" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-8 h-8 text-amber-400" />
                  </motion.div>
                  <p className="text-white text-sm mt-3">Starting camera…</p>
                </div>
              )}

              {/* Error state */}
              {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                  <p className="text-white text-sm font-medium mb-1">Camera Error</p>
                  <p className="text-white/70 text-xs">{errorMsg}</p>
                  <button
                    onClick={() => { setStatus("starting"); startScanner(); }}
                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-amber-900"
                    style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))" }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Try Again
                  </button>
                </div>
              )}

              {/* Success state */}
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                  </motion.div>
                  <p className="text-white text-sm font-semibold mb-1">Address Captured!</p>
                  <p className="text-white/70 text-xs font-mono break-all px-2">{scannedValue}</p>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                {status === "scanning" ? "Align QR code within the frame" : ""}
              </p>
              {cameras.length > 1 && status === "scanning" && (
                <button
                  onClick={switchCamera}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Flip Camera
                </button>
              )}
            </div>

            {/* Tip */}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700">
                <strong>Tip:</strong> Scan any Bitcoin wallet QR code. The address will be automatically filled in the Send BTC form.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
