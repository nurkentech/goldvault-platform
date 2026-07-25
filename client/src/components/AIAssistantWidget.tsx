import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot } from "lucide-react";
import CopilotPanel from "@/components/CopilotPanel";

export default function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            aria-label="Open GoldVault AI Copilot"
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 hover:scale-105"
          >
            <Bot className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed bottom-3 left-3 z-50 sm:bottom-6 sm:left-auto sm:right-6"
          >
            <CopilotPanel variant="widget" onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
