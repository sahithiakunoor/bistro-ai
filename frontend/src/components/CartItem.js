import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useCartStore } from "../store/cartStore";

const ITEM_ICONS = {
  bruschetta: "🍞", calamari: "🦑", soup: "🍲", wings: "🍗",
  salmon: "🐟", steak: "🥩", chicken_sandwich: "🍔", risotto: "🍚",
  pizza: "🍕", tacos: "🌮", fries: "🍟", onion_rings: "🧅",
  salad: "🥗", garlic_bread: "🥖", lemonade: "🍋", water: "💧",
  wine: "🍷", beer: "🍺", coffee: "☕", lava_cake: "🍫",
  creme_brulee: "🍮", tiramisu: "🍰",
};

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore();
  const icon = ITEM_ICONS[item.image] || "🍽️";

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{icon}</Text>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>${(item.price * item.quantity).toFixed(2)}</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            if (item.quantity <= 1) removeItem(item.id);
            else updateQuantity(item.id, item.quantity - 1);
          }}
        >
          <Ionicons
            name={item.quantity <= 1 ? "trash-outline" : "remove"}
            size={14}
            color={item.quantity <= 1 ? COLORS.error : COLORS.primary}
          />
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  name: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  price: { color: COLORS.primary, fontSize: 13, marginTop: 2 },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  qty: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },
});
