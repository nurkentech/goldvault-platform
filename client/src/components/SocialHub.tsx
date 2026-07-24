import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle, Send, Image, Video, Smile, Heart, ThumbsUp, Star,
  Share2, Users, Search, Phone, Video as VideoIcon, MoreHorizontal,
  Camera, Upload, X, Check, CheckCheck, TrendingUp, Award,
  Instagram, Twitter, Facebook, Youtube, Zap, Plus, AtSign, Hash
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const FRIENDS = [
  { id: 1, name: "Alex Chen", avatar: "AC", status: "online", lastMsg: "Just bought 2oz of gold! 🥇", time: "2m", unread: 3, goldCoins: 1240 },
  { id: 2, name: "Maria Santos", avatar: "MS", status: "online", lastMsg: "Check out my mining portfolio", time: "15m", unread: 1, goldCoins: 890 },
  { id: 3, name: "James Wright", avatar: "JW", status: "away", lastMsg: "DeFi yield is insane rn", time: "1h", unread: 0, goldCoins: 3450 },
  { id: 4, name: "Priya Patel", avatar: "PP", status: "online", lastMsg: "Gold hitting ATH soon 📈", time: "2h", unread: 0, goldCoins: 2100 },
  { id: 5, name: "David Kim", avatar: "DK", status: "offline", lastMsg: "Minted my first gold bar!", time: "5h", unread: 0, goldCoins: 560 },
  { id: 6, name: "Sofia Rossi", avatar: "SR", status: "online", lastMsg: "Completed the weekly challenge", time: "1d", unread: 0, goldCoins: 4200 },
];

