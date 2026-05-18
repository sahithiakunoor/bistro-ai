import { create } from "zustand";
import { API_BASE } from "../constants/api";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to The Intelligent Bistro! 🍽️ I'm your AI dining assistant. I can help you browse our menu, answer questions about dishes, and take your order. What can I get for you today?",
  timestamp: Date.now(),
};

export const useChatStore = create((set, get) => ({
  messages: [WELCOME_MESSAGE],
  loading: false,
  error: null,

  sendMessage: async (userText, cartPayload, onAction) => {
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: Date.now(),
    };
    set((s) => ({ messages: [...s.messages, userMsg], loading: true, error: null }));

    try {
      const history = get()
        .messages.filter((m) => m.id !== "welcome" && m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          cart: cartPayload,
          history,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Unknown error");

      if (data.actions?.length > 0 && onAction) {
        for (const action of data.actions) {
          onAction(action);
        }
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Done!",
        actions: data.actions,
        timestamp: Date.now(),
      };
      set((s) => ({ messages: [...s.messages, assistantMsg], loading: false }));
    } catch (err) {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: Date.now(),
      };
      set((s) => ({ messages: [...s.messages, errMsg], loading: false, error: err.message }));
    }
  },

  clearChat: () => set({ messages: [WELCOME_MESSAGE], error: null }),
}));
