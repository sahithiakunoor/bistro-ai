import React, { useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useChatStore } from "../store/chatStore";
import { useCartStore } from "../store/cartStore";
import { useMenuStore } from "../store/menuStore";
import ChatBubble from "../components/ChatBubble";

const SUGGESTIONS = [
  "What's popular today?",
  "Add 2 spicy chicken sandwiches",
  "I want something vegetarian",
  "Show me the desserts",
  "Add a beer and fries",
  "Clear my cart",
];

export default function ChatScreen({ navigation }) {
  const { messages, loading, sendMessage } = useChatStore();
  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, getTotalItems } =
    useCartStore();
  const { getItemById } = useMenuStore();
  const [input, setInput] = useState("");
  const listRef = useRef(null);
  const totalItems = getTotalItems();

  const handleAction = useCallback(
    (action) => {
      switch (action.name) {
        case "add_to_cart": {
          for (const { item_id, quantity } of action.input.items || []) {
            const item = getItemById(item_id);
            if (item) addItem(item, quantity);
          }
          break;
        }
        case "remove_from_cart": {
          removeItem(action.input.item_id);
          break;
        }
        case "update_quantity": {
          updateQuantity(action.input.item_id, action.input.quantity);
          break;
        }
        case "clear_cart": {
          clearCart();
          break;
        }
        default:
          break;
      }
    },
    [getItemById, addItem, removeItem, updateQuantity, clearCart]
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const cartPayload = cartItems.map((i) => ({ id: i.id, quantity: i.quantity }));
    await sendMessage(text, cartPayload, handleAction);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [input, loading, cartItems, sendMessage, handleAction]);

  const handleSuggestion = useCallback(
    async (text) => {
      if (loading) return;
      const cartPayload = cartItems.map((i) => ({ id: i.id, quantity: i.quantity }));
      await sendMessage(text, cartPayload, handleAction);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [loading, cartItems, sendMessage, handleAction]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiDot} />
          <View>
            <Text style={styles.headerTitle}>Bistro AI</Text>
            <Text style={styles.headerSub}>Your dining assistant</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate("Cart")}>
          <Ionicons name="bag-outline" size={20} color={COLORS.text} />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing indicator */}
      {loading && (
        <View style={styles.typingRow}>
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.typingText}>Bistro AI is thinking…</Text>
          </View>
        </View>
      )}

      {/* Suggestions */}
      {messages.length <= 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsLabel}>Try saying:</Text>
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestion}
                onPress={() => handleSuggestion(s)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything or place an order…"
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Ionicons
              name={loading ? "hourglass-outline" : "send"}
              size={18}
              color={!input.trim() || loading ? COLORS.textMuted : COLORS.background}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  headerSub: { color: COLORS.textSecondary, fontSize: 12 },
  cartBtn: {
    position: "relative",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.badge,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: "700" },
  messageList: { padding: 8, paddingBottom: 16 },
  typingRow: { paddingHorizontal: 16, paddingBottom: 8 },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surface,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typingText: { color: COLORS.textSecondary, fontSize: 13 },
  suggestionsContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  suggestionsLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 6 },
  suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  suggestion: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: { color: COLORS.textSecondary, fontSize: 12 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: COLORS.surface },
});