const MESSAGES_BY_FRIEND: Record<number, Array<{id:number;from:"me"|"them";text:string;time:string;reactions?:string[];mediaType?:"image"|"video";mediaUrl?:string}>> = {
  1: [
    { id: 1, from: "them", text: "Hey! Did you see gold prices today? 🚀", time: "10:22 AM" },
    { id: 2, from: "me", text: "Yes! Up 2.3% — I added to my GLD position", time: "10:24 AM", reactions: ["👍","🔥"] },
    { id: 3, from: "them", text: "Smart move. I just bought 2oz of physical gold through GoldVaults!", time: "10:25 AM" },
    { id: 4, from: "them", text: "Just bought 2oz of gold! 🥇", time: "10:26 AM", mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300&h=200&fit=crop" },
    { id: 5, from: "me", text: "Amazing! That earns you GoldCoins too 💰", time: "10:27 AM" },
  ],
  2: [
    { id: 1, from: "them", text: "My mining portfolio is up 18% this quarter!", time: "9:00 AM" },
    { id: 2, from: "me", text: "Which partners are you invested in?", time: "9:05 AM" },
    { id: 3, from: "them", text: "Barrick and Newmont mostly. Check out my portfolio 📊", time: "9:10 AM" },
  ],
  3: [
    { id: 1, from: "them", text: "DeFi yield on PAXG is at 5.2% APY right now", time: "8:00 AM" },
    { id: 2, from: "me", text: "That's incredible for a gold-backed asset!", time: "8:15 AM" },
    { id: 3, from: "them", text: "DeFi yield is insane rn", time: "8:20 AM" },
  ],
  4: [
    { id: 1, from: "them", text: "Technical analysis shows gold breaking resistance at $2,400", time: "Yesterday" },
    { id: 2, from: "me", text: "Agreed. The macro environment is very bullish", time: "Yesterday" },
    { id: 3, from: "them", text: "Gold hitting ATH soon 📈", time: "2h ago" },
  ],
  5: [
    { id: 1, from: "them", text: "I finally accumulated enough GoldCoins to mint!", time: "5h ago" },
    { id: 2, from: "me", text: "Congrats! How many coins did it take?", time: "5h ago" },
    { id: 3, from: "them", text: "Minted my first gold bar!", time: "5h ago" },
  ],
  6: [
    { id: 1, from: "them", text: "Completed all 5 weekly challenges 🏆", time: "1d ago" },
    { id: 2, from: "me", text: "You're crushing the leaderboard!", time: "1d ago" },
    { id: 3, from: "them", text: "Completed the weekly challenge", time: "1d ago" },
  ],
};

const EMOJIS = ["👍","❤️","🔥","🥇","💰","🚀","✨","😊"];

const PLATFORMS = [
  { name: "TikTok", icon: "🎵", color: "from-black to-gray-800", textColor: "text-white" },
  { name: "Instagram", icon: "📸", color: "from-purple-600 to-pink-500", textColor: "text-white" },
  { name: "Facebook", icon: "👥", color: "from-blue-600 to-blue-700", textColor: "text-white" },
  { name: "Twitter/X", icon: "🐦", color: "from-sky-500 to-sky-600", textColor: "text-white" },
  { name: "YouTube", icon: "▶️", color: "from-red-600 to-red-700", textColor: "text-white" },
  { name: "Snapchat", icon: "👻", color: "from-yellow-400 to-yellow-500", textColor: "text-black" },
  { name: "Lemon8", icon: "🍋", color: "from-yellow-300 to-orange-400", textColor: "text-black" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SocialHub() {
  const [selectedFriend, setSelectedFriend] = useState(FRIENDS[0]);
  const [messages, setMessages] = useState(MESSAGES_BY_FRIEND[1]);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [searchQuery, setSearchQuery] = useState("");
  const [sharedTo, setSharedTo] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectFriend = (friend: typeof FRIENDS[0]) => {
    setSelectedFriend(friend);
    setMessages(MESSAGES_BY_FRIEND[friend.id] || []);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = { id: messages.length + 1, from: "me" as const, text: inputText, time: "Just now" };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setShowEmoji(false);
  };

  const handleReaction = (msgId: number, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const existing = m.reactions || [];
      return { ...m, reactions: existing.includes(emoji) ? existing.filter(e => e !== emoji) : [...existing, emoji] };
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadType(file.type.startsWith("video") ? "video" : "image");
    const url = URL.createObjectURL(file);
    setUploadPreview(url);
    setShowMediaUpload(true);
  };

  const handleSendMedia = () => {
    if (!uploadPreview) return;
    const newMsg = {
      id: messages.length + 1,
      from: "me" as const,
      text: uploadType === "image" ? "📸 Shared a photo" : "🎥 Shared a video",
      time: "Just now",
      mediaType: uploadType,
      mediaUrl: uploadPreview,
    };
    setMessages(prev => [...prev, newMsg]);
    setShowMediaUpload(false);
    setUploadPreview(null);
  };

  const handleShare = (platform: string) => {
    setSharedTo(prev => prev.includes(platform) ? prev : [...prev, platform]);
    setTimeout(() => setSharedTo(prev => prev.filter(p => p !== platform)), 2000);
  };

  const filteredFriends = FRIENDS.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Social Hub</h2>
        <p className="text-slate-400">Connect with fellow gold investors, share insights, and grow together</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Friends Online", value: "4", icon: <Users className="w-5 h-5 text-green-400" /> },
          { label: "Messages Today", value: "28", icon: <MessageCircle className="w-5 h-5 text-amber-400" /> },
          { label: "Shares This Week", value: "12", icon: <Share2 className="w-5 h-5 text-blue-400" /> },
        ].map(stat => (
          <Card key={stat.label} className="bg-blue-900/40 border-blue-800/50 p-4 flex items-center gap-3">
            {stat.icon}
            <div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-12 gap-4 h-[600px]">
        {/* Friends List */}
        <div className="col-span-4 bg-blue-950/60 border border-blue-800/50 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-blue-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="w-full bg-blue-900/50 border border-blue-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredFriends.map(friend => (
              <motion.button
                key={friend.id}
                onClick={() => handleSelectFriend(friend)}
                whileHover={{ backgroundColor: "rgba(30,58,138,0.4)" }}
                className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${selectedFriend.id === friend.id ? "bg-blue-800/50 border-l-2 border-amber-500" : ""}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xs font-bold">
                    {friend.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-blue-950 ${friend.status === "online" ? "bg-green-400" : friend.status === "away" ? "bg-yellow-400" : "bg-slate-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white truncate">{friend.name}</span>
                    <span className="text-xs text-slate-500">{friend.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 truncate">{friend.lastMsg}</span>
                    {friend.unread > 0 && (
                      <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full ml-1">
                        {friend.unread}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-amber-400">🪙 {friend.goldCoins.toLocaleString()}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-span-8 bg-blue-950/60 border border-blue-800/50 rounded-xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-blue-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-sm font-bold">
                  {selectedFriend.avatar}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-blue-950 ${selectedFriend.status === "online" ? "bg-green-400" : "bg-slate-500"}`} />
              </div>
              <div>
                <div className="font-semibold text-white">{selectedFriend.name}</div>
                <div className="text-xs text-slate-400 capitalize">{selectedFriend.status} • 🪙 {selectedFriend.goldCoins.toLocaleString()} GoldCoins</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white h-8 w-8 p-0">
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white h-8 w-8 p-0">
                <VideoIcon className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-amber-400 h-8 w-8 p-0"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} group`}
                >
                  <div className={`max-w-[70%] ${msg.from === "me" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${msg.from === "me" ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-br-sm" : "bg-blue-800/60 text-slate-200 rounded-bl-sm"}`}>
                      {msg.mediaType === "image" && msg.mediaUrl && (
                        <img src={msg.mediaUrl} alt="shared" className="rounded-lg mb-2 max-w-full max-h-40 object-cover" />
                      )}
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1 ${msg.from === "me" ? "flex-row-reverse" : ""}`}>
                      <span className="text-xs text-slate-500">{msg.time}</span>
                      {msg.from === "me" && <CheckCheck className="w-3 h-3 text-amber-400" />}
                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex gap-0.5">
                          {msg.reactions.map((r, i) => (
                            <span key={i} className="text-xs bg-blue-900/60 rounded-full px-1">{r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Reaction picker (shows on hover) */}
                    <div className={`hidden group-hover:flex gap-1 ${msg.from === "me" ? "flex-row-reverse" : ""}`}>
                      {EMOJIS.slice(0, 5).map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="text-xs hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-blue-800/50">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 hover:text-amber-400 h-9 w-9 p-0"
                  onClick={() => setShowEmoji(!showEmoji)}
                >
                  <Smile className="w-5 h-5" />
                </Button>
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-12 left-0 bg-blue-900 border border-blue-700 rounded-xl p-3 flex gap-2 shadow-xl z-10"
                    >
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => { setInputText(t => t + e); setShowEmoji(false); }} className="text-xl hover:scale-125 transition-transform">
                          {e}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-amber-400 h-9 w-9 p-0"
                onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); } }}
              >
                <Image className="w-5 h-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-amber-400 h-9 w-9 p-0"
                onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = "video/*"; fileInputRef.current.click(); } }}
              >
                <Video className="w-5 h-5" />
              </Button>
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={`Message ${selectedFriend.name}...`}
                className="flex-1 bg-blue-900/50 border border-blue-700/50 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white h-9 w-9 p-0 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Upload Modal */}
      <AnimatePresence>
        {showMediaUpload && uploadPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMediaUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-blue-950 border border-blue-800 rounded-2xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Share {uploadType === "image" ? "Photo" : "Video"}</h3>
                <Button size="sm" variant="ghost" className="text-slate-400 h-8 w-8 p-0" onClick={() => setShowMediaUpload(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden mb-4 bg-blue-900/50">
                {uploadType === "image" ? (
                  <img src={uploadPreview} alt="preview" className="w-full max-h-64 object-cover" />
                ) : (
                  <video src={uploadPreview} controls className="w-full max-h-64" />
                )}
              </div>
              {/* Gold-themed filter options */}
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2">Gold Filters</p>
                <div className="flex gap-2">
                  {["None","Gold Rush","Vault","Prestige","Bullion"].map(filter => (
                    <button key={filter} className="text-xs px-2 py-1 rounded-lg bg-blue-800/60 text-slate-300 hover:bg-amber-500/30 hover:text-amber-300 transition border border-blue-700/50">
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-blue-700 text-slate-300" onClick={() => setShowMediaUpload(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white" onClick={handleSendMedia}>
                  <Send className="w-4 h-4 mr-2" /> Send to {selectedFriend.name}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cross-Platform Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-blue-950 border border-blue-800 rounded-2xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Share Your Investment Journey</h3>
                <Button size="sm" variant="ghost" className="text-slate-400 h-8 w-8 p-0" onClick={() => setShowShareModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 border border-amber-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm">🏆</div>
                  <div>
                    <div className="text-white text-sm font-semibold">My GoldVaults Portfolio</div>
                    <div className="text-amber-400 text-xs">goldvaults.us</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-900/60 rounded-lg p-2">
                    <div className="text-amber-400 font-bold text-sm">+18.4%</div>
                    <div className="text-slate-400 text-xs">Returns</div>
                  </div>
                  <div className="bg-blue-900/60 rounded-lg p-2">
                    <div className="text-amber-400 font-bold text-sm">2.3oz</div>
                    <div className="text-slate-400 text-xs">Gold Held</div>
                  </div>
                  <div className="bg-blue-900/60 rounded-lg p-2">
                    <div className="text-amber-400 font-bold text-sm">1,240</div>
                    <div className="text-slate-400 text-xs">GoldCoins</div>
                  </div>
                </div>
                <p className="text-slate-300 text-xs mt-3">Investing in gold with crypto on GoldVaults.us 🥇 Join me!</p>
              </div>
              {/* Platform Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(platform => (
                  <motion.button
                    key={platform.name}
                    onClick={() => handleShare(platform.name)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-gradient-to-r ${platform.color} ${platform.textColor} rounded-xl px-4 py-3 flex items-center gap-2 font-medium text-sm relative overflow-hidden`}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    <span>{platform.name}</span>
                    <AnimatePresence>
                      {sharedTo.includes(platform.name) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-green-500 flex items-center justify-center rounded-xl"
                        >
                          <Check className="w-5 h-5 text-white mr-1" />
                          <span className="text-white text-sm font-semibold">Shared!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center mt-4">Sharing earns you +25 GoldCoins per platform 🪙</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Community Feed Teaser */}
      <Card className="bg-blue-900/30 border-blue-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Hash className="w-5 h-5 text-amber-400" /> Community Feed
          </h3>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Live</Badge>
        </div>
        <div className="space-y-3">
          {[
            { user: "GoldTrader_99", action: "just minted a 1oz Gold Bar 🏆", time: "2m ago", coins: "+500" },
            { user: "CryptoGoldQueen", action: "completed the Weekly Challenge 🎯", time: "5m ago", coins: "+200" },
            { user: "VaultMaster_X", action: "referred 3 new investors 👥", time: "12m ago", coins: "+600" },
            { user: "DigitalAurum", action: "reached Diamond tier 💎", time: "25m ago", coins: "+1000" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between py-2 border-b border-blue-800/30 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/30 border border-amber-500/30 flex items-center justify-center text-xs text-amber-400 font-bold">
                  {item.user[0]}
                </div>
                <div>
                  <span className="text-amber-400 text-sm font-medium">@{item.user}</span>
                  <span className="text-slate-300 text-sm"> {item.action}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xs font-semibold">{item.coins} 🪙</span>
                <span className="text-slate-500 text-xs">{item.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
