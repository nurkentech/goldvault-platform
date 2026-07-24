import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Send, MessageCircle, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  text: string;
  timestamp: Date;
}

const AI_RESPONSES = {
  greeting: "Hello! 👋 I'm your GoldVault AI Representative. I can help you with questions about our platform, pricing, investment strategies, and more. How can I assist you today?",
  pricing: "We offer three plans: **Starter (Free)** with basic gold trading, **Pro ($9.99/mo)** with DeFi yield and robo-advisory, and **Institutional (Custom)** with API access. Which interests you?",
  crypto: "We support 100+ cryptocurrencies including Bitcoin, Ethereum, Solana, and more. You can pay with any major crypto and we'll instantly convert it to gold-backed tokens (PAXG or XAUT).",
  defi: "Our DeFi integration lets you earn 2-5% APY on your gold holdings through staking, lending pools, and automated yield strategies. Your gold works for you 24/7!",
  security: "We use Multi-Party Computation (MPC) for non-custodial security. You maintain full control of your assets. We're fully regulated in the US, EU, and UK with bank-grade security.",
  yield: "Gold typically earns 2-5% APY depending on market conditions and your chosen strategy. You can also use gold as collateral for instant loans or participate in DeFi protocols.",
  demo: "I'd love to schedule a demo for you! Please provide your email and I'll connect you with our team within 24 hours.",
  default: "That's a great question! For more detailed information, I recommend scheduling a demo with our team or visiting our full platform documentation. Would you like me to help with anything else?"
};

export default function AILiveRepresentative() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("pricing") || lowerMessage.includes("price") || lowerMessage.includes("plan")) {
      return AI_RESPONSES.pricing;
    } else if (lowerMessage.includes("crypto") || lowerMessage.includes("bitcoin") || lowerMessage.includes("ethereum")) {
      return AI_RESPONSES.crypto;
    } else if (lowerMessage.includes("defi") || lowerMessage.includes("yield") || lowerMessage.includes("earn")) {
      return AI_RESPONSES.yield;
    } else if (lowerMessage.includes("security") || lowerMessage.includes("safe") || lowerMessage.includes("custody")) {
      return AI_RESPONSES.security;
    } else if (lowerMessage.includes("demo") || lowerMessage.includes("schedule") || lowerMessage.includes("call")) {
      return AI_RESPONSES.demo;
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("start")) {
      return AI_RESPONSES.greeting;
    }
    
    return AI_RESPONSES.default;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        text: getAIResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 800);
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const greeting: Message = {
        id: "greeting",
        type: "ai",
        text: AI_RESPONSES.greeting,
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpenChat}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 group"
      >
        <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse"></div>
        <MessageCircle className="w-8 h-8 relative z-10" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center text-white">1</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? "h-14" : "h-96"} w-96 max-w-[calc(100vw-24px)]`}>
      <Card className="h-full bg-slate-900 border-amber-500/30 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">GoldVault AI</h3>
              <p className="text-xs text-amber-100">Always here to help</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-2 rounded transition"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.type === "user"
                        ? "bg-amber-500 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-100 px-4 py-2 rounded-lg rounded-bl-none border border-slate-700">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-700 p-4 bg-slate-900/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-white p-2 h-auto"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
