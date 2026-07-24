/**
 * AddressBook Component
 * Design: Dark navy & gold — matches the original GoldVaults dark theme
 * Allows users to save, label, and quickly select frequently used BTC addresses
 * Persisted to localStorage for session continuity
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Star,
  StarOff,
  Copy,
  Search,
  Wallet,
  ChevronRight,
  Tag,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  tag?: string;
  favorite: boolean;
  createdAt: number;
  lastUsed?: number;
}

interface AddressBookProps {
  /** Called when user selects an address to use */
  onSelect: (address: string, label: string) => void;
  /** Current address in the input — used to offer "save this address" */
  currentAddress?: string;
  onClose: () => void;
}

const STORAGE_KEY = "goldvaults_address_book";

const ADDRESS_TAGS = ["Exchange", "Hardware Wallet", "Cold Storage", "Friend", "Business", "Other"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadAddresses(): SavedAddress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultAddresses();
  } catch {
    return getDefaultAddresses();
  }
}

function saveAddresses(addresses: SavedAddress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
}

function getDefaultAddresses(): SavedAddress[] {
  return [
    {
      id: "1",
      label: "My Ledger Nano",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      tag: "Hardware Wallet",
      favorite: true,
      createdAt: Date.now() - 86400000 * 30,
      lastUsed: Date.now() - 86400000 * 2,
    },
    {
      id: "2",
      label: "Coinbase Exchange",
      address: "bc1q9h6zf5hpkxfmq4mxs8x3kzqzjvw8n2t7h3d4p",
      tag: "Exchange",
      favorite: false,
      createdAt: Date.now() - 86400000 * 14,
      lastUsed: Date.now() - 86400000 * 7,
    },
    {
      id: "3",
      label: "Cold Storage Vault",
      address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      tag: "Cold Storage",
      favorite: true,
      createdAt: Date.now() - 86400000 * 60,
    },
  ];
}

