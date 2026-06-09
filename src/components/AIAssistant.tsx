import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, Bot, User, MessageSquare } from "lucide-react";

interface AIAssistantProps {
  menu: any;
  rooms: any[];
  siteSettings: {
    restaurantName: string;
    contactPhone: string;
    whatsappNumber: string;
    operatingHours: string;
    address: string;
  };
}

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export default function AIAssistant({ menu, rooms, siteSettings }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Welcome to ${siteSettings.restaurantName}! I am your AI hospitality assistant. Ask me anything about our menu, pricing, room bookings, or operating hours!`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const compileSystemPrompt = () => {
    // Construct simplified menu representation for prompt
    let menuText = "";
    if (menu) {
      Object.keys(menu).forEach((menuSection) => {
        const subCategories = menu[menuSection];
        if (Array.isArray(subCategories)) {
          subCategories.forEach((subCat: any) => {
            menuText += `Category: ${subCat.category}\n`;
            if (Array.isArray(subCat.items)) {
              subCat.items.forEach((item: any) => {
                menuText += `- ${item.name}: ₹${item.price} (${item.desc || item.description || "No description"})\n`;
              });
            }
          });
        }
      });
    }

    // Construct rooms representation
    let roomsText = "";
    if (Array.isArray(rooms)) {
      rooms.forEach((room) => {
        const guestsText = room.guests || room.occupancy || "2 Adults";
        const amenitiesText = Array.isArray(room.amenities)
          ? room.amenities.join(", ")
          : Array.isArray(room.features)
          ? room.features.join(", ")
          : room.amenities || room.features || "None";
          
        roomsText += `- Room: ${room.name}, Price: ₹${room.price}/night, Occupancy: ${guestsText}, Amenities/Features: ${amenitiesText} (${room.description || ""})\n`;
      });
    }

    return `You are "Imperial Host", the virtual AI assistant for ${siteSettings.restaurantName}.
You are extremely welcoming, polite, helpful, and speak in an elegant hospitality style.

RESTAURANT DETAILS:
- Name: ${siteSettings.restaurantName}
- Address: ${siteSettings.address}
- Contact Phone: ${siteSettings.contactPhone}
- WhatsApp Number: ${siteSettings.whatsappNumber}
- Operating Hours: ${siteSettings.operatingHours}

AVAILABLE HOTEL ROOMS:
${roomsText}

MENU & DISHES:
${menuText}

RULES:
1. Provide accurate information based on the details above. If you do not know the answer or it's not related to the restaurant's services/facilities/menu, politely guide them back to our offerings.
2. Keep responses brief and clear (maximum 2-3 sentences).
3. If the customer wants to order or book a table/room, instruct them to click on the corresponding section on the website or message us directly on WhatsApp (${siteSettings.whatsappNumber}).
4. Answer in a friendly, conversational tone. Support both English and simple Hindi/Hinglish if the user asks in those languages.`;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue("");

    const newMessages = [
      ...messages,
      { role: "user" as const, text: userText, timestamp: new Date() },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      // Friendly fallback when VITE_GEMINI_API_KEY is not configured
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `Hi there! I am currently in Demo Mode. To activate my full AI brain, please configure the "VITE_GEMINI_API_KEY" in your .env file or hosting deployment panel. In the meantime, I can tell you that ${siteSettings.restaurantName} is located at "${siteSettings.address}"!`,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      const systemPrompt = compileSystemPrompt();
      
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nUser Query: ${userText}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              text: "I am thinking a bit too fast! Please wait 15-20 seconds before asking your next question so the free API key rate limit can reset.",
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
          return;
        }
        throw new Error(`Failed to communicate with Gemini API (Status ${response.status})`);
      }

      const data = await response.json();
      const botResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "I apologize, but I am unable to process that request right now. Please try again.";

      setMessages((prev) => [
        ...prev,
        { role: "model", text: botResponse, timestamp: new Date() },
      ]);
    } catch (e) {
      console.error("Gemini AI API Error:", e);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I am having trouble connecting to the network right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-[90vw] sm:w-[380px] h-[500px] bg-rose-950/90 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-wider uppercase">Imperial Assistant</h4>
                  <p className="text-[10px] text-rose-200/50">Online • AI Companion</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role !== "user" && (
                    <div className="w-7 h-7 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/20 shrink-0 self-end">
                      <Bot className="w-4 h-4 text-amber-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3.5 rounded-[20px] text-xs font-bold leading-relaxed ${
                      msg.role === "user"
                        ? "bg-amber-400 text-rose-950 rounded-br-none"
                        : "bg-white/5 border border-white/10 text-white/90 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0 self-end">
                      <User className="w-4 h-4 text-white/70" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/20 shrink-0">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-[20px] rounded-bl-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2.5 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about food, rooms..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 focus:border-amber-400 focus:outline-none text-white text-xs font-bold rounded-2xl placeholder-white/30 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:hover:bg-amber-400 flex items-center justify-center text-rose-950 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher bubble */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-amber-400 text-rose-950 flex items-center justify-center shadow-[0_10px_30px_rgba(251,191,36,0.4)] border border-amber-300 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        {isOpen ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-600 border border-white rounded-full flex items-center justify-center animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
