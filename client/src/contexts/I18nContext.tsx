import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export type Language = "en" | "fr" | "es" | "ar" | "pt";
const labels: Record<Language, Record<string, string>> = {
  en: { Dashboard: "Dashboard", Wallets: "Wallets", Deposit: "Deposit", Withdraw: "Withdraw", Exchange: "Exchange", Investments: "Investments", Transactions: "Transactions", Referral: "Referral", Rewards: "Rewards", Cards: "Cards", Support: "Support", Notifications: "Notifications", Security: "Security", Settings: "Settings", Marketplace: "Marketplace", "Wealth Hub": "Wealth Hub", "Developer & Partner": "Developer & Partner", Logout: "Logout", Profile: "Profile", Language: "Language" },
  fr: { Dashboard: "Tableau de bord", Wallets: "Portefeuilles", Deposit: "Dépôt", Withdraw: "Retrait", Exchange: "Échange", Investments: "Investissements", Transactions: "Transactions", Referral: "Parrainage", Rewards: "Récompenses", Cards: "Cartes", Support: "Assistance", Notifications: "Notifications", Security: "Sécurité", Settings: "Paramètres", Marketplace: "Marché P2P", "Wealth Hub": "Épargne et rendement", "Developer & Partner": "Développeur et partenaire", Logout: "Déconnexion", Profile: "Profil", Language: "Langue" },
  es: { Dashboard: "Panel", Wallets: "Billeteras", Deposit: "Depositar", Withdraw: "Retirar", Exchange: "Intercambio", Investments: "Inversiones", Transactions: "Transacciones", Referral: "Referidos", Rewards: "Recompensas", Cards: "Tarjetas", Support: "Soporte", Notifications: "Notificaciones", Security: "Seguridad", Settings: "Configuración", Marketplace: "Mercado P2P", "Wealth Hub": "Ahorro y rendimiento", "Developer & Partner": "Desarrollador y socio", Logout: "Cerrar sesión", Profile: "Perfil", Language: "Idioma" },
  ar: { Dashboard: "لوحة التحكم", Wallets: "المحافظ", Deposit: "إيداع", Withdraw: "سحب", Exchange: "تبادل", Investments: "الاستثمارات", Transactions: "المعاملات", Referral: "الإحالة", Rewards: "المكافآت", Cards: "البطاقات", Support: "الدعم", Notifications: "الإشعارات", Security: "الأمان", Settings: "الإعدادات", Marketplace: "سوق الند للند", "Wealth Hub": "الادخار والعائد", "Developer & Partner": "المطور والشريك", Logout: "تسجيل الخروج", Profile: "الملف الشخصي", Language: "اللغة" },
  pt: { Dashboard: "Painel", Wallets: "Carteiras", Deposit: "Depósito", Withdraw: "Saque", Exchange: "Câmbio", Investments: "Investimentos", Transactions: "Transações", Referral: "Indicações", Rewards: "Recompensas", Cards: "Cartões", Support: "Suporte", Notifications: "Notificações", Security: "Segurança", Settings: "Configurações", Marketplace: "Mercado P2P", "Wealth Hub": "Poupança e rendimento", "Developer & Partner": "Desenvolvedor e parceiro", Logout: "Sair", Profile: "Perfil", Language: "Idioma" },
};

const copilotLabels: Record<Language, string> = {
  en: "AI Copilot",
  fr: "Copilote IA",
  es: "Copiloto IA",
  ar: "مساعد الذكاء الاصطناعي",
  pt: "Copiloto de IA",
};

const Context = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: string) => string }>({ language: "en", setLanguage: () => undefined, t: (key) => key });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); const utils = trpc.useUtils();
  const update = trpc.user.updateProfile.useMutation({ onSuccess: () => utils.auth.me.invalidate() });
  const [language, setLocalLanguage] = useState<Language>(() => (localStorage.getItem("language") as Language | null) ?? "en");
  useEffect(() => { if (user?.preferredLanguage) setLocalLanguage(user.preferredLanguage); }, [user?.preferredLanguage]);
  useEffect(() => { localStorage.setItem("language", language); document.documentElement.lang = language; document.documentElement.dir = language === "ar" ? "rtl" : "ltr"; }, [language]);
  const value = useMemo(() => ({ language, setLanguage(next: Language) { setLocalLanguage(next); if (user) update.mutate({ preferredLanguage: next }); }, t(key: string) { return key === "AI Copilot" ? copilotLabels[language] : labels[language][key] ?? key; } }), [language, update, user]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useI18n = () => useContext(Context);