function isValidBtcAddress(addr: string): boolean {
  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(addr.trim());
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Add / Edit Form ──────────────────────────────────────────────────────────

interface AddressFormProps {
  initial?: Partial<SavedAddress>;
  prefillAddress?: string;
  onSave: (data: Omit<SavedAddress, "id" | "createdAt">) => void;
  onCancel: () => void;
}

function AddressForm({ initial, prefillAddress, onSave, onCancel }: AddressFormProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [address, setAddress] = useState(initial?.address ?? prefillAddress ?? "");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [favorite, setFavorite] = useState(initial?.favorite ?? false);
  const [errors, setErrors] = useState<{ label?: string; address?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!label.trim()) e.label = "Label is required";
    if (!address.trim()) e.address = "Address is required";
    else if (!isValidBtcAddress(address)) e.address = "Not a valid Bitcoin address";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({ label: label.trim(), address: address.trim(), tag: tag || undefined, favorite, lastUsed: initial?.lastUsed });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3"
    >
      <h4 className="text-sm font-semibold text-amber-400">
        {initial?.id ? "Edit Address" : "Add New Address"}
      </h4>

      {/* Label */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Label *</label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="e.g. My Ledger, Binance, Cold Storage"
          className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/60 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all"
        />
        {errors.label && <p className="text-xs text-red-400 mt-1">{errors.label}</p>}
      </div>

      {/* Address */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Bitcoin Address *</label>
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="bc1q… or 1… or 3…"
          className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/60 rounded-lg text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all"
        />
        {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address}</p>}
      </div>

      {/* Tag */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Tag (optional)</label>
        <div className="flex flex-wrap gap-1.5">
          {ADDRESS_TAGS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(tag === t ? "" : t)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                tag === t
                  ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                  : "bg-slate-700/60 text-slate-400 border border-slate-600/40 hover:border-amber-500/30 hover:text-amber-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Favorite toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFavorite(!favorite)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
        >
          {favorite
            ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            : <StarOff className="w-3.5 h-3.5" />}
          {favorite ? "Marked as favourite" : "Mark as favourite"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-amber-900 transition-all"
          style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))" }}
        >
          <Check className="w-3.5 h-3.5" /> Save Address
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 bg-slate-700/50 hover:bg-slate-700 transition-all"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AddressBook({ onSelect, currentAddress, onClose }: AddressBookProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(loadAddresses);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string>("All");

  useEffect(() => {
    saveAddresses(addresses);
  }, [addresses]);

  const allTags = ["All", "Favourites", ...ADDRESS_TAGS.filter(t => addresses.some(a => a.tag === t))];

  const filtered = addresses
    .filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.label.toLowerCase().includes(q) || a.address.toLowerCase().includes(q);
      const matchTag =
        activeTag === "All" ? true :
        activeTag === "Favourites" ? a.favorite :
        a.tag === activeTag;
      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return (b.lastUsed ?? b.createdAt) - (a.lastUsed ?? a.createdAt);
    });

  function addAddress(data: Omit<SavedAddress, "id" | "createdAt">) {
    const newAddr: SavedAddress = { ...data, id: Date.now().toString(), createdAt: Date.now() };
    setAddresses(prev => [newAddr, ...prev]);
    setShowAddForm(false);
    toast.success("Address saved to address book!");
  }

  function updateAddress(id: string, data: Omit<SavedAddress, "id" | "createdAt">) {
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    setEditingId(null);
    toast.success("Address updated!");
  }

  function deleteAddress(id: string) {
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success("Address removed from address book.");
  }

  function toggleFavorite(id: string) {
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, favorite: !a.favorite } : a));
  }

  function handleSelect(addr: SavedAddress) {
    setAddresses(prev => prev.map(a => a.id === addr.id ? { ...a, lastUsed: Date.now() } : a));
    onSelect(addr.address, addr.label);
    onClose();
    toast.success(`Address "${addr.label}" selected!`);
  }

  function copyAddress(address: string) {
    navigator.clipboard.writeText(address).then(() => toast.success("Address copied!"));
  }

  const canSaveCurrent = currentAddress && isValidBtcAddress(currentAddress) &&
    !addresses.some(a => a.address === currentAddress);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full sm:max-w-lg bg-slate-900 border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)" }}
      >
        {/* Gold accent bar */}
        <div className="h-1 w-full rounded-t-2xl sm:rounded-t-2xl flex-shrink-0"
          style={{ background: "linear-gradient(90deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50), oklch(0.78 0.18 65))" }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65 / 0.2), oklch(0.68 0.16 50 / 0.15))" }}
            >
              <BookOpen className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Address Book</h3>
              <p className="text-xs text-slate-500">{addresses.length} saved address{addresses.length !== 1 ? "es" : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 transition-all"
              style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Save current address prompt */}
            <AnimatePresence>
              {canSaveCurrent && !showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/8"
                >
                  <Wallet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs text-emerald-300 flex-1">
                    Save <span className="font-mono">{currentAddress!.slice(0, 10)}…</span> to your address book?
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap"
                  >
                    Save it →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add / Edit form */}
            <AnimatePresence>
              {showAddForm && !editingId && (
                <AddressForm
                  prefillAddress={currentAddress}
                  onSave={addAddress}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
            </AnimatePresence>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by label or address…"
                className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
              />
            </div>

            {/* Tag filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {allTags.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    activeTag === t
                      ? "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                      : "bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:border-amber-500/30 hover:text-amber-400"
                  }`}
                >
                  {t === "Favourites" && <Star className="w-3 h-3" />}
                  {t}
                </button>
              ))}
            </div>

            {/* Address list */}
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No addresses found</p>
                <p className="text-xs text-slate-600 mt-1">
                  {search ? "Try a different search term" : "Add your first address above"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(addr => (
                  <AnimatePresence key={addr.id}>
                    {editingId === addr.id ? (
                      <AddressForm
                        initial={addr}
                        onSave={(data) => updateAddress(addr.id, data)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="group flex items-center gap-3 p-3.5 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:border-amber-500/30 hover:bg-slate-800/70 transition-all cursor-pointer"
                        onClick={() => handleSelect(addr)}
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-900"
                          style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))" }}
                        >
                          {addr.label.slice(0, 2).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-white truncate">{addr.label}</span>
                            {addr.favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                            {addr.tag && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-700/60 text-slate-400 border border-slate-600/40 flex-shrink-0">
                                <Tag className="w-2.5 h-2.5" />{addr.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-slate-500 truncate mt-0.5">
                            {addr.address.slice(0, 14)}…{addr.address.slice(-8)}
                          </p>
                          {addr.lastUsed && (
                            <p className="text-[10px] text-slate-600 mt-0.5">Last used {timeAgo(addr.lastUsed)}</p>
                          )}
                        </div>

                        {/* Actions (visible on hover) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => toggleFavorite(addr.id)}
                            title={addr.favorite ? "Remove from favourites" : "Add to favourites"}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                          >
                            {addr.favorite
                              ? <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              : <StarOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyAddress(addr.address)}
                            title="Copy address"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setEditingId(addr.id); setShowAddForm(false); }}
                            title="Edit"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            title="Delete"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Select arrow */}
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-white/8 flex-shrink-0">
          <p className="text-xs text-slate-600 text-center">
            Tap any address to select it · Hover for edit options · Saved locally on this device
          </p>
        </div>
      </motion.div>
    </div>
  );
}
