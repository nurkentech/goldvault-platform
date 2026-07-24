import { useLocation } from "wouter";
import { Globe } from "lucide-react";
import { Language, useI18n } from "@/contexts/I18nContext";

export default function LanguageSwitcher() {
  const [location] = useLocation(); const { language, setLanguage, t } = useI18n();
  if (location.startsWith("/dashboard") || location.startsWith("/admin")) return null;
  return <label className="fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-xl border border-white/10 bg-background/90 px-3 py-2 shadow-xl backdrop-blur">
    <Globe className="w-4 h-4 text-amber-500" aria-hidden="true"/><span className="sr-only">{t("Language")}</span>
    <select aria-label={t("Language")} value={language} onChange={(event)=>setLanguage(event.target.value as Language)} className="bg-transparent text-sm"><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option><option value="ar">العربية</option><option value="pt">Português</option></select>
  </label>;
}
